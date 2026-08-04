import { ZoneDto, ZoneSource, ZoneStatus } from '@algoapp/shared';
import { ZoneLifecycleService } from './zoneLifecycle.service.js';

export class ZoneMergerService {
  public static detectAndMergeZones(zones: ZoneDto[]): ZoneDto[] {
    const mergedResults: ZoneDto[] = [];
    const processedIds = new Set<string>();

    for (let i = 0; i < zones.length; i++) {
      const z1 = zones[i]!;
      if (processedIds.has(z1.id)) continue;

      let mergedZone = { ...z1 };

      for (let j = i + 1; j < zones.length; j++) {
        const z2 = zones[j]!;
        if (processedIds.has(z2.id)) continue;

        // Must match symbol, type, and timeframe
        if (z1.symbol === z2.symbol && z1.type === z2.type && z1.timeframe === z2.timeframe) {
          // Overlap check
          const isOverlapping =
            z1.lowerPrice <= z2.upperPrice && z1.upperPrice >= z2.lowerPrice;

          if (isOverlapping && z1.source !== z2.source) {
            processedIds.add(z2.id);

            const upperPrice = Math.max(z1.upperPrice, z2.upperPrice);
            const lowerPrice = Math.min(z1.lowerPrice, z2.lowerPrice);
            const width = ZoneLifecycleService.calculateZoneWidth(upperPrice, lowerPrice);

            mergedZone = {
              ...mergedZone,
              id: `ZON-MERGED-${Date.now()}-${i}`,
              source: ZoneSource.MERGED,
              upperPrice,
              lowerPrice,
              width,
              strength: Math.min(100, Math.max(z1.strength, z2.strength) + 15),
              status: ZoneStatus.FRESH,
              updatedAt: new Date().toISOString(),
            };
          }
        }
      }

      processedIds.add(z1.id);
      mergedResults.push(mergedZone);
    }

    return mergedResults;
  }
}
