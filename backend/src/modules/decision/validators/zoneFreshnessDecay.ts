import { ZoneDto } from '@algoapp/shared';

export class ZoneFreshnessDecay {
  public static computeDecayedFreshness(zone: ZoneDto): number {
    const hoursElapsed = (Date.now() - new Date(zone.createdAt).getTime()) / (1000 * 60 * 60);
    const timeDecay = Math.min(40, hoursElapsed * 0.5);
    const touchDecay = zone.touchCount * 25.0;

    return Math.max(0, 100.0 - timeDecay - touchDecay);
  }
}
