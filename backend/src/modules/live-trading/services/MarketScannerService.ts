import { StrategyPipelineService } from '../../strategy/services/strategyPipeline.service.js';
import { ZoneDetectorService } from '../../strategy/services/zoneDetector.service.js';

import { StrategySignalService } from '../../strategy/services/strategySignal.service.js';
import { DecisionEngineService } from '../../decision/services/decisionEngine.service.js';
import { deltaSyncService } from '../../delta-exchange/index.js';
import { candleEngine } from '../../../engine/CandleEngine.js';
import { eventBus } from '../../../services/EventBus.js';
import { IndicatorEngineService } from '../../indicator-engine/services/indicatorEngine.service.js';
import { prisma } from '../../../db.js';

// Strategy §2: Only these 4 pairs
const SCANNER_SYMBOLS = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];

export type ScannerState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED';

export class MarketScannerService {
  private state: ScannerState = 'IDLE';
  private scanInterval: NodeJS.Timeout | null = null;
  private readonly SCAN_INTERVAL_MS = 1000; // 1 second tick checks
  private isTradeOpen = false;

  public startScanner(): void {
    if (this.state === 'RUNNING') return;
    
    this.state = 'RUNNING';
    console.log('[Scanner] Starting 24/7 scanner for:', SCANNER_SYMBOLS);
    
    this.scanInterval = setInterval(() => this.tick(), this.SCAN_INTERVAL_MS);
    eventBus.emit('scanner:state_changed', { state: this.state });
  }

  public pauseScanner(): void {
    if (this.state !== 'RUNNING') return;
    this.state = 'PAUSED';
    console.log('[Scanner] Paused');
    eventBus.emit('scanner:state_changed', { state: this.state });
  }

  public resumeScanner(): void {
    if (this.state !== 'PAUSED') return;
    this.state = 'RUNNING';
    console.log('[Scanner] Resumed');
    eventBus.emit('scanner:state_changed', { state: this.state });
  }

  public stopScanner(): void {
    this.state = 'STOPPED';
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    console.log('[Scanner] Stopped');
    eventBus.emit('scanner:state_changed', { state: this.state });
  }

  public getState(): ScannerState {
    return this.state;
  }

  // Stubs for live-trading.routes.ts
  public getStatus(): any { return { state: this.state, pairs: {} }; }
  public start(): any { this.startScanner(); return this.getStatus(); }
  public pause(): any { this.pauseScanner(); return this.getStatus(); }
  public resume(): any { this.resumeScanner(); return this.getStatus(); }
  public stop(): any { this.stopScanner(); return this.getStatus(); }
  public pausePair(_symbol: string): any { return this.getStatus(); }
  public resumePair(_symbol: string): any { return this.getStatus(); }
  public stopPair(_symbol: string): any { return this.getStatus(); }
  public setPairStatus(_symbol: string, _status: string): any { return this.getStatus(); }

  public setTradeOpen(isOpen: boolean): void {
    this.isTradeOpen = isOpen;
  }

  private async tick(): Promise<void> {
    if (this.state !== 'RUNNING') return;

    // ── Strategy §15: ONE TRADE MAXIMUM GATE ──
    const positions = deltaSyncService.getPositions();
    if (positions.length > 0) {
      if (!this.isTradeOpen) {
        this.isTradeOpen = true;
        eventBus.emit('scanner:trade_open_detected', { count: positions.length });
      }
      return; // Skip scanning. Trade management continues elsewhere.
    }

    // Also check via flag (redundant safety)
    if (this.isTradeOpen) {
      this.isTradeOpen = false; // Reset if no positions found
    }

    // ── Strategy §14: Collect candidates from all 4 pairs ──
    const candidates: Array<{
      symbol: string;
      signal: any;
      confidence: number;
      decision: any;
    }> = [];

    for (const symbol of SCANNER_SYMBOLS) {
      try {
        const candles = candleEngine.get1HCandles(symbol);
        if (!candles || candles.length < 20) continue;

        const currentPrice = candleEngine.getLiveCandle(symbol, '1H')?.close || 0;
        if (!currentPrice) continue;

        // 1. Detect zones from live indicator engine
        await ZoneDetectorService.detectZones(symbol);

        // 2. Evaluate signal
        const signal = await StrategySignalService.evaluateSignal(symbol, currentPrice);
        if (!signal || signal.outcome === 'WAIT') continue;

        // 3. Build indicators
        const indicators = IndicatorEngineService.computeIndicators(candles, '1H');

        // 4. Run decision engine
        const decision = await DecisionEngineService.evaluateDecision({
          symbol,
          timeframe: '1H',
          currentPrice,
          indicators,
          activeZone: signal.activeZoneId ? undefined : undefined,
          outcome: signal.outcome,
          candleTimestamp: new Date().toISOString(),
        });

        if ((decision.state as any) === 'APPROVED' && decision.confidenceScore >= 85) {
          candidates.push({
            symbol,
            signal,
            confidence: decision.confidenceScore,
            decision,
          });
        }
      } catch (err) {
        console.error(`[Scanner] Error scanning ${symbol}:`, err);
      }
    }

    // ── Strategy §14: Pick ONLY highest confidence ──
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.confidence - a.confidence);
      const best = candidates[0]!;

      // Mark zone as CONSUMED immediately (Strategy §12)
      if (best.signal.activeZoneId) {
        ZoneDetectorService.markZoneUsed(best.signal.activeZoneId);
      }

      await MarketScannerService.persistScannerState(best.symbol, 'SIGNAL_TRIGGERED', best.confidence);

      // Execute via pipeline
      try {
        await StrategyPipelineService.runPipeline({
          symbol: best.symbol,
          timeframe: '1H',
          candles: candleEngine.get1HCandles(best.symbol) || [],
          autoExecute: true,
        });
        
        this.isTradeOpen = true;
        eventBus.emit('scanner:trade:executed', { symbol: best.symbol, confidence: best.confidence });
      } catch (execErr) {
        console.error(`[Scanner] Execution failed for ${best.symbol}:`, execErr);
        // If execution failed, unmark the zone so it can be retried
        if (best.signal.activeZoneId) {
          // Optional: ZoneDetectorService.unmarkZoneUsed(best.signal.activeZoneId);
        }
      }
    }
  }

  private static async persistScannerState(
    symbol: string,
    state: string,
    _confidence: number
  ): Promise<void> {
    try {
      await prisma.scannerState.upsert({
        where: { id: 'default-scanner' },
        update: {
          state,
          activeSymbol: symbol,
          lastScanAt: new Date(),
          updatedAt: new Date(),
        },
        create: {
          id: 'default-scanner',
          state,
          activeSymbol: symbol,
          lastScanAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      console.warn('[MarketScanner] Failed to persist scanner state:', err);
    }
  }
}

export const marketScanner = new MarketScannerService();
