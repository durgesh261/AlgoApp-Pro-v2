import { describe, it, expect } from 'vitest';
import { TradeIntelligenceService } from '../../backend/src/modules/analysis/services/tradeIntelligence.service.js';
import { StrategyPerformanceMonitor } from '../../backend/src/modules/analysis/services/strategyPerformanceMonitor.service.js';
import { MarketRegimeDetectorService } from '../../backend/src/modules/analysis/services/marketRegimeDetector.service.js';
import { PatternDiscoveryService } from '../../backend/src/modules/analysis/services/patternDiscovery.service.js';
import { StrategyRecommendationEngineService } from '../../backend/src/modules/analysis/services/strategyRecommendation.service.js';

describe('Version 5.0 Trading Intelligence Engine Test Suite', () => {
  it('1. TradeIntelligenceService - calculates 7 quality dimensions and composite score (0-100)', () => {
    const sampleTrade = {
      id: 'TRD-101',
      symbol: 'BTCUSD.P',
      netPnL: 639.55,
      marginUsed: 3192.50,
      riskRewardRatio: 3.25,
      confidence: 94.5,
      executionLatencyMs: 18,
    };

    const score = TradeIntelligenceService.calculateIntelligenceScore(sampleTrade);

    expect(score.tradeId).toBe('TRD-101');
    expect(score.overallScore).toBeGreaterThan(80);
    expect(score.overallScore).toBeLessThanOrEqual(100);
    expect(score.entryQuality).toBeGreaterThan(0);
    expect(score.exitQuality).toBeGreaterThan(0);
    expect(score.timingQuality).toBeGreaterThan(0);
    expect(score.zoneQuality).toBeGreaterThan(0);
    expect(score.rrQuality).toBeGreaterThan(0);
    expect(score.confidenceAccuracy).toBeGreaterThan(0);
    expect(score.executionAccuracy).toBeGreaterThan(0);
  });

  it('2. StrategyPerformanceMonitor - calculates Sharpe, Sortino, Calmar ratios', () => {
    const metrics = StrategyPerformanceMonitor.calculateStrategyMetrics();

    expect(metrics.winRate).toBe(76.2);
    expect(metrics.sharpeRatio).toBe(2.67);
    expect(metrics.sortinoRatio).toBe(3.42);
    expect(metrics.calmarRatio).toBe(4.15);
    expect(metrics.maxDrawdownPercent).toBe(2.08);
  });

  it('3. MarketRegimeDetectorService - classifies market conditions', () => {
    const regime1H = MarketRegimeDetectorService.detectRegime('BTCUSD.P', '1H');
    expect(regime1H.regime).toBe('TRENDING_BULLISH');
    expect(regime1H.atr).toBe(450);

    const regime15M = MarketRegimeDetectorService.detectRegime('BTCUSD.P', '15M');
    expect(regime15M.regime).toBe('EXPANSION');
  });

  it('4. PatternDiscoveryService - discovers statistically significant trade patterns', () => {
    const patterns = PatternDiscoveryService.discoverPatterns();
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].winRate).toBeGreaterThan(80);
    expect(patterns[0].statisticalSignificance).toBeGreaterThan(90);
  });

  it('5. StrategyRecommendationEngineService - generates non-automated evidence-backed advice', () => {
    const recs = StrategyRecommendationEngineService.getRecommendations();
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].supportingEvidenceText).toBeDefined();
    expect(recs[0].historicalTradeIds.length).toBeGreaterThan(0);
  });
});
