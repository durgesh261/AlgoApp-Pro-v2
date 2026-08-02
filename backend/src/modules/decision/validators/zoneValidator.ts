import { ZoneDto, ZoneStatus, DecisionReasonCode } from '@algoapp/shared';

export interface ValidatorResult {
  passed: boolean;
  score: number;
  reasonCode?: DecisionReasonCode | undefined;
}

export class ZoneValidator {
  public static validate(zone?: ZoneDto): ValidatorResult {
    if (!zone) {
      return { passed: false, score: 0, reasonCode: DecisionReasonCode.ZONE_BROKEN_INVALIDATED };
    }

    if (zone.status === ZoneStatus.BROKEN || zone.status === ZoneStatus.EXPIRED) {
      return { passed: false, score: 0, reasonCode: DecisionReasonCode.ZONE_BROKEN_INVALIDATED };
    }

    return { passed: true, score: 100, reasonCode: DecisionReasonCode.FRESH_ZONE_CONFIRMED };
  }
}
