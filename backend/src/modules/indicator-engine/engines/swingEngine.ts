import { PivotPointDto, ZigZagLegDto } from '@algoapp/shared';

export type SwingLeg = ZigZagLegDto;

export class SwingEngine {
  /**
   * Constructs alternating ZigZag legs from confirmed pivot points.
   * Ensures strictly alternating HIGH and LOW pivots by retaining the most extreme pivot
   * when consecutive same-type pivots occur, matching Pine Script ZigZag array state machines.
   */
  public static calculateSwings(pivots: PivotPointDto[]): {
    legs: ZigZagLegDto[];
    alternatingPivots: PivotPointDto[];
    currentTrend: 'BULLISH' | 'BEARISH';
  } {
    const legs: ZigZagLegDto[] = [];
    const alternatingPivots: PivotPointDto[] = [];
    let currentTrend: 'BULLISH' | 'BEARISH' = 'BULLISH';

    if (pivots.length === 0) {
      return { legs, alternatingPivots, currentTrend };
    }

    // Sort pivots chronologically
    const sorted = [...pivots].sort((a, b) => a.index - b.index);

    // 1. Build strictly alternating pivot list
    for (const p of sorted) {
      if (alternatingPivots.length === 0) {
        alternatingPivots.push(p);
        continue;
      }

      const prev = alternatingPivots[alternatingPivots.length - 1]!;
      if (prev.type === p.type) {
        // Same type: keep the more extreme pivot
        if (p.type === 'HIGH' && p.price >= prev.price) {
          alternatingPivots[alternatingPivots.length - 1] = p;
        } else if (p.type === 'LOW' && p.price <= prev.price) {
          alternatingPivots[alternatingPivots.length - 1] = p;
        }
      } else {
        alternatingPivots.push(p);
      }
    }

    // 2. Construct ZigZag legs between alternating points
    for (let i = 0; i < alternatingPivots.length - 1; i++) {
      const start = alternatingPivots[i]!;
      const end = alternatingPivots[i + 1]!;

      legs.push({
        startIndex: start.index,
        endIndex: end.index,
        startPrice: start.price,
        endPrice: end.price,
        direction: end.type === 'HIGH' ? 'UP' : 'DOWN',
        priceLength: Number(Math.abs(end.price - start.price).toFixed(4)),
        barLength: end.index - start.index,
        startTime: start.time,
        endTime: end.time,
      });
    }

    // 3. Determine current market trend from the latest swing leg
    if (legs.length > 0) {
      currentTrend = legs[legs.length - 1]!.direction === 'UP' ? 'BULLISH' : 'BEARISH';
    }

    return { legs, alternatingPivots, currentTrend };
  }
}
