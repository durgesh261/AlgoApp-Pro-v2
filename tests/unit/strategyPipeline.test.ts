import { describe, it, expect, beforeEach } from 'vitest';
import {
  DecisionState,
  DecisionReasonCode,
  StrategySignalOutcome,
  Candle,
} from '@algoapp/shared';

import { SessionFilterEngine } from '../../backend/src/modules/decision/filters/sessionFilterEngine.js';
import { MarketFilterEngine } from '../../backend/src/modules/decision/filters/marketFilterEngine.js';
import { SignalDeduplicationEngine } from '../../backend/src/modules/decision/deduplication/signalDeduplicationEngine.js';
import { TrendValidator } from '../../backend/src/modules/decision/validators/trendValidator.js';
import { ZoneValidator } from '../../backend/src/modules/decision/validators/zoneValidator.js';
import { MarketStructureValidator } from '../../backend/src/modules/decision/validators/marketStructureValidator.js';
import { LiquidityValidator } from '../../backend/src/modules/decision/validators/liquidityValidator.js';
import { RiskValidator } from '../../backend/src/modules/decision/validators/riskValidator.js';
import { PositionSizingEngine } from '../../backend/src/modules/decision/sizing/positionSizingEngine.js';
import { AIDecisionCenterService } from '../../backend/src/modules/ai-decision/services/aiDecisionCenter.service.js';
import { StrategyPipelineService } from '../../backend/src/modules/strategy/services/strategyPipeline.service.js';
import { IndicatorEngineService } from '../../backend/src/modules/indicator-engine/services/indicatorEngine.service.js';

// Helper to generate deterministic synthetic candles
function generateSyntheticCandles(count: number, basePrice: number, step: number = 10): Candle[] {
  const candles: Candle[] = [];
  let current = basePrice;
  const startTime = new Date('2026-08-01T12:00:00Z').getTime();

  for (let i = 0; i < count; i++) {
    const time = new Date(startTime + i * 3600 * 1000).toISOString();
    const isUp = i % 2 === 0;
    const open = current;
    const close = isUp ? open + step : open - step;
    const high = Math.max(open, close) + step * 0.5;
    const low = Math.min(open, close) - step * 0.5;
    const volume = 1000 + (i % 10) * 50;

    candles.push({
      timestamp: time,
      open,
      high,
      low,
      close,
      volume,
    });
    current = close + (i % 3 === 0 ? step * 1.5 : -step * 0.5);
  }
  return candles;
}

describe('Module 8: Deterministic Strategy Engine & Decision Pipeline', () => {
  beforeEach(() => {
    SignalDeduplicationEngine.resetHistory();
  });

  describe('1. Session Filter Engine', () => {
    it('should allow Asia session (04:00 UTC)', () => {
      const res = SessionFilterEngine.evaluateSession('2026-08-05T04:00:00Z');
      expect(res.allowed).toBe(true);
      expect(res.activeSession).toBe('ASIA');
    });

    it('should allow London session (09:00 UTC)', () => {
      const res = SessionFilterEngine.evaluateSession('2026-08-05T09:00:00Z');
      expect(res.allowed).toBe(true);
      expect(res.activeSession).toBe('LONDON');
    });

    it('should allow New York session (14:00 UTC)', () => {
      const res = SessionFilterEngine.evaluateSession('2026-08-05T14:00:00Z');
      expect(res.allowed).toBe(true);
      expect(res.activeSession).toBe('NEW_YORK');
    });

    it('should reject weekend trading if allowWeekend is false', () => {
      const saturday = '2026-08-01T14:00:00Z'; // Saturday
      const res = SessionFilterEngine.evaluateSession(saturday, { allowWeekend: false });
      expect(res.allowed).toBe(false);
      expect(res.isWeekend).toBe(true);
      expect(res.reasonCode).toBe(DecisionReasonCode.WEEKEND_TRADING_BLOCKED);
    });
  });

  describe('2. Market Regime & Volatility Filter', () => {
    const baseIndicators = IndicatorEngineService.computeIndicators(
      generateSyntheticCandles(100, 65000),
      '1H'
    );

    it('should allow normal market conditions', () => {
      const res = MarketFilterEngine.evaluateMarket(baseIndicators);
      expect(res.allowed).toBe(true);
    });

    it('should reject volatility outliers (ATR ratio >= 2.5)', () => {
      const outlierIndicators = {
        ...baseIndicators,
        atr14: 2500,
        atr200: 800, // ratio = 3.125
      };
      const res = MarketFilterEngine.evaluateMarket(outlierIndicators);
      expect(res.allowed).toBe(false);
      expect(res.marketRegime).toBe('VOLATILITY_OUTLIER');
      expect(res.reasonCode).toBe(DecisionReasonCode.MARKET_VOLATILITY_OUTLIER);
    });

    it('should reject low volatility compression (ATR ratio <= 0.25)', () => {
      const compressedIndicators = {
        ...baseIndicators,
        atr14: 100,
        atr200: 500, // ratio = 0.20
      };
      const res = MarketFilterEngine.evaluateMarket(compressedIndicators);
      expect(res.allowed).toBe(false);
      expect(res.marketRegime).toBe('COMPRESSION');
      expect(res.reasonCode).toBe(DecisionReasonCode.MARKET_COMPRESSION_LOW_ATR);
    });
  });

  describe('3. Signal Anti-Duplication & Cooldown State Machine', () => {
    it('should block trade when existing open position exists', () => {
      const res = SignalDeduplicationEngine.checkDuplication({
        symbol: 'BTCUSD.P',
        timeframe: '1H',
        candleTimestamp: '2026-08-05T12:00:00Z',
        hasOpenPosition: true,
      });
      expect(res.allowed).toBe(false);
      expect(res.reasonCode).toBe(DecisionReasonCode.EXISTING_POSITION_OPEN);
    });

    it('should block repeated entries on the same candle timestamp', () => {
      SignalDeduplicationEngine.recordExecution('BTCUSD.P', '1H', '2026-08-05T12:00:00Z', 'ZON-1');
      const res = SignalDeduplicationEngine.checkDuplication({
        symbol: 'BTCUSD.P',
        timeframe: '1H',
        candleTimestamp: '2026-08-05T12:00:00Z',
      });
      expect(res.allowed).toBe(false);
      expect(res.reasonCode).toBe(DecisionReasonCode.DUPLICATE_CANDLE_ENTRY_BLOCKED);
    });

    it('should block re-entry on the same zone ID', () => {
      SignalDeduplicationEngine.recordExecution('BTCUSD.P', '1H', '2026-08-05T12:00:00Z', 'ZON-1');
      const res = SignalDeduplicationEngine.checkDuplication({
        symbol: 'BTCUSD.P',
        timeframe: '1H',
        candleTimestamp: '2026-08-05T13:00:00Z',
        zoneId: 'ZON-1',
      });
      expect(res.allowed).toBe(false);
      expect(res.reasonCode).toBe(DecisionReasonCode.DUPLICATE_ZONE_ENTRY_BLOCKED);
    });

    it('should enforce cooldown period between trades on same pair', () => {
      SignalDeduplicationEngine.recordExecution('BTCUSD.P', '1H', '2026-08-05T12:00:00Z', 'ZON-1');
      const res = SignalDeduplicationEngine.checkDuplication({
        symbol: 'BTCUSD.P',
        timeframe: '1H',
        candleTimestamp: '2026-08-05T13:00:00Z',
        zoneId: 'ZON-2',
        cooldownMs: 60000,
      });
      expect(res.allowed).toBe(false);
      expect(res.reasonCode).toBe(DecisionReasonCode.COOLDOWN_ACTIVE);
    });
  });

  describe('4. Institutional Position Sizing Engine', () => {
    it('should compute exact risk-based position size for BTCUSD.P', () => {
      const sizing = PositionSizingEngine.calculatePositionSize({
        symbol: 'BTCUSD.P',
        accountBalance: 50000,
        entryPrice: 65000,
        stopLossPrice: 64500, // $500 SL distance
        takeProfitPrice: 66250, // $1250 TP distance (1:2.5 RR)
        riskPercent: 1.0, // $500 risk
      });

      expect(sizing.riskAmount).toBe(500);
      expect(sizing.contractQuantity).toBe(1.0); // 500 / 500 = 1.0 BTC
      expect(sizing.positionSize).toBe(65000);
      expect(sizing.leverage).toBeGreaterThanOrEqual(1);
    });

    it('should compute exact position size for ETHUSD.P', () => {
      const sizing = PositionSizingEngine.calculatePositionSize({
        symbol: 'ETHUSD.P',
        accountBalance: 50000,
        entryPrice: 3500,
        stopLossPrice: 3450, // $50 SL distance
        takeProfitPrice: 3625,
        riskPercent: 1.0, // $500 risk
      });

      expect(sizing.riskAmount).toBe(500);
      expect(sizing.contractQuantity).toBe(10.0); // 500 / 50 = 10.0 ETH
    });
  });

  describe('5. Risk & Challenge Limit Validator', () => {
    it('should reject trade if Risk to Reward ratio is below 2.0', () => {
      const res = RiskValidator.validate({
        entryPrice: 65000,
        stopLossPrice: 64000, // $1000 risk
        takeProfitPrice: 66000, // $1000 reward -> 1.0 RR
        accountBalance: 50000,
        availableMargin: 50000,
        estimatedMarginRequired: 5000,
      });

      expect(res.passed).toBe(false);
      expect(res.riskRewardRatio).toBe(1.0);
      expect(res.reasonCodes).toContain(DecisionReasonCode.RR_BELOW_MINIMUM);
    });

    it('should reject trade if daily loss limit is reached', () => {
      const res = RiskValidator.validate({
        entryPrice: 65000,
        stopLossPrice: 64500,
        takeProfitPrice: 66250,
        accountBalance: 50000,
        availableMargin: 50000,
        estimatedMarginRequired: 5000,
        dailyLossUsed: 1000,
        maxDailyLoss: 1000,
      });

      expect(res.passed).toBe(false);
      expect(res.reasonCodes).toContain(DecisionReasonCode.DAILY_LOSS_LIMIT_REACHED);
    });

    it('should reject trade if max drawdown percentage is exceeded', () => {
      const res = RiskValidator.validate({
        entryPrice: 65000,
        stopLossPrice: 64500,
        takeProfitPrice: 66250,
        accountBalance: 50000,
        availableMargin: 50000,
        estimatedMarginRequired: 5000,
        currentDrawdownPct: 5.5,
        maxDrawdownPct: 5.0,
      });

      expect(res.passed).toBe(false);
      expect(res.reasonCodes).toContain(DecisionReasonCode.MAX_DRAWDOWN_EXCEEDED);
    });
  });

  describe('6. Deterministic AI Confirmation Layer', () => {
    const sampleIndicators = IndicatorEngineService.computeIndicators(
      generateSyntheticCandles(100, 65000),
      '1H'
    );

    it('should confirm high-quality trade setup without randomness', () => {
      const aiResult = AIDecisionCenterService.confirmDecision({
        symbol: 'BTCUSD.P',
        timeframe: '1H',
        outcome: StrategySignalOutcome.BUY,
        activeZone: {
          id: 'ZON-BTC-1',
          type: 'DEMAND',
          upperPrice: 64500,
          lowerPrice: 64000,
          source: 'MERGED',
          freshness: 90,
          touchCount: 0,
          status: 'FRESH',
          score: 95,
          mergedCount: 2,
          originIndex: 10,
          createdTime: '2026-08-01T12:00:00Z',
          lastTouchTime: '2026-08-01T12:00:00Z',
        },
        indicators: sampleIndicators,
        riskRewardRatio: 2.5,
        sessionAllowed: true,
        marketAllowed: true,
      });

      expect(aiResult.approved).toBe(true);
      expect(aiResult.confidenceScore).toBeGreaterThanOrEqual(75.0);
      expect(aiResult.reasonCodes).toContain(DecisionReasonCode.AI_CONFIRMATION_APPROVED);
    });

    it('should reject poor quality setup with explicit reason codes', () => {
      const aiResult = AIDecisionCenterService.confirmDecision({
        symbol: 'BTCUSD.P',
        timeframe: '1H',
        outcome: StrategySignalOutcome.BUY,
        indicators: sampleIndicators,
        riskRewardRatio: 1.2, // Below 2.0
        sessionAllowed: false,
        marketAllowed: true,
      });

      expect(aiResult.approved).toBe(false);
      expect(aiResult.reasonCodes).toContain(DecisionReasonCode.AI_CONFIRMATION_REJECTED);
    });
  });

  describe('7. End-to-End Strategy Pipeline Replay Verification', () => {
    const pairs = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'] as const;
    const basePrices: Record<string, number> = {
      'BTCUSD.P': 65000,
      'ETHUSD.P': 3500,
      'SOLUSD.P': 140,
      'XRPUSD.P': 0.58,
    };

    for (const pair of pairs) {
      it(`should deterministically execute 15M & 1H pipeline for ${pair}`, async () => {
        for (const tf of ['15M', '1H'] as const) {
          const candles = generateSyntheticCandles(120, basePrices[pair]!, pair === 'XRPUSD.P' ? 0.01 : 10);
          const result = await StrategyPipelineService.runPipeline({
            symbol: pair,
            timeframe: tf,
            candles,
            autoExecute: false, // Dry run pipeline evaluation
          });

          expect(result).toBeDefined();
          expect(result.decision).toBeDefined();
          expect(result.decision.symbol).toBe(pair);
          expect(result.decision.timeframe).toBe(tf);
          expect(result.decision.inputSnapshotHash).toBeDefined();
          expect(result.decision.inputSnapshotHash.length).toBe(64); // SHA256 length
          expect(result.decision.reasonCodes.length).toBeGreaterThan(0);
          expect(result.indicatorSnapshot).toBeDefined();
        }
      });
    }
  });
});
