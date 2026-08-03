import { describe, it, expect } from 'vitest';
import { PivotEngine } from '../../backend/src/modules/indicator-engine/engines/pivotEngine';
import { SwingEngine } from '../../backend/src/modules/indicator-engine/engines/swingEngine';
import { MarketStructureEngine } from '../../backend/src/modules/indicator-engine/engines/marketStructureEngine';
import { ZoneMergeEngine } from '../../backend/src/modules/indicator-engine/engines/zoneMergeEngine';
import { FreshnessEngine } from '../../backend/src/modules/indicator-engine/engines/freshnessEngine';
import { TouchEngine } from '../../backend/src/modules/indicator-engine/engines/touchEngine';
import { ZoneScoreEngine } from '../../backend/src/modules/indicator-engine/engines/zoneScoreEngine';
import { IndicatorEngineService } from '../../backend/src/modules/indicator-engine/services/indicatorEngine.service';
import { CandleDto, SupplyZone, DemandZone } from '@algoapp/shared';

describe('IndicatorEngine - Unit Test Suite', () => {
  const mockCandles: CandleDto[] = Array.from({ length: 40 }, (_, i) => ({
    symbol: 'BTCUSD.P',
    timeframe: '1H',
    open: 64000 + i * 50,
    high: 64100 + i * 50,
    low: 63900 + i * 50,
    close: 64050 + i * 50,
    volume: 10 + i,
    timestamp: new Date(Date.now() - (40 - i) * 3600 * 1000).toISOString(),
  }));

  it('1. PivotEngine & SwingEngine - detects pivots and builds ZigZag legs', () => {
    const pivots = PivotEngine.findPivots(mockCandles, 5);
    expect(Array.isArray(pivots)).toBe(true);

    const swings = SwingEngine.calculateSwings(pivots);
    expect(swings).toHaveProperty('legs');
    expect(swings).toHaveProperty('currentTrend');
  });

  it('2. MarketStructureEngine - evaluates market structure and emits BOS/CHOCH events', () => {
    const pivots9 = PivotEngine.findPivots(mockCandles, 5);
    const pivots50 = PivotEngine.findPivots(mockCandles, 10);
    const res = MarketStructureEngine.evaluateStructure('BTCUSD.P', mockCandles, pivots9, pivots50);

    expect(res.marketStructure.symbol).toBe('BTCUSD.P');
    expect(['BULLISH', 'BEARISH']).toContain(res.marketStructure.trend);
  });

  it('3. ZoneMergeEngine - consolidates 40% overlapping PAT and SMC zones', () => {
    const zoneA: SupplyZone = {
      id: 'ZON-1',
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      type: 'SUPPLY',
      upperPrice: 65000,
      lowerPrice: 64500,
      patStrength: 80,
      smcStrength: 0,
      mergedStrength: 80,
      width: 500,
      freshness: 100,
      touchCount: 0,
      age: 2,
      confidence: 80,
      status: 'NEW',
      source: 'PAT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const zoneB: SupplyZone = {
      id: 'ZON-2',
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      type: 'SUPPLY',
      upperPrice: 65200,
      lowerPrice: 64600,
      patStrength: 0,
      smcStrength: 85,
      mergedStrength: 85,
      width: 600,
      freshness: 100,
      touchCount: 0,
      age: 2,
      confidence: 85,
      status: 'NEW',
      source: 'SMC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const merged = ZoneMergeEngine.mergeZones([zoneA, zoneB]);
    expect(merged.length).toBe(1);
    expect(merged[0]!.source).toBe('MERGED');
    expect(merged[0]!.upperPrice).toBe(65200);
    expect(merged[0]!.lowerPrice).toBe(64500);
    expect(merged[0]!.mergedStrength).toBe(95); // 85 + 10 bonus
  });

  it('4. FreshnessEngine & TouchEngine - calculates decay and touch state transitions', () => {
    const sampleZone: DemandZone = {
      id: 'DEM-1',
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      type: 'DEMAND',
      upperPrice: 64000,
      lowerPrice: 63500,
      patStrength: 85,
      smcStrength: 85,
      mergedStrength: 95,
      width: 500,
      freshness: 100,
      touchCount: 0,
      age: 10,
      confidence: 90,
      status: 'ACTIVE',
      source: 'MERGED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const freshness = FreshnessEngine.calculateFreshness(sampleZone);
    expect(freshness).toBeLessThan(100);
    expect(freshness).toBeGreaterThan(0);

    const testCandle: CandleDto = {
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      open: 64100,
      high: 64200,
      low: 63800, // Touches upper price 64000
      close: 64050,
      volume: 15,
      timestamp: new Date().toISOString(),
    };

    const touched = TouchEngine.evaluateTouches([sampleZone], testCandle);
    expect(touched[0]!.touchCount).toBe(1);
    expect(touched[0]!.status).toBe('FIRST_TOUCH');
  });

  it('5. ZoneScoreEngine - computes 0–100 composite ZoneScore', () => {
    const sampleZone: DemandZone = {
      id: 'DEM-SCORE-1',
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      type: 'DEMAND',
      upperPrice: 64000,
      lowerPrice: 63500,
      patStrength: 85,
      smcStrength: 85,
      mergedStrength: 95,
      width: 500,
      freshness: 90,
      touchCount: 0,
      age: 2,
      confidence: 90,
      status: 'ACTIVE',
      source: 'MERGED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const score = ZoneScoreEngine.calculateScore(sampleZone, {
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      trend: 'BULLISH',
      internalTrend: 'BULLISH',
      swingTrend: 'BULLISH',
      liquiditySwept: true,
    });

    expect(score.totalScore).toBeGreaterThanOrEqual(0);
    expect(score.totalScore).toBeLessThanOrEqual(100);
    expect(score.patConfirmation).toBe(true);
    expect(score.smcConfirmation).toBe(true);
  });

  it('6. IndicatorEngineService - runs full 10-stage pipeline cleanly', async () => {
    const service = new IndicatorEngineService();
    const result = await service.evaluateSymbol('BTCUSD.P', mockCandles);

    expect(result.symbol).toBe('BTCUSD.P');
    expect(Array.isArray(result.supplyZones)).toBe(true);
    expect(Array.isArray(result.demandZones)).toBe(true);
    expect(typeof result.zoneScores).toBe('object');
    expect(result.marketStructure).toHaveProperty('trend');
  });
});
