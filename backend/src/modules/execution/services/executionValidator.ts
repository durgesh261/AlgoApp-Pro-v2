import { SubmitExecutionInput, ExecutionMode } from '@algoapp/shared';
import { MarketRuleEvaluator } from '../../rules/evaluators/marketRuleEvaluator.js';
import { LiveTradingGuard } from '../../production/services/liveTradingGuard.js';

export interface ExecutionValidationResult {
  valid: boolean;
  reason?: string;
}

export class ExecutionValidator {
  public static async validateExecutionRequestAsync(
    input: SubmitExecutionInput,
    existingIdempotencyKeys: Set<string>
  ): Promise<ExecutionValidationResult> {
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

    // 4. Live Safety Guard Check
    if (input.mode === ExecutionMode.LIVE) {
      const safety = await LiveTradingGuard.evaluateSafety(ExecutionMode.LIVE);
      if (!safety.isAllowed) {
        return {
          valid: false,
          reason: `LIVE_SAFETY_REJECTED: ${safety.rejectionReasons.join(' | ')}`,
        };
      }
    }

    return { valid: true };
  }

  public static validateExecutionRequest(
    input: SubmitExecutionInput,
    existingIdempotencyKeys: Set<string>
  ): ExecutionValidationResult {
    if (input.idempotencyKey && existingIdempotencyKeys.has(input.idempotencyKey)) {
      return { valid: false, reason: `DUPLICATE_REQUEST: Idempotency key '${input.idempotencyKey}' has already been processed.` };
    }
    if (!MarketRuleEvaluator.isSupportedPair(input.symbol)) {
      return { valid: false, reason: `UNSUPPORTED_PAIR: Symbol '${input.symbol}' is not allowed.` };
    }
    if (input.quantity <= 0) {
      return { valid: false, reason: 'INVALID_QUANTITY: Execution quantity must be greater than 0.' };
    }
    if (input.mode === ExecutionMode.LIVE) {
      return { valid: false, reason: 'LIVE_SAFETY_REJECTED: Live Trading has not been activated by user.' };
    }
    return { valid: true };
  }
}
