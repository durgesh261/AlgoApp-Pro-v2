import crypto from 'crypto';
import {
  DecisionDto,
  DecisionState,
  DecisionReasonCode,
  StrategySignalOutcome,
  TradingTimeframe,
  IndicatorEngineOutput,
  BaseZone,
  ZoneDto,
} from '@algoapp/shared';

import { SessionFilterEngine } from '../filters/sessionFilterEngine.js';
import { MarketFilterEngine } from '../filters/marketFilterEngine.js';
import { SignalDeduplicationEngine } from '../deduplication/signalDeduplicationEngine.js';
import { TrendValidator } from '../validators/trendValidator.js';
import { ZoneValidator } from '../validators/zoneValidator.js';
import { MarketStructureValidator } from '../validators/marketStructureValidator.js';
import { LiquidityValidator } from '../validators/liquidityValidator.js';
import { RiskValidator } from '../validators/riskValidator.js';
import { PositionSizingEngine } from '../sizing/positionSizingEngine.js';
import { AIDecisionCenterService } from '../../ai-decision/services/aiDecisionCenter.service.js';

let decisionLogs: DecisionDto[] = [];

export interface EvaluateDecisionInput {
  symbol: string;
  timeframe: TradingTimeframe;
  currentPrice: number;
  indicators: IndicatorEngineOutput;
  activeZone?: BaseZone | ZoneDto | undefined;
  outcome?: StrategySignalOutcome | undefined;
  accountBalance?: number | undefined;
  availableMargin?: number | undefined;
  dailyLossUsed?: number | undefined;
  maxDailyLoss?: number | undefined;
  currentDrawdownPct?: number | undefined;
  maxDrawdownPct?: number | undefined;
  openPositionCount?: number | undefined;
  maxOpenPositions?: number | undefined;
  hasOpenPosition?: boolean | undefined;
  candleTimestamp?: string | undefined;
}

export class DecisionEngineService {
  public static async getDecisionLogs(): Promise<DecisionDto[]> {
    return decisionLogs;
  }

  public static clearDecisionLogs(): void {
    decisionLogs = [];
  }

  /**
   * Evaluates a trade candidate through the 10-step deterministic decision pipeline.
   */
  public static async evaluateDecision(
    inputOrSignalId: string | EvaluateDecisionInput,
    symbolArg?: string,
    currentPriceArg?: number
  ): Promise<DecisionDto> {
    // Support legacy signature or comprehensive input
    let input: EvaluateDecisionInput;

    if (typeof inputOrSignalId === 'string') {
      const symbol = symbolArg || 'BTCUSD.P';
      const currentPrice = currentPriceArg || 65000;
      input = {
        symbol,
        timeframe: '1H',
        currentPrice,
        indicators: {
          symbol,
          timeframe: '1H',
          marketStructure: { symbol, timeframe: '1H', trend: 'BULLISH', internalTrend: 'BULLISH', swingTrend: 'BULLISH', liquiditySwept: false },
          pivotsInternal: [],
          pivotsSwing: [],
          zigzagLegs: [],
          structureEvents: [],
          orderBlocks: [],
          supplyZones: [],
          demandZones: [],
          liquiditySweeps: [],
          fairValueGaps: [],
          equalHighLows: [],
          zoneScores: {},
          atr14: 500,
          atr200: 450,
          evaluatedAt: new Date().toISOString(),
        },
        outcome: StrategySignalOutcome.BUY,
      };
    } else {
      input = inputOrSignalId;
    }

    const {
      symbol,
      timeframe,
      currentPrice,
      indicators,
      activeZone,
      accountBalance = 50000,
      availableMargin = 50000,
      openPositionCount = 0,
      hasOpenPosition = false,
      candleTimestamp = new Date().toISOString(),
    } = input;

    const reasonCodes: DecisionReasonCode[] = [];

    // 1. Session Filter
    const sessionResult = SessionFilterEngine.evaluateSession(candleTimestamp);
    if (!sessionResult.allowed && sessionResult.reasonCode) {
      reasonCodes.push(sessionResult.reasonCode);
    }

    // 2. Market Regime & Volatility Filter
    const marketResult = MarketFilterEngine.evaluateMarket(indicators);
    if (!marketResult.allowed && marketResult.reasonCode) {
      reasonCodes.push(marketResult.reasonCode);
    }

    // Determine Candidate Outcome
    let outcome = input.outcome;
    if (!outcome || outcome === StrategySignalOutcome.WAIT) {
      if (activeZone) {
        outcome =
          activeZone.type === 'DEMAND'
            ? StrategySignalOutcome.BUY
            : StrategySignalOutcome.SELL;
      } else {
        outcome =
          indicators.marketStructure.trend === 'BULLISH'
            ? StrategySignalOutcome.BUY
            : StrategySignalOutcome.SELL;
      }
    }

    // 3. Trend Alignment Validator
    const trendResult = TrendValidator.validate(outcome, indicators.marketStructure);
    if (trendResult.passed && trendResult.reasonCode) {
      reasonCodes.push(trendResult.reasonCode);
    }

    // 4. Zone Validator
    const zoneResult = ZoneValidator.validate(activeZone);
    if (zoneResult.reasonCode && !reasonCodes.includes(zoneResult.reasonCode)) {
      reasonCodes.push(zoneResult.reasonCode);
    }

    // 5. Market Structure Validator (BOS / CHoCH)
    const structResult = MarketStructureValidator.validate(outcome, indicators.structureEvents || []);
    if (structResult.passed && structResult.reasonCode && !reasonCodes.includes(structResult.reasonCode)) {
      reasonCodes.push(structResult.reasonCode);
    }

    // 6. Liquidity Sweeps & FVG Validator
    const liqResult = LiquidityValidator.validate(
      outcome,
      indicators.liquiditySweeps || [],
      [] // FVGs disabled per new strategy rules
    );
    for (const code of liqResult.reasonCodes) {
      if (!reasonCodes.includes(code)) reasonCodes.push(code);
    }

    // Calculate Entry, SL, TP according to Strategy
    let entryPrice = currentPrice;
    let stopLossPrice = currentPrice;
    let slDistance = 0;

    if (activeZone) {
      const rawWidth = Math.max(0.0001, activeZone.upperPrice - activeZone.lowerPrice);
      // Width = ((Upper - Lower) / Upper) × 100  [per strategy spec]
      const widthPercent = (rawWidth / Math.max(0.0001, activeZone.upperPrice)) * 100;
      
      if (outcome === StrategySignalOutcome.BUY) {
        entryPrice = widthPercent <= 0.6 ? activeZone.upperPrice : activeZone.upperPrice - 0.25 * rawWidth;
        stopLossPrice = activeZone.lowerPrice;
      } else {
        entryPrice = widthPercent <= 0.6 ? activeZone.lowerPrice : activeZone.lowerPrice + 0.25 * rawWidth;
        stopLossPrice = activeZone.upperPrice;
      }
      slDistance = Math.abs(entryPrice - stopLossPrice);
    } else {
      const atr = indicators.atr14 || 100;
      slDistance = atr * 1.5;
      stopLossPrice = outcome === StrategySignalOutcome.BUY ? entryPrice - slDistance : entryPrice + slDistance;
    }

    entryPrice = Number(entryPrice.toFixed(4));
    stopLossPrice = Number(stopLossPrice.toFixed(4));

    // Temporary TP calculation. Real TP will be set by PositionSizingEngine.
    const takeProfitPrice = outcome === StrategySignalOutcome.BUY
        ? Number((entryPrice + slDistance * 2.0).toFixed(4))
        : Number((entryPrice - slDistance * 2.0).toFixed(4));

    // 7. Risk Validator
    const riskResult = RiskValidator.validate({
      entryPrice,
      stopLossPrice,
      takeProfitPrice,
      accountBalance,
      availableMargin,
      estimatedMarginRequired: accountBalance, // 100% margin utilization
      dailyLossUsed: 0, // Not used
      maxDailyLoss: accountBalance, // Full account limit
      currentDrawdownPct: 0,
      maxDrawdownPct: 100,
      openPositionCount,
      maxOpenPositions: 1, // Strict 1 trade max
      minRiskRewardRatio: 0, // RR is dynamic based on 60% TP target
    });
    for (const code of riskResult.reasonCodes) {
      if (!reasonCodes.includes(code)) reasonCodes.push(code);
    }

    // 8. Institutional Position Sizing (35% risk, 60% reward, max 100x leverage)
    const sizingResult = PositionSizingEngine.calculatePositionSize({
      symbol,
      accountBalance,
      entryPrice,
      stopLossPrice,
      takeProfitPrice,
      riskPercent: 35.0,
      maxLeverageCap: 100,
    });
    reasonCodes.push(DecisionReasonCode.POSITION_SIZE_CALCULATED);

    // 9. Deterministic AI Confirmation
    const aiResult = AIDecisionCenterService.confirmDecision({
      symbol,
      timeframe,
      outcome,
      activeZone,
      indicators,
      riskRewardRatio: riskResult.riskRewardRatio,
      sessionAllowed: sessionResult.allowed,
      marketAllowed: marketResult.allowed,
    });
    for (const code of aiResult.reasonCodes) {
      if (!reasonCodes.includes(code)) reasonCodes.push(code);
    }

    // 10. Anti-Duplication and Cooldown Check
    const dedupResult = SignalDeduplicationEngine.checkDuplication({
      symbol,
      timeframe,
      candleTimestamp,
      zoneId: activeZone?.id,
      hasOpenPosition,
    });
    if (!dedupResult.allowed && dedupResult.reasonCode && !reasonCodes.includes(dedupResult.reasonCode)) {
      reasonCodes.push(dedupResult.reasonCode);
    }

    // Build Reproducibility SHA256 Hash
    const inputSnapshotPayload = JSON.stringify({
      symbol,
      timeframe,
      currentPrice,
      outcome,
      sessionAllowed: sessionResult.allowed,
      marketRegime: marketResult.marketRegime,
      zoneId: activeZone?.id,
      riskRewardRatio: riskResult.riskRewardRatio,
      confidenceScore: aiResult.confidenceScore,
      candleTimestamp,
    });
    const inputSnapshotHash = crypto.createHash('sha256').update(inputSnapshotPayload).digest('hex');

    // Final Decision State Determination
    let decisionState = DecisionState.WAIT;

    if (
      !sessionResult.allowed ||
      !marketResult.allowed ||
      !dedupResult.allowed ||
      !riskResult.passed ||
      !zoneResult.passed
    ) {
      decisionState = DecisionState.SKIP;
    } else if (
      aiResult.approved &&
      aiResult.confidenceScore >= 85.0 &&
      trendResult.passed &&
      riskResult.passed
    ) {
      decisionState = DecisionState.EXECUTE;
      SignalDeduplicationEngine.recordExecution(symbol, timeframe, candleTimestamp, activeZone?.id);
    } else {
      decisionState = DecisionState.WAIT;
    }

    const decision: DecisionDto = {
      id: `DEC-${crypto.randomUUID()}`,
      signalId: `SIG-${symbol}-${Date.now()}`,
      symbol,
      timeframe,
      decisionState,
      confidenceScore: aiResult.confidenceScore,
      reasonCodes,
      inputSnapshotHash,
      sessionFilter: sessionResult,
      marketFilter: marketResult,
      riskValidation: riskResult,
      positionSizing: sizingResult,
      aiConfirmation: aiResult,
      timestamp: new Date().toISOString(),
    };

    decisionLogs.unshift(decision);
    if (decisionLogs.length > 500) {
      decisionLogs = decisionLogs.slice(0, 500);
    }

    return decision;
  }
}
