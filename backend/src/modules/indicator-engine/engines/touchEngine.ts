import { BaseZone, CandleDto, ZoneLifecycleState } from '@algoapp/shared';

export class TouchEngine {
  public static evaluateTouches<T extends BaseZone>(zones: T[], candle: CandleDto): T[] {
    return zones.map((zone) => {
      let isTouching = false;

      if (zone.type === 'DEMAND') {
        isTouching = candle.low <= zone.upperPrice && candle.high >= zone.lowerPrice;
      } else {
        isTouching = candle.high >= zone.lowerPrice && candle.low <= zone.upperPrice;
      }

      if (!isTouching || zone.status === 'BROKEN' || zone.status === 'ARCHIVED') {
        return zone;
      }

      const newTouchCount = zone.touchCount + 1;
      let status: ZoneLifecycleState = zone.status;

      if (newTouchCount === 1) {
        status = 'FIRST_TOUCH';
      } else if (newTouchCount === 2) {
        status = 'TRADED';
      } else if (newTouchCount >= 3) {
        // Third+ touch rejected / degraded by default
        status = 'TRADED';
      }

      return {
        ...zone,
        touchCount: newTouchCount,
        status,
        updatedAt: new Date().toISOString(),
      };
    });
  }
}
