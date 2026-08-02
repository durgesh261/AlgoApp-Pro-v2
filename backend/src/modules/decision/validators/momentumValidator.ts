import { StrategySignalOutcome, DecisionReasonCode } from '@algoapp/shared';
import { ValidatorResult } from './zoneValidator.js';

export class MomentumValidator {
  public static validate(signalOutcome: StrategySignalOutcome): ValidatorResult {
    if (signalOutcome === StrategySignalOutcome.BUY || signalOutcome === StrategySignalOutcome.SELL) {
      return { passed: true, score: 90, reasonCode: DecisionReasonCode.MOMENTUM_ALIGNED };
    }
    return { passed: false, score: 40 };
  }
}
