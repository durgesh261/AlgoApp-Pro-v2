import { CandleDto, TradingTimeframe } from '@algoapp/shared';

// ============================================================================
// UAlgo Trend Line Engine
// Finds the last 2 swing highs (bearish TL) and last 2 swing lows (bullish TL)
// using a rolling window of trendLineLength bars (Pine Script default: 20).
// Returns data only — frontend draws the lines.
// ============================================================================

export const TREND_LINE_LEN = 20;

export interface TrendLineDto {
  id:          string;
  symbol:      string;
  timeframe:   TradingTimeframe;
  direction:   'BULLISH' | 'BEARISH'; // BULLISH TL = connects swing lows, BEARISH TL = connects swing highs
  startIndex:  number;
  endIndex:    number;
  startTime:   string;
  endTime:     string;
  startPrice:  number;
  endPrice:    number;
  slope:       number; // price change per bar
  isBroken:    boolean;
  brokenAtIndex?: number | undefined;
}

export class TrendLineEngine {

  // ============================================================
  // Main entry — finds bearish and bullish trend lines
  // Pine Script trendLineLength = 20
  // ============================================================
  public static detectTrendLines(
    symbol:    string,
    candles:   CandleDto[],
    timeframe: TradingTimeframe = '1H',
    len:       number = TREND_LINE_LEN
  ): TrendLineDto[] {
    const results: TrendLineDto[] = [];
    const n = candles.length;
    if (n < len * 2 + 1) return results;

    // Collect pivot highs and lows using the pivot detection window
    const pivotHighs: Array<{ idx: number; price: number; time: string }> = [];
    const pivotLows:  Array<{ idx: number; price: number; time: string }> = [];

    for (let i = len; i < n - len; i++) {
      const ph = candles[i]!.high;
      const pl = candles[i]!.low;

      let isHigh = true;
      let isLow  = true;
      for (let j = i - len; j <= i + len; j++) {
        if (j === i) continue;
        if (candles[j]!.high >= ph) isHigh = false;
        if (candles[j]!.low  <= pl) isLow  = false;
        if (!isHigh && !isLow) break;
      }
      if (isHigh) pivotHighs.push({ idx: i, price: ph, time: candles[i]!.timestamp });
      if (isLow)  pivotLows.push( { idx: i, price: pl, time: candles[i]!.timestamp });
    }

    // ── Bearish Trend Line: connects last 2 swing highs ──
    if (pivotHighs.length >= 2) {
      const ph1 = pivotHighs[pivotHighs.length - 2]!;
      const ph2 = pivotHighs[pivotHighs.length - 1]!;
      const slope = (ph2.price - ph1.price) / Math.max(1, ph2.idx - ph1.idx);

      // Check if broken: any close above projected TL after ph2
      let isBroken      = false;
      let brokenAtIndex: number | undefined;
      for (let m = ph2.idx + 1; m < n; m++) {
        const projected = ph2.price + slope * (m - ph2.idx);
        if (candles[m]!.close > projected) {
          isBroken      = true;
          brokenAtIndex = m;
          break;
        }
      }

      results.push({
        id:         `TL-BEAR-${symbol}-${ph1.idx}-${ph2.idx}`,
        symbol,
        timeframe,
        direction:  'BEARISH',
        startIndex: ph1.idx,
        endIndex:   ph2.idx,
        startTime:  ph1.time,
        endTime:    ph2.time,
        startPrice: Number(ph1.price.toFixed(4)),
        endPrice:   Number(ph2.price.toFixed(4)),
        slope:      Number(slope.toFixed(6)),
        isBroken,
        brokenAtIndex,
      });
    }

    // ── Bullish Trend Line: connects last 2 swing lows ──
    if (pivotLows.length >= 2) {
      const pl1 = pivotLows[pivotLows.length - 2]!;
      const pl2 = pivotLows[pivotLows.length - 1]!;
      const slope = (pl2.price - pl1.price) / Math.max(1, pl2.idx - pl1.idx);

      let isBroken      = false;
      let brokenAtIndex: number | undefined;
      for (let m = pl2.idx + 1; m < n; m++) {
        const projected = pl2.price + slope * (m - pl2.idx);
        if (candles[m]!.close < projected) {
          isBroken      = true;
          brokenAtIndex = m;
          break;
        }
      }

      results.push({
        id:         `TL-BULL-${symbol}-${pl1.idx}-${pl2.idx}`,
        symbol,
        timeframe,
        direction:  'BULLISH',
        startIndex: pl1.idx,
        endIndex:   pl2.idx,
        startTime:  pl1.time,
        endTime:    pl2.time,
        startPrice: Number(pl1.price.toFixed(4)),
        endPrice:   Number(pl2.price.toFixed(4)),
        slope:      Number(slope.toFixed(6)),
        isBroken,
        brokenAtIndex,
      });
    }

    return results;
  }
}
