import {
  CandleDto,
  EqualHighLowDto,
  PivotPointDto,
  TradingTimeframe,
} from '@algoapp/shared';
import { PatZoneEngine } from './patZoneEngine.js';

export class EqhEqlEngine {
  /**
   * Detects Equal Highs (EQH) and Equal Lows (EQL) within 0.1 * ATR tolerance.
   */
  public static detectEqhEql(
    symbol: string,
    candles: CandleDto[],
    pivots: PivotPointDto[],
    timeframe: TradingTimeframe = '1H'
  ): EqualHighLowDto[] {
    const results: EqualHighLowDto[] = [];
    if (candles.length < 10 || pivots.length < 2) return results;

    const atr = PatZoneEngine.calculateAtr(candles, 14);
    const tolerance = Math.max(atr * 0.1, 0.5);

    const highPivots = pivots.filter((p) => p.type === 'HIGH').sort((a, b) => a.index - b.index);
    const lowPivots = pivots.filter((p) => p.type === 'LOW').sort((a, b) => a.index - b.index);

    // 1. Check Equal Highs
    for (let i = 0; i < highPivots.length - 1; i++) {
      const p1 = highPivots[i]!;
      const p2 = highPivots[i + 1]!;
      const barDistance = p2.index - p1.index;

      if (barDistance >= 3 && barDistance <= 50) {
        if (Math.abs(p1.price - p2.price) <= tolerance) {
          const avgPrice = Number(((p1.price + p2.price) / 2).toFixed(4));

          // Check if swept by forward bars
          let isSwept = false;
          for (let m = p2.index + 1; m < candles.length; m++) {
            if (candles[m]!.high > avgPrice + tolerance) {
              isSwept = true;
              break;
            }
          }

          results.push({
            id: `EQH-${symbol}-${p1.index}-${p2.index}`,
            symbol,
            timeframe,
            type: 'EQH',
            priceLevel: avgPrice,
            firstPivotIndex: p1.index,
            secondPivotIndex: p2.index,
            tolerance: Number(tolerance.toFixed(4)),
            isSwept,
          });
        }
      }
    }

    // 2. Check Equal Lows
    for (let i = 0; i < lowPivots.length - 1; i++) {
      const p1 = lowPivots[i]!;
      const p2 = lowPivots[i + 1]!;
      const barDistance = p2.index - p1.index;

      if (barDistance >= 3 && barDistance <= 50) {
        if (Math.abs(p1.price - p2.price) <= tolerance) {
          const avgPrice = Number(((p1.price + p2.price) / 2).toFixed(4));

          let isSwept = false;
          for (let m = p2.index + 1; m < candles.length; m++) {
            if (candles[m]!.low < avgPrice - tolerance) {
              isSwept = true;
              break;
            }
          }

          results.push({
            id: `EQL-${symbol}-${p1.index}-${p2.index}`,
            symbol,
            timeframe,
            type: 'EQL',
            priceLevel: avgPrice,
            firstPivotIndex: p1.index,
            secondPivotIndex: p2.index,
            tolerance: Number(tolerance.toFixed(4)),
            isSwept,
          });
        }
      }
    }

    return results;
  }
}
