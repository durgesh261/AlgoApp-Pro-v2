import { PivotPoint } from './pivotEngine.js';

export interface SwingLeg {
  startIndex: number;
  endIndex: number;
  startPrice: number;
  endPrice: number;
  direction: 'UP' | 'DOWN';
  startTime: string;
  endTime: string;
}

export class SwingEngine {
  public static calculateSwings(pivots: PivotPoint[]): { legs: SwingLeg[]; currentTrend: 'BULLISH' | 'BEARISH' } {
    const legs: SwingLeg[] = [];
    let currentTrend: 'BULLISH' | 'BEARISH' = 'BULLISH';

    if (pivots.length < 2) {
      return { legs, currentTrend };
    }

    // Filter alternating pivots
    const filtered: PivotPoint[] = [];
    for (const p of pivots) {
      if (filtered.length === 0) {
        filtered.push(p);
        continue;
      }

      const prev = filtered[filtered.length - 1]!;
      if (prev.type === p.type) {
        // Keep more extreme pivot
        if (p.type === 'HIGH' && p.price > prev.price) {
          filtered[filtered.length - 1] = p;
        } else if (p.type === 'LOW' && p.price < prev.price) {
          filtered[filtered.length - 1] = p;
        }
      } else {
        filtered.push(p);
      }
    }

    for (let i = 0; i < filtered.length - 1; i++) {
      const start = filtered[i]!;
      const end = filtered[i + 1]!;

      legs.push({
        startIndex: start.index,
        endIndex: end.index,
        startPrice: start.price,
        endPrice: end.price,
        direction: end.type === 'HIGH' ? 'UP' : 'DOWN',
        startTime: start.time,
        endTime: end.time,
      });
    }

    if (legs.length > 0) {
      currentTrend = legs[legs.length - 1]!.direction === 'UP' ? 'BULLISH' : 'BEARISH';
    }

    return { legs, currentTrend };
  }
}
