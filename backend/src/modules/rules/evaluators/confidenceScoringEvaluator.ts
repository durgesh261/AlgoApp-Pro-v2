import { ConfidenceBonusesDto } from '@algoapp/shared';

export class ConfidenceScoringEvaluator {
  public static readonly DEFAULT_BONUSES: ConfidenceBonusesDto = {
    freshZoneBonus: 20,
    mergedZoneBonus: 15,
    firstTouchBonus: 20,
    momentumBonus: 10,
    opposingZonePenalty: -20,
    brokenZonePenalty: -100,
  };

  public static calculateScore(
    baseScore: number,
    flags: {
      isFresh?: boolean;
      isMerged?: boolean;
      isFirstTouch?: boolean;
      isMomentumAligned?: boolean;
      hasOpposingZone?: boolean;
      isBroken?: boolean;
    },
    bonuses: ConfidenceBonusesDto = this.DEFAULT_BONUSES
  ): number {
    let score = baseScore;

    if (flags.isBroken) return 0;

    if (flags.isFresh) score += bonuses.freshZoneBonus;
    if (flags.isMerged) score += bonuses.mergedZoneBonus;
    if (flags.isFirstTouch) score += bonuses.firstTouchBonus;
    if (flags.isMomentumAligned) score += bonuses.momentumBonus;
    if (flags.hasOpposingZone) score += bonuses.opposingZonePenalty;

    return Math.min(100, Math.max(0, score));
  }
}
