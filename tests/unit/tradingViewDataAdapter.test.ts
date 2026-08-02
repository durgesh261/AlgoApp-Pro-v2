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

    const invalidTimeframe = { ...validPayload, timeframe: '15M' };
    const invalidTimeframeResult = TradingViewWebhookReceiver.validateWebhookPayload(invalidTimeframe);
    expect(invalidTimeframeResult.valid).toBe(false);
    expect(invalidTimeframeResult.reason).toContain('Only 1H timeframe is supported');
  });

  it('should normalize TradingView payload into canonical CandleDto, MarketSnapshotDto, and MarketEventDto', () => {
    const payload = {
      symbol: 'ETHUSD.P',
      timeframe: '1H' as const,
      open: 3300.0,
      high: 3350.0,
      low: 3280.0,
      close: 3340.0,
      volume: 850.0,
      timestamp: '2026-08-02T20:00:00Z',
    };

    const normalized = TradingViewNormalizer.normalizePayload(payload);
    expect(normalized.candle.symbol).toBe('ETHUSD.P');
    expect(normalized.candle.close).toBe(3340.0);
    expect(normalized.snapshot.trend).toBe('BULLISH');
    expect(normalized.event.eventType).toBe('TRADINGVIEW_CANDLE_RECEIVED');
  });

  it('should detect and ignore duplicate webhooks', () => {
    const payload = {
      symbol: 'SOLUSD.P',
      timeframe: '1H' as const,
      open: 150.0,
      high: 155.0,
      low: 148.0,
      close: 152.0,
      volume: 5000.0,
      timestamp: '2026-08-02T20:00:00Z',
    };

    expect(TradingViewDeduplicator.isDuplicate(payload)).toBe(false);
    expect(TradingViewDeduplicator.isDuplicate(payload)).toBe(true);
  });

  it('should process webhook end-to-end and record connection health metrics', async () => {
    const service = new TradingViewAdapterService();
    const payload = {
      symbol: 'XRPUSD.P',
      timeframe: '1H',
      open: 0.55,
      high: 0.58,
      low: 0.54,
      close: 0.57,
      volume: 150000.0,
      timestamp: '2026-08-02T20:00:00Z',
    };

    const result = await service.receiveWebhook(payload);
    expect(result.success).toBe(true);
    expect(result.status).toBe('PROCESSED');
    expect(result.data?.candle.symbol).toBe('XRPUSD.P');

    const health = await service.checkHealth();
    expect(health.status).toBe('CONNECTED');
    expect(health.totalWebhooks).toBeGreaterThan(0);
  });
});
