import {
  TradingViewWebhookPayload,
  TradingViewHealthDto,
  TradingViewWebhookResult,
  NormalizedMarketData,
} from '@algoapp/shared';

export interface ITradingViewDataAdapter {
  receiveWebhook(payload: unknown, signature?: string): Promise<TradingViewWebhookResult>;
  normalizePayload(payload: TradingViewWebhookPayload): NormalizedMarketData;
  checkHealth(): Promise<TradingViewHealthDto>;
}
