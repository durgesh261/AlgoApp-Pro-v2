import { CandleDto, FairValueGapDto, TradingTimeframe } from '@algoapp/shared';

/**
 * Feature flag — set to true to re-enable Fair Value Gap detection.
 * When false, detectFvgs() returns an empty array immediately;
 * the full detection logic remains intact below for future use.
 */
export const FVG_ENABLED = false;

export class FvgEngine {
  /**
   * Detects 3-bar Fair Value Gaps (FVG) and tracks their mitigation/fill state.
   */
  public static detectFvgs(
    symbol: string,
    candles: CandleDto[],
    timeframe: TradingTimeframe = '1H'
  ): FairValueGapDto[] {
    // FVG_ENABLED = false: skip all FVG computation. Flip the flag above to re-enable.
    if (!FVG_ENABLED) return [];

    const fvgs: FairValueGapDto[] = [];
    if (candles.length < 3) return fvgs;

    for (let i = 2; i < candles.length; i++) {
      const cPrev2 = candles[i - 2]!;
      const cCurr = candles[i]!;

      // 1. Bullish FVG: current candle low is strictly above candle (i - 2) high
      if (cCurr.low > cPrev2.high) {
        const lowerPrice = Number(cPrev2.high.toFixed(4));
        const upperPrice = Number(cCurr.low.toFixed(4));
        const gapWidth = Number((upperPrice - lowerPrice).toFixed(4));

        let status: 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' = 'OPEN';
        let mitigatedAtPrice: number | undefined = undefined;

        // Check forward bars for fills
        for (let m = i + 1; m < candles.length; m++) {
          const forwardCandle = candles[m]!;
          if (forwardCandle.low <= lowerPrice) {
            status = 'FILLED';
            mitigatedAtPrice = lowerPrice;
            break;
          } else if (forwardCandle.low < upperPrice) {
            status = 'PARTIALLY_FILLED';
            mitigatedAtPrice = forwardCandle.low;
          }
        }

        fvgs.push({
          id: `FVG-BULL-${symbol}-${i}`,
          symbol,
          timeframe,
          type: 'BULLISH',
          upperPrice,
          lowerPrice,
          gapWidth,
          candleIndex: i,
          candleTime: cCurr.timestamp,
          status,
          mitigatedAtPrice,
        });
      }

      // 2. Bearish FVG: current candle high is strictly below candle (i - 2) low
      if (cCurr.high < cPrev2.low) {
        const upperPrice = Number(cPrev2.low.toFixed(4));
        const lowerPrice = Number(cCurr.high.toFixed(4));
        const gapWidth = Number((upperPrice - lowerPrice).toFixed(4));

        let status: 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' = 'OPEN';
        let mitigatedAtPrice: number | undefined = undefined;

        for (let m = i + 1; m < candles.length; m++) {
          const forwardCandle = candles[m]!;
          if (forwardCandle.high >= upperPrice) {
            status = 'FILLED';
            mitigatedAtPrice = upperPrice;
            break;
          } else if (forwardCandle.high > lowerPrice) {
            status = 'PARTIALLY_FILLED';
            mitigatedAtPrice = forwardCandle.high;
          }
        }

        fvgs.push({
          id: `FVG-BEAR-${symbol}-${i}`,
          symbol,
          timeframe,
          type: 'BEARISH',
          upperPrice,
          lowerPrice,
          gapWidth,
          candleIndex: i,
          candleTime: cCurr.timestamp,
          status,
          mitigatedAtPrice,
        });
      }
    }

    return fvgs;
  }
}
