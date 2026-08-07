import { DecisionReasonCode, MarketStructure, StrategySignalOutcome } from '@algoapp/shared';

export interface TrendValidationResult {
  passed: boolean;
  reasonCode?: DecisionReasonCode | undefined;
  trendAgreement: boolean;
}

export class TrendValidator {
  /**
   * Deterministically validates trend alignment between trade outcome and market structure.
   */
  public static validate(
    outcome: StrategySignalOutcome,
    marketStructure: MarketStructure
  ): TrendValidationResult {
    const isBullish = marketStructure.trend === 'BULLISH';
    const isBearish = marketStructure.trend === 'BEARISH';

    const internalAligned =
      (outcome === StrategySignalOutcome.BUY && marketStructure.internalTrend === 'BULLISH') ||
      (outcome === StrategySignalOutcome.SELL && marketStructure.internalTrend === 'BEARISH');

    const swingAligned =
      (outcome === StrategySignalOutcome.BUY && marketStructure.swingTrend === 'BULLISH') ||
      (outcome === StrategySignalOutcome.SELL && marketStructure.swingTrend === 'BEARISH');

    const overallAligned =
      (outcome === StrategySignalOutcome.BUY && isBullish) ||
      (outcome === StrategySignalOutcome.SELL && isBearish);

    const passed = overallAligned && (internalAligned || swingAligned);

    return {
      passed,
      reasonCode: passed ? DecisionReasonCode.MOMENTUM_ALIGNED : undefined,
      trendAgreement: internalAligned && swingAligned,
    };
  }
}
