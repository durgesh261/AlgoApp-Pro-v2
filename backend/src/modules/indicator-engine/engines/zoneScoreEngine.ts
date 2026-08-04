import { BaseZone, ZoneScore, MarketStructure } from '@algoapp/shared';

export class ZoneScoreEngine {
  public static calculateScore(zone: BaseZone, marketStructure: MarketStructure): ZoneScore {
    // 1. Freshness Score (0 - 25)
    const freshnessScore = Number(((zone.freshness / 100.0) * 25.0).toFixed(2));

    // 2. Width Score (0 - 15)
    const widthRatio = Math.min(1.0, zone.width / 500.0);
    const widthScore = Number(((1.0 - widthRatio) * 15.0).toFixed(2));

    // 3. ATR Quality Score (0 - 15)
    const atrQualityScore = zone.mergedStrength >= 90.0 ? 15.0 : 10.0;

    // 4. Merge Quality Score (0 - 15)
    const mergeQualityScore = zone.source === 'MERGED' ? 15.0 : 8.0;

    // 5. PAT & SMC Confirmations (0 - 10 each)
    const patConfirmation = zone.patStrength > 0;
    const smcConfirmation = zone.smcStrength > 0;
    const patScore = patConfirmation ? 10.0 : 0.0;
    const smcScore = smcConfirmation ? 10.0 : 0.0;

    // 6. Touch Count Score (0 - 10)
    let touchCountScore = 10.0;
    if (zone.touchCount === 1) touchCountScore = 7.0;
    else if (zone.touchCount === 2) touchCountScore = 4.0;
    else if (zone.touchCount >= 3) touchCountScore = 0.0;

    // 7. Momentum Score (0 - 10)
    const isAligned = 
      (zone.type === 'DEMAND' && marketStructure.trend === 'BULLISH') ||
      (zone.type === 'SUPPLY' && marketStructure.trend === 'BEARISH');
    const momentumScore = isAligned ? 10.0 : 2.0;

    const totalScore = Number(
      Math.min(
        100.0,
        Math.max(
          0.0,
          freshnessScore +
            widthScore +
            atrQualityScore +
            mergeQualityScore +
            patScore +
            smcScore +
            touchCountScore +
            momentumScore
        )
      ).toFixed(2)
    );

    return {
      zoneId: zone.id,
      totalScore,
      freshnessScore,
      widthScore,
      atrQualityScore,
      mergeQualityScore,
      patConfirmation,
      smcConfirmation,
      touchCountScore,
      momentumScore,
    };
  }

  public static scoreZones<T extends BaseZone>(
    zones: T[],
    marketStructure: MarketStructure
  ): Record<string, ZoneScore> {
    const scores: Record<string, ZoneScore> = {};
    for (const z of zones) {
      scores[z.id] = this.calculateScore(z, marketStructure);
    }
    return scores;
  }
}
