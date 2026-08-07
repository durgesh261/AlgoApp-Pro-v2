import { BaseZone, ZoneDto, ZoneStatus, DecisionReasonCode } from '@algoapp/shared';

export interface ValidatorResult {
  passed: boolean;
  score: number;
  reasonCode?: DecisionReasonCode | undefined;
}

export class ZoneValidator {
  public static validate(zone?: BaseZone | ZoneDto): ValidatorResult {
    if (!zone) {
      return { passed: false, score: 0, reasonCode: DecisionReasonCode.ZONE_BROKEN_INVALIDATED };
    }

    if (zone.status === 'BROKEN' || zone.status === 'ARCHIVED' || (zone as ZoneDto).status === ZoneStatus.BROKEN) {
      return { passed: false, score: 0, reasonCode: DecisionReasonCode.ZONE_BROKEN_INVALIDATED };
    }

    if (zone.touchCount > 2) {
      return { passed: false, score: 30, reasonCode: DecisionReasonCode.REPEATED_TOUCH_EXHAUSTED };
    }

    if (zone.freshness < 25.0) {
      return { passed: false, score: 40, reasonCode: DecisionReasonCode.ZONE_FRESHNESS_DECAYED };
    }

    return {
      passed: true,
      score: 100,
      reasonCode: zone.touchCount === 0 ? DecisionReasonCode.FRESH_ZONE_CONFIRMED : DecisionReasonCode.FIRST_TOUCH_VALIDATED,
    };
  }
}
