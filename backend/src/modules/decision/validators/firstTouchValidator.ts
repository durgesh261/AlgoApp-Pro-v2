import { ZoneDto, DecisionReasonCode } from '@algoapp/shared';
import { ValidatorResult } from './zoneValidator.js';

export class FirstTouchValidator {
  public static validate(zone?: ZoneDto): ValidatorResult {
    if (!zone) {
      return { passed: false, score: 0, reasonCode: DecisionReasonCode.REPEATED_TOUCH_EXHAUSTED };
    }

    if (zone.touchCount > 2) {
      return { passed: false, score: 30, reasonCode: DecisionReasonCode.REPEATED_TOUCH_EXHAUSTED };
    }

    const score = zone.touchCount === 0 ? 100 : zone.touchCount === 1 ? 85 : 65;
    return { passed: true, score, reasonCode: DecisionReasonCode.FIRST_TOUCH_VALIDATED };
  }
}
