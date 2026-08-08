import { eventBus } from '../../../services/EventBus.js';
import { IndicatorEngineService } from '../../indicator-engine/services/indicatorEngine.service.js';
import { candleEngine } from '../../../engine/CandleEngine.js';
import { AIDecisionCenterService } from '../../ai-decision/services/aiDecisionCenter.service.js';
import { ZoneDetectorService } from '../../strategy/services/zoneDetector.service.js';

import { StrategySignalOutcome } from '@algoapp/shared';

const SCANNER_SYMBOLS = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];

export interface PairTelemetry {
  symbol: string;
  livePrice: number;
  activeOrderBlocksCount: number;
  orderBlockWidthPercent: number;
  scanState: 'IDLE' | 'SCANNING' | 'EVALUATING' | 'SIGNAL_TRIGGERED' | 'ERROR' | 'NO_DATA';
  latestConfidenceScore: number;
  lastScanAt: string;
  error?: string;
  userStatus?: 'RUNNING' | 'PAUSED' | 'STOPPED';
}

export class MarketScannerService {
  private static pairTelemetry: Record<string, PairTelemetry> = {};
  private static ticksProcessed = 0;
  private static signalsTriggered = 0;
  private static tradesExecuted = 0;
  private static state: 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED' = 'IDLE';

  public static initialize(): void {
    // Initialize telemetry for all 4 pairs
    for (const symbol of SCANNER_SYMBOLS) {
      this.pairTelemetry[symbol] = {
        symbol,
        livePrice: 0,
        activeOrderBlocksCount: 0,
        orderBlockWidthPercent: 0,
        scanState: 'IDLE',
        latestConfidenceScore: 0,
        lastScanAt: new Date().toISOString(),
        userStatus: 'RUNNING',
      };
    }

    // Listen to tick events from Delta WebSocket
    eventBus.on('ticker:live', (data: any) => {
      this.ticksProcessed++;
      const sym = this.normalizeSymbol(data.symbol);
      if (this.pairTelemetry[sym]) {
        this.pairTelemetry[sym].livePrice = parseFloat(data.price);
        this.pairTelemetry[sym].lastScanAt = new Date().toISOString();
      }
    });

    // Listen to candle updates
    eventBus.on('candle:1H:update', (data: any) => {
      if (this.state === 'RUNNING') {
        this.evaluatePair(data.symbol);
      }
    });
  }

  /**
   * Called every time a new 1H candle is built
   */
  private static async evaluatePair(symbol: string): Promise<void> {
    const normSymbol = this.normalizeSymbol(symbol);
    const telemetry = this.pairTelemetry[normSymbol];
    if (!telemetry || telemetry.userStatus !== 'RUNNING') return;

    const candles = candleEngine.get1HCandles(normSymbol);
    if (!candles || candles.length < 10) {
      telemetry.scanState = 'NO_DATA';
      return;
    }

    telemetry.scanState = 'SCANNING';

    try {
      // 1. Detect zones and persist
      const zones = await ZoneDetectorService.detectZones(normSymbol);
      const activeZones = zones.filter(
        (z: any) => z.status === 'FRESH' || z.status === 'TOUCHED'
      );
      telemetry.activeOrderBlocksCount = activeZones.length;

      if (activeZones.length > 0) {
        const latestZone = activeZones[activeZones.length - 1]!;
        telemetry.orderBlockWidthPercent = parseFloat(
          (((latestZone.upperPrice - latestZone.lowerPrice) / latestZone.upperPrice) * 100).toFixed(2)
        );
      }

      // 2. Run indicator engine for AI score
      const indicators = IndicatorEngineService.computeIndicators(candles, '1H');
      const currentPrice = telemetry.livePrice || candles[candles.length - 1]?.close || 0;

      if (currentPrice <= 0) {
        telemetry.scanState = 'NO_DATA';
        return;
      }

      // 3. Check if price is touching any zone
      let touchingZone = false;
      let bestZone = null;

      for (const zone of activeZones) {
        if (currentPrice >= zone.lowerPrice && currentPrice <= zone.upperPrice) {
          touchingZone = true;
          bestZone = zone;
          break;
        }
      }

      if (!touchingZone || !bestZone) {
        telemetry.scanState = 'SCANNING';
        telemetry.latestConfidenceScore = 0;
        return;
      }

      // 4. AI Evaluation
      telemetry.scanState = 'EVALUATING';
      const outcome = bestZone.type === 'DEMAND' ? StrategySignalOutcome.BUY : StrategySignalOutcome.SELL;

      const aiResult = await AIDecisionCenterService.confirmDecision({
        symbol: normSymbol,
        timeframe: '1H',
        outcome,
        activeZone: bestZone,
        indicators,
        riskRewardRatio: 1.71,
        sessionAllowed: true,
        marketAllowed: true,
      });

      telemetry.latestConfidenceScore = aiResult.confidenceScore;

      if (aiResult.approved && aiResult.confidenceScore >= 85) {
        telemetry.scanState = 'SIGNAL_TRIGGERED';
        this.signalsTriggered++;
        eventBus.emit('scanner:signal', {
          symbol: normSymbol,
          confidence: aiResult.confidenceScore,
          zone: bestZone,
          outcome,
        });
      } else {
        telemetry.scanState = 'SCANNING';
      }
    } catch (err: any) {
      telemetry.scanState = 'ERROR';
      telemetry.error = err.message;
      console.error(`[Scanner] Error evaluating ${normSymbol}:`, err);
    }

    telemetry.lastScanAt = new Date().toISOString();
  }

  public static getTelemetry(): PairTelemetry[] {
    return SCANNER_SYMBOLS.map((s) => this.pairTelemetry[s]).filter((t): t is PairTelemetry => t !== undefined);
  }

  public static getStats(): { ticks: number; signals: number; trades: number } {
    return {
      ticks: this.ticksProcessed,
      signals: this.signalsTriggered,
      trades: this.tradesExecuted,
    };
  }

  public static getState(): string {
    return this.state;
  }

  public static setState(state: 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED'): void {
    this.state = state;
    eventBus.emit('scanner:state_changed', { state });
  }

  public static setPairStatus(symbol: string, status: 'RUNNING' | 'PAUSED' | 'STOPPED'): void {
    const sym = this.normalizeSymbol(symbol);
    if (this.pairTelemetry[sym]) {
      this.pairTelemetry[sym].userStatus = status;
    }
  }

  private static normalizeSymbol(symbol: string): string {
    const map: Record<string, string> = {
      'BTCUSD': 'BTCUSD.P',
      'ETHUSD': 'ETHUSD.P',
      'SOLUSD': 'SOLUSD.P',
      'XRPUSD': 'XRPUSD.P',
    };
    return map[symbol] || symbol;
  }

  public static recordTradeExecuted(): void {
    this.tradesExecuted++;
  }
}
