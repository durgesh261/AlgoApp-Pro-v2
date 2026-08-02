import {
  TradingViewWebhookPayload,
  TradingViewHealthDto,
  TradingViewWebhookResult,
  NormalizedMarketData,
} from '@algoapp/shared';

import { ITradingViewDataAdapter } from '../adapters/tradingViewAdapter.interface.js';
import { TradingViewWebhookReceiver } from './tradingViewWebhookReceiver.js';
import { TradingViewNormalizer } from './tradingViewNormalizer.js';
import { TradingViewDeduplicator } from './tradingViewDeduplicator.js';
import { TradingViewHealthMonitor } from './tradingViewHealthMonitor.js';
import { CandleStoreService } from '../../market-data/services/candleStore.service.js';

export class TradingViewAdapterService implements ITradingViewDataAdapter {
  public async receiveWebhook(rawPayload: unknown): Promise<TradingViewWebhookResult> {
    const startTime = Date.now();
    const rawString = JSON.stringify(rawPayload);

    // 1. Receiver & Validator Phase
    const validation = TradingViewWebhookReceiver.validateWebhookPayload(rawPayload);
    if (!validation.valid || !validation.payload) {
      await TradingViewHealthMonitor.recordMalformed(validation.reason || 'Malformed payload', rawString);
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        status: 'MALFORMED',
        error: validation.reason,
        latencyMs,
        timestamp: new Date().toISOString(),
      };
    }

    const payload = validation.payload;

    // 2. Deduplication Phase
    if (TradingViewDeduplicator.isDuplicate(payload)) {
      await TradingViewHealthMonitor.recordDuplicate(payload.symbol, rawString);
      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        status: 'DUPLICATE',
        error: 'Duplicate candle skipped.',
        latencyMs,
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Normalization Phase
    const normalized = this.normalizePayload(payload);

    // 4. Publish to Market Data Engine
    await CandleStoreService.ingestCandle({
      symbol: normalized.candle.symbol,
      timeframe: '1H',
      open: normalized.candle.open,
      high: normalized.candle.high,
      low: normalized.candle.low,
      close: normalized.candle.close,
      volume: normalized.candle.volume,
      timestamp: normalized.candle.timestamp,
    });

    const latencyMs = Date.now() - startTime;
    await TradingViewHealthMonitor.recordWebhookSuccess(latencyMs, payload.symbol, rawString);

    return {
      success: true,
      status: 'PROCESSED',
      data: normalized,
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  }

  public normalizePayload(payload: TradingViewWebhookPayload): NormalizedMarketData {
    return TradingViewNormalizer.normalizePayload(payload);
  }

  public async checkHealth(): Promise<TradingViewHealthDto> {
    return TradingViewHealthMonitor.getHealth();
  }
}
