import { tradingViewWebhookSchema, TradingViewWebhookPayload } from '@algoapp/shared';
import { MarketRuleEvaluator } from '../../rules/evaluators/marketRuleEvaluator.js';

export interface WebhookValidationResult {
  valid: boolean;
  reason?: string;
  payload?: TradingViewWebhookPayload;
}

export class TradingViewWebhookReceiver {
  public static validateWebhookPayload(rawPayload: unknown): WebhookValidationResult {
    const parseResult = tradingViewWebhookSchema.safeParse(rawPayload);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || 'Invalid payload schema format.';
      return { valid: false, reason: `SCHEMA_VALIDATION_FAILED: ${issue}` };
    }

    const payload = parseResult.data as TradingViewWebhookPayload;

    // 1. Pair Allowlist Check
    if (!MarketRuleEvaluator.isSupportedPair(payload.symbol)) {
      return { valid: false, reason: `UNSUPPORTED_PAIR: Symbol '${payload.symbol}' is not allowed.` };
    }

    // 2. Timeframe Check (Strictly 15M or 1H)
    if (payload.timeframe !== '1H' && payload.timeframe !== '15M') {
      return { valid: false, reason: `UNSUPPORTED_TIMEFRAME: Timeframe '${payload.timeframe}' is rejected. Supported timeframes: 15M, 1H.` };
    }

    // 3. High/Low validation
    if (payload.high < payload.low || payload.open < payload.low || payload.close < payload.low) {
      return { valid: false, reason: 'MALFORMED_CANDLE: High price must be >= Low price and Open/Close must be within bounds.' };
    }

    return { valid: true, payload };
  }
}
