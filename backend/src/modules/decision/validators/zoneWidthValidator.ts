import { ZoneDto, DecisionReasonCode } from '@algoapp/shared';
import { ValidatorResult } from './zoneValidator.js';

export class ZoneWidthValidator {
  public static validate(zone?: ZoneDto): ValidatorResult {
    if (!zone) {
      return { passed: false, score: 0, reasonCode: DecisionReasonCode.ZONE_WIDTH_EXCEEDED };
    }

    return { passed: true, score: 95 };
  }
}
