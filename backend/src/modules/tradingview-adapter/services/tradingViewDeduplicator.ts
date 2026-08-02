import { TradingViewWebhookPayload } from '@algoapp/shared';

const processedSignatures = new Set<string>();

export class TradingViewDeduplicator {
  public static isDuplicate(payload: TradingViewWebhookPayload): boolean {
    const signature = `${payload.symbol}:${payload.timeframe}:${new Date(payload.timestamp).toISOString()}:${payload.close}`;
    if (processedSignatures.has(signature)) {
      return true;
    }
    processedSignatures.add(signature);
    return false;
  }

  public static clearCache(): void {
    processedSignatures.clear();
  }
}
