import { ZoneDto, ZoneType, StrategySignalOutcome, DecisionReasonCode } from '@algoapp/shared';
import { ValidatorResult } from './zoneValidator.js';

export class OpposingZoneValidator {
  public static validate(
    targetSignalOutcome: StrategySignalOutcome,
    currentPrice: number,
    allZones: ZoneDto[]
  ): ValidatorResult {
    if (targetSignalOutcome === StrategySignalOutcome.BUY) {
      // Look for immediate opposing Supply Zone above price
      const blockingSupply = allZones.find(
        (z) => z.type === ZoneType.SUPPLY && z.lowerPrice > currentPrice && z.lowerPrice - currentPrice < currentPrice * 0.005
      );
      if (blockingSupply) {
        return { passed: false, score: 20, reasonCode: DecisionReasonCode.OPPOSING_ZONE_BLOCKED };
      }
    } else if (targetSignalOutcome === StrategySignalOutcome.SELL) {
      // Look for immediate opposing Demand Zone below price
      const blockingDemand = allZones.find(
        (z) => z.type === ZoneType.DEMAND && z.upperPrice < currentPrice && currentPrice - z.upperPrice < currentPrice * 0.005
      );
      if (blockingDemand) {
        return { passed: false, score: 20, reasonCode: DecisionReasonCode.OPPOSING_ZONE_BLOCKED };
      }
    }

    return { passed: true, score: 100 };
  }
}
