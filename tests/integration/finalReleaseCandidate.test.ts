import { describe, it, expect, vi } from 'vitest';
import { FailoverBenchmarkService } from '../../backend/src/modules/production/services/failoverBenchmark.service';
import { NocTelemetryService } from '../../backend/src/modules/operations-center/services/nocTelemetry.service';
import { ShadowTradingEngineService } from '../../backend/src/modules/shadow-trading/services/shadowTradingEngine.service';
import { TradeReviewEngineService } from '../../backend/src/modules/trade-review/services/tradeReviewEngine.service';
import { ProductionReadinessCalculatorService } from '../../backend/src/modules/shadow-trading/services/productionReadinessCalculator.service';
vi.mock('../../backend/src/modules/trade-accounting/services/tradeSync.service.js', () => {
  return {
    tradeSyncService: {
      getLedgerEntries: vi.fn().mockResolvedValue([
        {
          id: 'mock-uuid',
          tradeId: 'RC-TRD-999',
          exchangeOrderId: 'mock-order-id',
          symbol: 'BTCUSD.P',
          timeframe: '1H',
          strategyProfileId: 'DEF-1H-PROF',
          side: 'LONG',
          entryPrice: 60000,
          exitPrice: 65000,
          quantity: 1,
          marginUsed: 100,
          leverage: 10,
          riskPercent: 1,
          rewardPercent: 2,
          stopLoss: 59000,
          takeProfit: 65000,
          grossPnL: 5000,
          tradingFee: 10,
          fundingFee: 2,
          tax: 50,
          netPnL: 4938,
          durationSeconds: 3600,
          executionLatencyMs: 120,
          decisionConfidence: 95,
          decisionExplanation: 'Test reason',
          resultStatus: 'WIN',
          syncStatus: 'SYNCED',
          executedAt: new Date(),
          closedAt: new Date(),
        }
      ])
    }
  }
});

describe('Final Release Candidate (v1.0.0) End-to-End Regression Test Suite', () => {
  const shadowEngine = new ShadowTradingEngineService();
  const reviewEngine = new TradeReviewEngineService();

  it('1. End-to-End Pipeline - validates multi-timeframe shadow trading execution and decision recording', async () => {
    const cycleRes = await shadowEngine.runShadowCycle();

    expect(cycleRes.status).toBe('SHADOW_CYCLE_EXECUTED');
    expect(cycleRes.record).toBeDefined();
    expect(cycleRes.record.symbol).toBe('BTCUSD.P');
    expect(cycleRes.record.confidence).toBeGreaterThanOrEqual(75.0);
  });

  it('2. Trade Review Workspace - verifies complete post-trade review detail assembly and AI analysis', async () => {
    const review = await reviewEngine.getTradeReview('RC-TRD-999');

    expect(review.tradeId).toBe('RC-TRD-999');
    expect(review.ledgerEntry.netPnL).toBeGreaterThan(0);
    expect(review.aiReview.tradeSummary).toBeDefined();
    expect(review.chartSnapshot.supplyZoneRange).toBeDefined();
  });

  it('3. NOC Operations Telemetry - verifies 15 core subsystems report HEALTHY status', async () => {
    const services = await NocTelemetryService.getServiceHealthList();

    expect(services).toHaveLength(15);
    expect(services.every((s) => s.health === 'HEALTHY')).toBe(true);
  });

  it('4. Failover & Recovery Simulator - verifies automatic recovery across 8 failure scenarios', async () => {
    const failoverResults = await FailoverBenchmarkService.runFailoverSimulation();

    expect(failoverResults).toHaveLength(8);
    expect(failoverResults.every((r) => r.status === 'RECOVERED')).toBe(true);
  });

  it('5. Performance Profiling - verifies pipeline latency, DB query timings, and memory benchmarks', async () => {
    const perf = await FailoverBenchmarkService.runPerformanceProfiling();

    expect(perf.pipelineLatencyMs).toBeLessThan(50.0);
    expect(perf.apiLatencyMs).toBeLessThan(20.0);
    expect(perf.dbQueryTimingMs).toBeLessThan(5.0);
    expect(perf.memoryRssMb).toBeGreaterThan(0);
  });

  it('6. Production Readiness Score - verifies overall institutional readiness score exceeds 95.0%', () => {
    const readiness = ProductionReadinessCalculatorService.calculateReadinessScore();

    expect(readiness.overallReadinessScore).toBeGreaterThanOrEqual(95.0);
    expect(readiness.isProductionReady).toBe(true);
  });
});
