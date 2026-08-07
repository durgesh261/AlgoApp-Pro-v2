import { DecisionReasonCode, IndicatorEngineOutput, MarketFilterResultDto } from '@algoapp/shared';

export class MarketFilterEngine {
  /**
   * Deterministically evaluates market regime and volatility suitability.
   */
  public static evaluateMarket(
    indicators: IndicatorEngineOutput,
    allowRanging: boolean = true
  ): MarketFilterResultDto {
    const atr14 = indicators.atr14 || 1;
    const atr200 = indicators.atr200 || 1;
    const atrRatio = Number((atr14 / atr200).toFixed(2));

    // 1. Extreme Volatility Outlier (e.g. news spike, flash crash)
    if (atrRatio >= 2.5) {
      return {
        allowed: false,
        marketRegime: 'VOLATILITY_OUTLIER',
        atr14,
        atr200,
        atrRatio,
        reasonCode: DecisionReasonCode.MARKET_VOLATILITY_OUTLIER,
      };
    }

    // 2. Severe Low Volatility Compression (illiquid dead range)
    if (atrRatio <= 0.25) {
      return {
        allowed: false,
        marketRegime: 'COMPRESSION',
        atr14,
        atr200,
        atrRatio,
        reasonCode: DecisionReasonCode.MARKET_COMPRESSION_LOW_ATR,
      };
    }

    // 3. Detect Trending vs Ranging
    const isTrending =
      indicators.marketStructure.trend === indicators.marketStructure.internalTrend &&
      indicators.marketStructure.trend === indicators.marketStructure.swingTrend;

    const marketRegime = isTrending ? 'TRENDING' : 'RANGING';

    if (!isTrending && !allowRanging) {
      return {
        allowed: false,
        marketRegime: 'RANGING',
        atr14,
        atr200,
        atrRatio,
      };
    }

    return {
      allowed: true,
      marketRegime,
      atr14,
      atr200,
      atrRatio,
    };
  }
}
