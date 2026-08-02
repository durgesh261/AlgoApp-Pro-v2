import { ZoneDto, ZoneStatus } from '@algoapp/shared';

export class ZoneLifecycleService {
  public static calculateZoneWidth(upperPrice: number, lowerPrice: number): number {
    return Math.abs(upperPrice - lowerPrice);
  }

  public static evaluatePriceTouch(
    zone: ZoneDto,
    currentPrice: number
  ): { status: ZoneStatus; touchCount: number; freshness: number; isBroken: boolean } {
    let status = zone.status;
    let touchCount = zone.touchCount;
    let freshness = zone.freshness;
    let isBroken = false;

    // Invalidation check (Broken zone)
    if (zone.type === 'SUPPLY' && currentPrice > zone.upperPrice) {
      status = ZoneStatus.BROKEN;
      freshness = 0;
      isBroken = true;
    } else if (zone.type === 'DEMAND' && currentPrice < zone.lowerPrice) {
      status = ZoneStatus.BROKEN;
      freshness = 0;
      isBroken = true;
    } else if (currentPrice >= zone.lowerPrice && currentPrice <= zone.upperPrice) {
      // Touch within zone boundary
      if (status === ZoneStatus.FRESH) {
        status = ZoneStatus.TOUCHED;
        touchCount = 1;
        freshness = 75.0;
      } else if (status === ZoneStatus.TOUCHED) {
        touchCount += 1;
        freshness = Math.max(0, freshness - 25.0);
        if (touchCount >= 3) {
          status = ZoneStatus.CONSUMED;
        }
      }
    }

    return { status, touchCount, freshness, isBroken };
  }
}
