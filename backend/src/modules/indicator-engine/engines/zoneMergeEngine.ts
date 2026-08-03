import { BaseZone } from '@algoapp/shared';

export class ZoneMergeEngine {
  public static mergeZones<T extends BaseZone>(zones: T[]): T[] {
    if (zones.length < 2) return [...zones];

    const sorted = [...zones].sort((a, b) => a.lowerPrice - b.lowerPrice);
    const result: T[] = [];

    let current = sorted[0]!;

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i]!;

      // Check overlap
      const overlap = Math.max(0, Math.min(current.upperPrice, next.upperPrice) - Math.max(current.lowerPrice, next.lowerPrice));
      const minWidth = Math.min(current.width, next.width);
      const overlapRatio = minWidth > 0 ? overlap / minWidth : 0;

      if (overlapRatio >= 0.4) {
        // Merge zones
        const upperPrice = Number(Math.max(current.upperPrice, next.upperPrice).toFixed(2));
        const lowerPrice = Number(Math.min(current.lowerPrice, next.lowerPrice).toFixed(2));
        const width = Number((upperPrice - lowerPrice).toFixed(2));

        const patStrength = Math.max(current.patStrength, next.patStrength);
        const smcStrength = Math.max(current.smcStrength, next.smcStrength);
        const mergedStrength = Math.min(100.0, Math.max(patStrength, smcStrength) + 10.0);

        const touchCount = Math.max(current.touchCount, next.touchCount);
        const freshness = Math.min(current.freshness, next.freshness);
        const age = Math.min(current.age, next.age);
        const confidence = Math.min(100.0, Math.max(current.confidence, next.confidence) + 5.0);

        current = {
          ...current,
          id: `MERGED-${current.symbol}-${current.type}-${Date.now()}-${i}`,
          upperPrice,
          lowerPrice,
          width,
          patStrength,
          smcStrength,
          mergedStrength,
          touchCount,
          freshness,
          age,
          confidence,
          source: 'MERGED',
          updatedAt: new Date().toISOString(),
        };
      } else {
        result.push(current);
        current = next;
      }
    }

    result.push(current);
    return result;
  }
}
