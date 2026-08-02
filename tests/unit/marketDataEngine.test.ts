import { describe, it, expect } from 'vitest';
import { MarketDataValidator } from '../../backend/src/modules/market-data/services/marketDataValidator.js';
import { MarketEventGenerator } from '../../backend/src/modules/market-data/services/marketEventGenerator.js';
import { MarketEventType } from '@algoapp/shared';

describe('Market Data Engine Unit Tests', () => {
  it('should validate canonical OHLC candle rules successfully', () => {
    const validCandle = {
      symbol: 'BTCUSD.P',
      timeframe: '1H' as const,
      open: 64000,
      high: 64800,
      low: 63500,
      close: 64200,
      volume: 1500.5,
      timestamp: '2026-08-02T20:00:00Z',
    };
    const res = MarketDataValidator.validateCandle(validCandle);
    expect(res.valid).toBe(true);
  });

  it('should reject invalid OHLC where High is less than Low', () => {
    const invalidCandle = {
      symbol: 'BTCUSD.P',
      timeframe: '1H' as const,
      open: 64000,
      high: 63000, // Invalid High < Low
      low: 63500,
      close: 64200,
      volume: 1500.5,
      timestamp: '2026-08-02T20:00:00Z',
    };
    const res = MarketDataValidator.validateCandle(invalidCandle);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('INVALID_OHLC');
  });

  it('should reject unsupported timeframe (anything other than 1H)', () => {
    const invalidTimeframe = {
      symbol: 'BTCUSD.P',
      timeframe: '15M' as any,
      open: 64000,
      high: 64800,
      low: 63500,
      close: 64200,
      volume: 1500.5,
      timestamp: '2026-08-02T20:00:00Z',
    };
    const res = MarketDataValidator.validateCandle(invalidTimeframe);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('UNSUPPORTED_TIMEFRAME');
  });

  it('should generate market events deterministically', async () => {
    const evt = await MarketEventGenerator.emitEvent('ETHUSD.P', MarketEventType.NEW_CANDLE, {
      close: 3480.25,
    });
    expect(evt.symbol).toBe('ETHUSD.P');
    expect(evt.eventType).toBe(MarketEventType.NEW_CANDLE);
  });
});
