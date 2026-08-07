import { CandleDto, PivotPointDto } from '@algoapp/shared';

export type PivotPoint = PivotPointDto;

export class PivotEngine {
  /**
   * Deterministic reproduction of Pine Script ta.pivothigh()
   * A pivot high at index i is confirmed when for all leftBars high[j] <= high[i]
   * and for all rightBars high[j] < high[i].
   * The pivot is confirmed at candle index (i + rightBars).
   */
  public static pivotHigh(
    candles: CandleDto[],
    leftBars: number = 9,
    rightBars: number = leftBars
  ): PivotPointDto[] {
    const pivots: PivotPointDto[] = [];
    if (candles.length < leftBars + rightBars + 1) return pivots;

    for (let i = leftBars; i <= candles.length - 1 - rightBars; i++) {
      const current = candles[i]!;
      let isHigh = true;

      // Check left bars (inclusive of equal highs)
      for (let j = i - leftBars; j < i; j++) {
        if (candles[j]!.high > current.high) {
          isHigh = false;
          break;
        }
      }

      if (!isHigh) continue;

      // Check right bars (strict inequality to prevent duplicate adjacent pivot highs)
      for (let j = i + 1; j <= i + rightBars; j++) {
        if (candles[j]!.high >= current.high) {
          isHigh = false;
          break;
        }
      }

      if (isHigh) {
        pivots.push({
          index: i,
          time: current.timestamp,
          price: current.high,
          type: 'HIGH',
          length: leftBars,
          isSwing: leftBars >= 30,
          confirmedAtIndex: i + rightBars,
        });
      }
    }

    return pivots;
  }

  /**
   * Deterministic reproduction of Pine Script ta.pivotlow()
   * A pivot low at index i is confirmed when for all leftBars low[j] >= low[i]
   * and for all rightBars low[j] > low[i].
   * The pivot is confirmed at candle index (i + rightBars).
   */
  public static pivotLow(
    candles: CandleDto[],
    leftBars: number = 9,
    rightBars: number = leftBars
  ): PivotPointDto[] {
    const pivots: PivotPointDto[] = [];
    if (candles.length < leftBars + rightBars + 1) return pivots;

    for (let i = leftBars; i <= candles.length - 1 - rightBars; i++) {
      const current = candles[i]!;
      let isLow = true;

      // Check left bars
      for (let j = i - leftBars; j < i; j++) {
        if (candles[j]!.low < current.low) {
          isLow = false;
          break;
        }
      }

      if (!isLow) continue;

      // Check right bars (strict inequality)
      for (let j = i + 1; j <= i + rightBars; j++) {
        if (candles[j]!.low <= current.low) {
          isLow = false;
          break;
        }
      }

      if (isLow) {
        pivots.push({
          index: i,
          time: current.timestamp,
          price: current.low,
          type: 'LOW',
          length: leftBars,
          isSwing: leftBars >= 30,
          confirmedAtIndex: i + rightBars,
        });
      }
    }

    return pivots;
  }

  /**
   * Extracts both High and Low pivots sorted in chronological order
   */
  public static findPivots(
    candles: CandleDto[],
    leftBars: number = 9,
    rightBars: number = leftBars
  ): PivotPointDto[] {
    const highs = this.pivotHigh(candles, leftBars, rightBars);
    const lows = this.pivotLow(candles, leftBars, rightBars);

    return [...highs, ...lows].sort((a, b) => a.index - b.index);
  }
}
