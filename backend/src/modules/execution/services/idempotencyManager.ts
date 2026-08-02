import { SubmitExecutionInput } from '@algoapp/shared';
import crypto from 'crypto';

export class IdempotencyManager {
  public static generateKey(input: SubmitExecutionInput): string {
    if (input.idempotencyKey) {
      return input.idempotencyKey;
    }

    const payload = `${input.decisionId}:${input.symbol}:${input.side}:${input.quantity}:${input.price ?? 0}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex').substring(0, 16);
    return `IDEM-${hash}`;
  }
}
