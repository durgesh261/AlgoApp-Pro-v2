import { describe, it, expect } from 'vitest';
import { MarketRuleEvaluator } from '../../backend/src/modules/rules/evaluators/marketRuleEvaluator.js';
import { DynamicLeverageEvaluator } from '../../backend/src/modules/rules/evaluators/dynamicLeverageEvaluator.js';
import { ConfidenceScoringEvaluator } from '../../backend/src/modules/rules/evaluators/confidenceScoringEvaluator.js';

describe('Trading Rules Engine Unit Tests', () => {
  it('should validate supported perpetual pairs & enforce strict 1H timeframe', () => {
    expect(MarketRuleEvaluator.isSupportedPair('BTCUSD.P')).toBe(true);
    expect(MarketRuleEvaluator.isSupportedPair('SOLUSD.P')).toBe(true);
    expect(MarketRuleEvaluator.isSupportedPair('DOGEUSD.P')).toBe(false);

    expect(MarketRuleEvaluator.isSupportedTimeframe('1H')).toBe(true);
    expect(MarketRuleEvaluator.isSupportedTimeframe('15M')).toBe(true);
    expect(MarketRuleEvaluator.isSupportedTimeframe('5M')).toBe(false);
  });

  it('should calculate deterministic recommended leverage based on SL distance % and risk %', () => {
    // Entry: 60,000, SL: 58,800 -> SL distance = 1,200 (2.0%)
    // Risk: 2.0% -> Recommended Leverage = 2.0 / 2.0 = 1.0x
    const res1 = DynamicLeverageEvaluator.calculateLeverage({
      entryPrice: 60000,
      stopLossPrice: 58800,
      riskPercent: 2.0,
      maxLeverage: 50,
    });
    expect(res1.stopLossDistancePercent).toBe(2.0);
    expect(res1.recommendedLeverage).toBe(1.0);
    expect(res1.boundedByMax).toBe(false);

    // Entry: 60,000, SL: 59,700 -> SL distance = 300 (0.5%)
    // Risk: 2.0% -> Recommended Leverage = 2.0 / 0.5 = 4.0x
    const res2 = DynamicLeverageEvaluator.calculateLeverage({
      entryPrice: 60000,
      stopLossPrice: 59700,
      riskPercent: 2.0,
      maxLeverage: 50,
    });
    expect(res2.stopLossDistancePercent).toBe(0.5);
    expect(res2.recommendedLeverage).toBe(4.0);
  });

  it('should apply score bonuses and penalties deterministically', () => {
    const score = ConfidenceScoringEvaluator.calculateScore(50, {
      isFresh: true,        // +20
      isMerged: true,       // +15
      isFirstTouch: true,   // +20
      isMomentumAligned: true, // +10
    });
    expect(score).toBe(100); // Capped at 100
  });
});
