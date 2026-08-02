import { SubmitExecutionInput, ExecutionMode } from '@algoapp/shared';
import { MarketRuleEvaluator } from '../../rules/evaluators/marketRuleEvaluator.js';

export interface ExecutionValidationResult {
  valid: boolean;
  reason?: string;
}

export class ExecutionValidator {
  public static validateExecutionRequest(
    input: SubmitExecutionInput,
    existingIdempotencyKeys: Set<string>
  ): ExecutionValidationResult {
    // 1. Duplicate check (Idempotency)
    if (input.idempotencyKey && existingIdempotencyKeys.has(input.idempotencyKey)) {
      return { valid: false, reason: `DUPLICATE_REQUEST: Idempotency key '${input.idempotencyKey}' has already been processed.` };
    }

    // 2. Pair check
    if (!MarketRuleEvaluator.isSupportedPair(input.symbol)) {
      return { valid: false, reason: `UNSUPPORTED_PAIR: Symbol '${input.symbol}' is not allowed.` };
    }

    // 3. Quantity check
    if (input.quantity <= 0) {
      return { valid: false, reason: 'INVALID_QUANTITY: Execution quantity must be greater than 0.' };
    }

    // 4. Adapter Availability Check
    if (input.mode === ExecutionMode.LIVE) {
      return { valid: false, reason: 'ADAPTER_UNAVAILABLE: Delta Live Exchange adapter is inactive in simulation mode.' };
    }

    return { valid: true };
  }
}
