import { BaseZone, CandleDto, ZoneLifecycleState } from '@algoapp/shared';

export class ZoneLifecycleEngine {
  public static updateLifecycle<T extends BaseZone>(zones: T[], latestCandle: CandleDto): T[] {
    return zones.map((zone) => {
      let status: ZoneLifecycleState = zone.status;

      // Invalidation check (BROKEN)
      if (zone.type === 'DEMAND' && latestCandle.close < zone.lowerPrice) {
        status = 'BROKEN';
      } else if (zone.type === 'SUPPLY' && latestCandle.close > zone.upperPrice) {
        status = 'BROKEN';
      } else if (status === 'BROKEN') {
        // Remain broken until archived
      } else if (zone.age > 72) {
        status = 'ARCHIVED';
      } else if (status === 'NEW') {
        status = 'ACTIVE';
      }

      return {
        ...zone,
        status,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  public static handleNewZoneOverlap<T extends BaseZone>(newZone: T, existingZones: T[]): T[] {
    const activeZones = existingZones.filter((z) => z.status !== 'ARCHIVED' && z.status !== 'BROKEN');
    
    // Always create new zone even if an archived zone occupied the area
    return [...activeZones, newZone];
  }
}
