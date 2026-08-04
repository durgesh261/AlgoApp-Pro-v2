import { describe, it, expect } from 'vitest';
import { StrategyProfileService } from '../../backend/src/modules/strategy-profile/services/strategyProfile.service';
import { TradingViewWebhookReceiver } from '../../backend/src/modules/tradingview-adapter/services/tradingViewWebhookReceiver';
import { CandleStoreService } from '../../backend/src/modules/market-data/services/candleStore.service';
import { IndicatorEngineService } from '../../backend/src/modules/indicator-engine/services/indicatorEngine.service';

describe('StrategyProfile & Multi-Timeframe Engine Test Suite', () => {
  const profileService = new StrategyProfileService();
  const indicatorService = new IndicatorEngineService();

  it('1. StrategyProfileService - initializes default 1H and 15M profiles', async () => {
    const profiles = await profileService.getProfiles();

    expect(profiles.length).toBeGreaterThanOrEqual(2);
    
    const prof1H = profiles.find((p) => p.timeframe === '1H');
    const prof15M = profiles.find((p) => p.timeframe === '15M');

    expect(prof1H).toBeDefined();
    expect(prof1H?.id).toBe('DEF-1H-PROF');
    expect(prof15M).toBeDefined();
    expect(prof15M?.id).toBe('DEF-15M-PROF');
  });

  it('2. TradingViewWebhookReceiver - accepts 15M and 1H timeframes, rejects unsupported timeframes', () => {
    const valid1H = TradingViewWebhookReceiver.validateWebhookPayload({
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      open: 64000,
      high: 64500,
      low: 63800,
      close: 64200,
      volume: 1200,
      timestamp: '2026-08-03T12:00:00Z',
    });
    expect(valid1H.valid).toBe(true);

    const valid15M = TradingViewWebhookReceiver.validateWebhookPayload({
      symbol: 'BTCUSD.P',
      timeframe: '15M',
      open: 64000,
      high: 64500,
      low: 63800,
      close: 64200,
      volume: 1200,
      timestamp: '2026-08-03T12:00:00Z',
    });
    expect(valid15M.valid).toBe(true);

    const invalid5M = TradingViewWebhookReceiver.validateWebhookPayload({
      symbol: 'BTCUSD.P',
      timeframe: '5M',
      open: 64000,
      high: 64500,
      low: 63800,
      close: 64200,
      volume: 1200,
      timestamp: '2026-08-03T12:00:00Z',
    });
    expect(invalid5M.valid).toBe(false);
    expect(invalid5M.reason).toContain('SCHEMA_VALIDATION_FAILED');
  });

  it('3. CandleStoreService - retrieves candles tagged with timeframe', async () => {
    const candles1H = await CandleStoreService.getCandles('BTCUSD.P', '1H', 10);
    expect(candles1H.length).toBeGreaterThan(0);
    expect(candles1H[0]?.timeframe).toBe('1H');

    const candles15M = await CandleStoreService.getCandles('BTCUSD.P', '15M', 10);
    expect(candles15M.length).toBeGreaterThan(0);
    expect(candles15M[0]?.timeframe).toBe('15M');
  });

  it('4. IndicatorEngineService - evaluates symbol under 15M and 1H profiles', async () => {
    const output1H = await indicatorService.evaluateSymbol('BTCUSD.P', '1H', 'DEF-1H-PROF');
    expect(output1H.timeframe).toBe('1H');
    expect(output1H.marketStructure.timeframe).toBe('1H');

    const output15M = await indicatorService.evaluateSymbol('BTCUSD.P', '15M', 'DEF-15M-PROF');
    expect(output15M.timeframe).toBe('15M');
    expect(output15M.marketStructure.timeframe).toBe('15M');
  });
});
