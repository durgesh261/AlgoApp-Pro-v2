import { DeltaErrorCategory } from '@algoapp/shared';

export class DeltaErrorClassifier {
  public static classify(error: unknown): { category: DeltaErrorCategory; message: string } {
    const errMessage = error instanceof Error ? error.message : String(error);

    if (errMessage.includes('401') || errMessage.includes('HMAC') || errMessage.includes('Invalid API Key')) {
      return { category: DeltaErrorCategory.AUTHENTICATION, message: errMessage };
    }
    if (errMessage.includes('ECONNRESET') || errMessage.includes('ETIMEDOUT') || errMessage.includes('Network Error')) {
      return { category: DeltaErrorCategory.NETWORK, message: errMessage };
    }
    if (errMessage.includes('429') || errMessage.includes('Rate limit exceeded')) {
      return { category: DeltaErrorCategory.RATE_LIMIT, message: errMessage };
    }
    if (errMessage.includes('Invalid order') || errMessage.includes('Insufficient margin') || errMessage.includes('Symbol not allowed')) {
      return { category: DeltaErrorCategory.EXCHANGE, message: errMessage };
    }
    if (errMessage.includes('Zod') || errMessage.includes('Validation')) {
      return { category: DeltaErrorCategory.VALIDATION, message: errMessage };
    }

    return { category: DeltaErrorCategory.UNKNOWN, message: errMessage };
  }
}
