import {
  ScannerStatus,
  ScannerPairUserStatus,
  ScannerStateDto,
  ScannerSignalCandidate,
  StrategySignalOutcome,
  OrderBlockDto,
} from '@algoapp/shared';
import { eventBus } from '../../../services/EventBus.js';
import { candleEngine } from '../../../engine/CandleEngine.js';
import { IndicatorEngineService } from '../../indicator-engine/services/indicatorEngine.service.js';
import { OrderBlockWidthEngine } from '../../indicator-engine/engines/orderBlockWidthEngine.js';
import { AIDecisionCenterService } from '../../ai-decision/services/aiDecisionCenter.service.js';
import { DynamicRiskLeverageService } from './DynamicRiskLeverageService.js';
import { deltaSyncService, deltaExecutionService } from '../../delta-exchange/index.js';

export class MarketScannerService {
  private static status: ScannerStatus = 'STOPPED';
  private static readonly symbols = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];
  private static pairStates: Record<string, ScannerPairUserStatus> = {
    'BTCUSD.P': 'RUNNING',
    'ETHUSD.P': 'RUNNING',
    'SOLUSD.P': 'RUNNING',
    'XRPUSD.P': 'RUNNING',
  };
  private static evaluatedTicksCount = 0;
  private static signalsGeneratedCount = 0;
  private static executedTradesCount = 0;
  private static activeTradeSymbol: string | null = null;
  private static activeTradeId: string | null = null;
  private static activeTradeEntryPrice: number | null = null;
  private static activeTradeSLPrice: number | null = null;
  private static activeTradeTPPrice: number | null = null;
  private static activeTradeDirection: 'BUY' | 'SELL' | null = null;
  private static activeTradeOBId: string | null = null;
  private static lastScanTime: string = new Date().toISOString();
  private static isInitialized = false;

  private static pairTelemetry: Record<string, any> = {
    'BTCUSD.P': { symbol: 'BTCUSD.P', currentPrice: 0, lastTickAt: '', activeOrderBlocksCount: 0, scanState: 'SCANNING', userStatus: 'RUNNING' },
    'ETHUSD.P': { symbol: 'ETHUSD.P', currentPrice: 0, lastTickAt: '', activeOrderBlocksCount: 0, scanState: 'SCANNING', userStatus: 'RUNNING' },
    'SOLUSD.P': { symbol: 'SOLUSD.P', currentPrice: 0, lastTickAt: '', activeOrderBlocksCount: 0, scanState: 'SCANNING', userStatus: 'RUNNING' },
    'XRPUSD.P': { symbol: 'XRPUSD.P', currentPrice: 0, lastTickAt: '', activeOrderBlocksCount: 0, scanState: 'SCANNING', userStatus: 'RUNNING' },
  };

  private static latestAiDecision: any = null;

  private static scanIntervalTimer: NodeJS.Timeout | null = null;

  public static initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Listen to market ticks
    eventBus.on('market:tick', (payload: any) => {
      if (payload && payload.symbol && typeof payload.price === 'number') {
        this.handleTick(payload.symbol, payload.price);
      }
    });

    // Start background multi-pair arbitration scanner (runs every 3 seconds)
    if (!this.scanIntervalTimer) {
      this.scanIntervalTimer = setInterval(() => {
        this.scanAllPairs();
      }, 3000);
    }

    // Auto-start scanner in RUNNING state
    this.status = 'RUNNING';
  }

  public static start(): ScannerStateDto {
    this.status = 'RUNNING';
    eventBus.emit('scanner:state', this.getStatus());
    return this.getStatus();
  }

  public static pause(): ScannerStateDto {
    if (this.status === 'RUNNING') {
      this.status = 'PAUSED';
      eventBus.emit('scanner:state', this.getStatus());
    }
    return this.getStatus();
  }

  public static resume(): ScannerStateDto {
    if (this.status === 'PAUSED') {
      this.status = 'RUNNING';
      eventBus.emit('scanner:state', this.getStatus());
    }
    return this.getStatus();
  }

  public static stop(): ScannerStateDto {
    this.status = 'STOPPED';
    eventBus.emit('scanner:state', this.getStatus());
    return this.getStatus();
  }

  public static setPairStatus(symbol: string, status: ScannerPairUserStatus): ScannerStateDto {
    const sym = symbol.endsWith('.P') ? symbol : `${symbol}.P`;
    if (this.symbols.includes(sym)) {
      this.pairStates[sym] = status;
      if (this.pairTelemetry[sym]) {
        this.pairTelemetry[sym].userStatus = status;
        if (status !== 'RUNNING') {
          this.pairTelemetry[sym].scanState = status;
        } else if (this.status === 'RUNNING' && !this.activeTradeSymbol) {
          this.pairTelemetry[sym].scanState = 'SCANNING';
        }
      }
      console.log(`[MarketScanner] Pair ${sym} set to status: ${status}`);
      eventBus.emit('scanner:state', this.getStatus());
    }
    return this.getStatus();
  }

  public static pausePair(symbol: string): ScannerStateDto {
    return this.setPairStatus(symbol, 'PAUSED');
  }

  public static resumePair(symbol: string): ScannerStateDto {
    return this.setPairStatus(symbol, 'RUNNING');
  }

  public static stopPair(symbol: string): ScannerStateDto {
    return this.setPairStatus(symbol, 'STOPPED');
  }

  public static getStatus(): ScannerStateDto {
    const pairsWithStatus = { ...this.pairTelemetry };
    for (const sym of this.symbols) {
      if (pairsWithStatus[sym]) {
        pairsWithStatus[sym].userStatus = this.pairStates[sym] || 'RUNNING';
      }
    }
    return {
      status: this.activeTradeSymbol ? 'IN_TRADE' : this.status,
      symbols: [...this.symbols],
      timeframe: '1H',
      activeTradeSymbol: this.activeTradeSymbol,
      activeTradeId: this.activeTradeId,
      lastScanTime: this.lastScanTime,
      evaluatedTicksCount: this.evaluatedTicksCount,
      signalsGeneratedCount: this.signalsGeneratedCount,
      executedTradesCount: this.executedTradesCount,
      pairs: pairsWithStatus,
      pairStates: { ...this.pairStates },
      latestAiDecision: this.latestAiDecision,
    };
  }

  private static handleTick(symbol: string, currentPrice: number): void {
    if (!this.symbols.includes(symbol)) {
      // Map non .P symbol if needed
      const dotPSymbol = `${symbol}.P`;
      if (!this.symbols.includes(dotPSymbol)) return;
      symbol = dotPSymbol;
    }

    this.evaluatedTicksCount++;
    this.lastScanTime = new Date().toISOString();

    if (!this.pairTelemetry[symbol]) {
      this.pairTelemetry[symbol] = {
        symbol,
        currentPrice: 0,
        lastTickAt: '',
        activeOrderBlocksCount: 0,
        scanState: 'SCANNING',
        userStatus: this.pairStates[symbol] || 'RUNNING',
      };
    }
    this.pairTelemetry[symbol].currentPrice = currentPrice;
    this.pairTelemetry[symbol].lastTickAt = this.lastScanTime;
    const userState = this.pairStates[symbol] || 'RUNNING';
    this.pairTelemetry[symbol].userStatus = userState;

    // If an active trade exists, monitor its TP and SL
    if (this.activeTradeSymbol) {
      this.pairTelemetry[symbol].scanState = this.activeTradeSymbol === symbol ? 'LOCKED_IN_TRADE' : 'LOCKED_IN_TRADE';
      this.monitorActiveTrade(symbol, currentPrice);
      return;
    }

    if (this.status !== 'RUNNING') {
      this.pairTelemetry[symbol].scanState = this.status === 'PAUSED' ? 'PAUSED' : 'STOPPED';
      return;
    }

    if (userState !== 'RUNNING') {
      this.pairTelemetry[symbol].scanState = userState;
      return;
    }

    this.pairTelemetry[symbol].scanState = 'SCANNING';
  }

  /**
   * Periodic multi-pair scan and arbitration:
   * Scans all 4 symbols simultaneously.
   * If multiple symbols qualify simultaneously, the highest-confidence candidate wins!
   */
  public static scanAllPairs(): void {
    if (this.status !== 'RUNNING' || this.activeTradeSymbol) return;

    const qualifiedCandidates: { candidate: ScannerSignalCandidate; riskResult: any }[] = [];

    for (const symbol of this.symbols) {
      const userState = this.pairStates[symbol] || 'RUNNING';
      if (userState !== 'RUNNING') {
        if (this.pairTelemetry[symbol]) {
          this.pairTelemetry[symbol].scanState = userState;
        }
        continue;
      }

      const currentPrice = this.pairTelemetry[symbol]?.currentPrice || 0;
      if (currentPrice <= 0) continue;

      const evalResult = this.evaluatePair(symbol, currentPrice);
      if (evalResult) {
        qualifiedCandidates.push(evalResult);
      }
    }

    if (qualifiedCandidates.length === 0) return;

    // Rule: Highest-confidence symbol wins if multiple qualify simultaneously
    qualifiedCandidates.sort((a, b) => b.candidate.confidenceScore - a.candidate.confidenceScore);

    const winner = qualifiedCandidates[0]!;
    console.log(
      `[MarketScanner] Multi-pair arbitration: ${qualifiedCandidates.length} candidate(s) qualified. Winner: ${winner.candidate.symbol} (Score: ${winner.candidate.confidenceScore}%)`
    );

    this.executeTradeSetup(winner.candidate, winner.riskResult);
  }

  private static monitorActiveTrade(symbol: string, currentPrice: number): void {
    if (this.activeTradeSymbol !== symbol) return;
    if (!this.activeTradeEntryPrice || !this.activeTradeSLPrice || !this.activeTradeTPPrice) return;

    let hitTP = false;
    let hitSL = false;

    if (this.activeTradeDirection === 'BUY') {
      if (currentPrice >= this.activeTradeTPPrice) hitTP = true;
      else if (currentPrice <= this.activeTradeSLPrice) hitSL = true;
    } else if (this.activeTradeDirection === 'SELL') {
      if (currentPrice <= this.activeTradeTPPrice) hitTP = true;
      else if (currentPrice >= this.activeTradeSLPrice) hitSL = true;
    }

    if (hitTP || hitSL) {
      const exitReason = hitTP ? 'TAKE_PROFIT_HIT' : 'STOP_LOSS_HIT';
      console.log(`[MarketScanner] Trade closed for ${symbol}: ${exitReason} at price ${currentPrice}`);

      // If Order Block was used, ensure it is retired
      if (this.activeTradeOBId) {
        OrderBlockWidthEngine.markUsed(this.activeTradeOBId);
      }

      eventBus.emit('scanner:trade:closed', {
        tradeId: this.activeTradeId,
        symbol,
        exitPrice: currentPrice,
        reason: exitReason,
        timestamp: new Date().toISOString(),
      });

      // Clear active trade & immediately resume scanning!
      this.activeTradeSymbol = null;
      this.activeTradeId = null;
      this.activeTradeEntryPrice = null;
      this.activeTradeSLPrice = null;
      this.activeTradeTPPrice = null;
      this.activeTradeDirection = null;
      this.activeTradeOBId = null;
      this.status = 'RUNNING';

      eventBus.emit('scanner:state', this.getStatus());
    }
  }

  private static evaluatePair(
    symbol: string,
    currentPrice: number
  ): { candidate: ScannerSignalCandidate; riskResult: any } | null {
    const candles1H = candleEngine.get1HCandles(symbol);
    if (candles1H.length < 10) return null;

    try {
      const indicatorOutput = IndicatorEngineService.computeIndicators(candles1H, '1H', symbol);

      const orderBlocks = indicatorOutput.orderBlocks || [];
      // Filter out mitigated, invalidated, or single-use USED order blocks (Rule: First touch & single-use only)
      const validOBs = orderBlocks.filter(
        (ob: OrderBlockDto) =>
          !ob.isMitigated &&
          !ob.isInvalidated &&
          !ob.isUsed &&
          ob.touchCount <= 1 &&
          !OrderBlockWidthEngine.isUsed(ob.id)
      );

      this.pairTelemetry[symbol].activeOrderBlocksCount = validOBs.length;

      if (validOBs.length === 0) return null;

      // Find if price is touching any unmitigated active Order Block (checking freshest first)
      const reversedValidOBs = [...validOBs].reverse();
      let targetOB = reversedValidOBs[0]!;
      let isTouchingEntry = false;

      for (const ob of reversedValidOBs) {
        const priceDistancePercent = (Math.abs(currentPrice - ob.entryPrice) / ob.entryPrice) * 100;
        if (priceDistancePercent <= 0.25) {
          targetOB = ob;
          isTouchingEntry = true;
          break;
        }
      }

      this.pairTelemetry[symbol].latestOBWidthPercent = targetOB.widthPercent;

      if (!isTouchingEntry) return null;

      this.pairTelemetry[symbol].scanState = 'EVALUATING';

      const outcome = targetOB.type === 'BULLISH' ? StrategySignalOutcome.BUY : StrategySignalOutcome.SELL;

      // Evaluate 9-Factor AI Validation
      const aiResult = AIDecisionCenterService.confirmDecision({
        symbol,
        timeframe: '1H',
        outcome,
        activeZone:
          targetOB.type === 'BULLISH' ? indicatorOutput.demandZones[0] : indicatorOutput.supplyZones[0],
        indicators: indicatorOutput,
        riskRewardRatio: 1.8,
        sessionAllowed: true,
        marketAllowed: true,
      });

      this.latestAiDecision = {
        symbol,
        outcome,
        confidenceScore: aiResult.confidenceScore,
        approved: aiResult.approved,
        breakdown: aiResult.breakdown,
        evaluatedAt: new Date().toISOString(),
      };
      this.pairTelemetry[symbol].latestConfidenceScore = aiResult.confidenceScore;

      // Strictly enforce Confidence >= 85% rule
      if (aiResult.approved && aiResult.confidenceScore >= 85) {
        this.pairTelemetry[symbol].scanState = 'SIGNAL_TRIGGERED';
        this.signalsGeneratedCount++;

        // Fetch account balance from Delta Exchange
        const balances = deltaSyncService.getBalances();
        const usdtBalance =
          balances.find((b) => b.asset_symbol === 'USDT' || b.asset_symbol === 'USD')?.available_balance ||
          '1000';
        const accountBalance = Math.max(10, parseFloat(usdtBalance) || 1000);

        // Rule: 100% account balance, 35% fixed risk, 60% fixed TP, max leverage 100x
        const riskResult = DynamicRiskLeverageService.calculateRiskAndLeverage({
          accountBalance,
          entryPrice: targetOB.entryPrice,
          stopLossPrice: targetOB.stopLossPrice,
          direction: outcome === StrategySignalOutcome.BUY ? 'BUY' : 'SELL',
        });

        const candidate: ScannerSignalCandidate = {
          symbol,
          timeframe: '1H',
          direction: outcome === StrategySignalOutcome.BUY ? 'BUY' : 'SELL',
          orderBlockId: targetOB.id,
          orderBlockWidthPercent: targetOB.widthPercent,
          entryPrice: riskResult.entryPrice,
          stopLossPrice: riskResult.stopLossPrice,
          takeProfitPrice: riskResult.takeProfitPrice,
          leverage: riskResult.leverage,
          confidenceScore: aiResult.confidenceScore,
          aiBreakdown: aiResult.breakdown,
          timestamp: new Date().toISOString(),
        };

        return { candidate, riskResult };
      }
    } catch (err) {
      console.warn(`[MarketScanner] Evaluation error on ${symbol}:`, err);
    }
    return null;
  }

  private static async executeTradeSetup(candidate: ScannerSignalCandidate, risk: any): Promise<void> {
    // Single active trade lock
    if (this.activeTradeSymbol) return;

    this.activeTradeSymbol = candidate.symbol;
    this.activeTradeId = `TRD-${candidate.symbol}-${Date.now()}`;
    this.activeTradeEntryPrice = candidate.entryPrice;
    this.activeTradeSLPrice = candidate.stopLossPrice;
    this.activeTradeTPPrice = candidate.takeProfitPrice;
    this.activeTradeDirection = candidate.direction;
    this.activeTradeOBId = candidate.orderBlockId;
    this.status = 'IN_TRADE';
    this.executedTradesCount++;

    // Mark Order Block as USED immediately upon trade entry (single-use lifetime)
    OrderBlockWidthEngine.markUsed(candidate.orderBlockId);

    console.log(`[MarketScanner] Executing ${candidate.direction} trade on ${candidate.symbol} at ${candidate.entryPrice} with ${candidate.leverage}x leverage (35% SL: ${candidate.stopLossPrice}, 60% TP: ${candidate.takeProfitPrice})`);

    eventBus.emit('scanner:trade:executed', {
      tradeId: this.activeTradeId,
      symbol: candidate.symbol,
      direction: candidate.direction,
      entryPrice: candidate.entryPrice,
      stopLossPrice: candidate.stopLossPrice,
      takeProfitPrice: candidate.takeProfitPrice,
      leverage: candidate.leverage,
      positionSize: risk.positionSize,
      confidenceScore: candidate.confidenceScore,
      timestamp: new Date().toISOString(),
    });

    eventBus.emit('scanner:state', this.getStatus());

    // Submit order to Delta Exchange Order API
    try {
      await deltaExecutionService.placeOrder({
        symbol: candidate.symbol,
        side: candidate.direction === 'BUY' ? 'buy' : 'sell',
        orderType: 'market',
        size: Math.max(0.001, risk.positionSize),
        stopLoss: candidate.stopLossPrice,
        takeProfit: candidate.takeProfitPrice,
        clientOrderId: this.activeTradeId,
      });
    } catch (err) {
      console.warn('[MarketScanner] Delta order execution notice:', err);
    }
  }
}
