import { CandleDto } from '@algoapp/shared';

export interface PivotPoint {
  index: number;
  time: string;
  price: number;
  type: 'HIGH' | 'LOW';
  length: number;
}

export class PivotEngine {
  public static findPivots(candles: CandleDto[], length: number = 9): PivotPoint[] {
    const pivots: PivotPoint[] = [];
    if (candles.length < length * 2 + 1) return pivots;

    for (let i = length; i < candles.length - length; i++) {
      const current = candles[i]!;
      let isHigh = true;
      let isLow = true;

      for (let j = i - length; j <= i + length; j++) {
        if (j === i) continue;
        if (candles[j]!.high > current.high) isHigh = false;
        if (candles[j]!.low < current.low) isLow = false;
      }

      if (isHigh) {
        pivots.push({
          index: i,
          time: current.timestamp,
          price: current.high,
          type: 'HIGH',
          length,
        });
      }

      if (isLow) {
        pivots.push({
          index: i,
          time: current.timestamp,
          price: current.low,
          type: 'LOW',
          length,
        });
      }
    }

    return pivots;
  }
}
