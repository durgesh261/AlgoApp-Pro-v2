import { ZoneDto, DecisionReasonCode } from '@algoapp/shared';
import { ValidatorResult } from './zoneValidator.js';

export class FreshZoneValidator {
  public static validate(zone?: ZoneDto): ValidatorResult {
    if (!zone) {
      return { passed: false, score: 0, reasonCode: DecisionReasonCode.ZONE_FRESHNESS_DECAYED };
    }

    if (zone.freshness < 50.0) {
      return { passed: false, score: zone.freshness, reasonCode: DecisionReasonCode.ZONE_FRESHNESS_DECAYED };
    }

    return { passed: true, score: zone.freshness, reasonCode: DecisionReasonCode.FRESH_ZONE_CONFIRMED };
  }
}
