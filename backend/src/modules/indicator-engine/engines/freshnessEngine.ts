import { BaseZone } from '@algoapp/shared';

export class FreshnessEngine {
  public static calculateFreshness(zone: BaseZone): number {
    const ageDecay = 100.0 * Math.exp(-0.015 * zone.age);
    const touchPenalty = zone.touchCount * 25.0;
    const freshness = Math.max(0.0, ageDecay - touchPenalty);
    return Number(freshness.toFixed(2));
  }

  public static updateFreshness<T extends BaseZone>(zones: T[]): T[] {
    return zones.map((z) => ({
      ...z,
      freshness: this.calculateFreshness(z),
    }));
  }
}
