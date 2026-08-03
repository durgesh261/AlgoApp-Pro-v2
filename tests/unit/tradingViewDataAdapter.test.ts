import { describe, it, expect, beforeEach } from 'vitest';
import { TradingViewWebhookReceiver } from '../../backend/src/modules/tradingview-adapter/services/tradingViewWebhookReceiver.js';
import { TradingViewNormalizer } from '../../backend/src/modules/tradingview-adapter/services/tradingViewNormalizer.js';
import { TradingViewDeduplicator } from '../../backend/src/modules/tradingview-adapter/services/tradingViewDeduplicator.js';
import { TradingViewAdapterService } from '../../backend/src/modules/tradingview-adapter/services/tradingViewAdapter.service.js';

describe('TradingView Data Adapter Unit Tests', () => {
  beforeEach(() => {
    TradingViewDeduplicator.clearCache();
  });

  it('should validate webhook payloads and reject unsupported pairs or timeframes', () => {
    const validPayload = {
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      open: 64000.0,
      high: 64500.0,
      low: 63800.0,
      close: 64200.0,
      volume: 125.5,
      timestamp: '2026-08-02T20:00:00Z',
    };
    const validResult = TradingViewWebhookReceiver.validateWebhookPayload(validPayload);
    expect(validResult.valid).toBe(true);

    const invalidPair = { ...validPayload, symbol: 'INVALID_PAIR' };
    const invalidPairResult = TradingViewWebhookReceiver.validateWebhookPayload(invalidPair);
    expect(invalidPairResult.valid).toBe(false);
    expect(invalidPairResult.reason).toContain('UNSUPPORTED_PAIR');

    const invalidTimeframe = { ...validPayload, timeframe: '5M' };
    const invalidTimeframeResult = TradingViewWebhookReceiver.validateWebhookPayload(invalidTimeframe);
    expect(invalidTimeframeResult.valid).toBe(false);
  });

  it('should normalize TradingView payload into canonical CandleDto, MarketSnapshotDto, and MarketEventDto', () => {
    const payload = {
      symbol: 'ETHUSD.P',
      timeframe: '1H' as const,
      open: 3450.0,
      high: 3500.0,
      low: 3420.0,
      close: 3480.0,
      volume: 4500.0,
      timestamp: '2026-08-02T20:00:00Z',
    };

    const normalized = TradingViewNormalizer.normalizePayload(payload);

    expect(normalized.candle.symbol).toBe('ETHUSD.P');
    expect(normalized.candle.timeframe).toBe('1H');
    expect(normalized.candle.close).toBe(3480.0);

    expect(normalized.snapshot.currentPrice).toBe(3480.0);
    expect(normalized.event.symbol).toBe('ETHUSD.P');
  });

  it('should deduplicate webhooks with identical symbol and timestamp', () => {
    const payload = {
      symbol: 'BTCUSD.P',
      timeframe: '1H' as const,
      open: 64000.0,
      high: 64500.0,
      low: 63800.0,
      close: 64200.0,
      volume: 125.5,
      timestamp: '2026-08-02T21:00:00Z',
    };

    const firstCheck = TradingViewDeduplicator.isDuplicate(payload);
    expect(firstCheck).toBe(false);

    const secondCheck = TradingViewDeduplicator.isDuplicate(payload);
    expect(secondCheck).toBe(true);
  });

  it('should process webhook through end-to-end adapter pipeline and return PROCESSED status', async () => {
    const service = new TradingViewAdapterService();
    const result = await service.receiveWebhook({
      symbol: 'SOLUSD.P',
      timeframe: '1H',
      open: 140.0,
      high: 145.0,
      low: 139.0,
      close: 143.5,
      volume: 12000.0,
      timestamp: '2026-08-02T22:15:00Z',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('PROCESSED');
    expect(result.data).toBeDefined();
    expect(result.data?.candle.symbol).toBe('SOLUSD.P');
  });
});
