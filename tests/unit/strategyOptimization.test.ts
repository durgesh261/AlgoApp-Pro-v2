import { describe, it, expect } from 'vitest';
import { StrategyOptimizationEngineService } from '../../backend/src/modules/strategy-optimization/services/strategyOptimizationEngine.service';
import { WalkForwardTestingService } from '../../backend/src/modules/strategy-optimization/services/walkForwardTesting.service';
import { MonteCarloSimulatorService } from '../../backend/src/modules/strategy-optimization/services/monteCarloSimulator.service';
import { OptimizationReportExporterService } from '../../backend/src/modules/strategy-optimization/services/optimizationReportExporter.service';

describe('Strategy Optimization Laboratory Test Suite', () => {
  const optService = new StrategyOptimizationEngineService();

  it('1. StrategyOptimizationEngineService - executes parameter sweep grid and returns sorted results', async () => {
    const sweepInput = {
      symbol: 'BTCUSD.P',
      timeframe: '1H' as const,
      strategyProfileId: 'DEF-1H-PROF',
      patLenRange: [9, 14],
      liquidityLenRange: [30],
      mergeThresholdRange: [0.01],
      minConfidenceRange: [75, 85],
    };

    const results = await optService.runParameterSweep(sweepInput);

    expect(results).toBeDefined();
    expect(results.length).toBe(4); // 2 * 1 * 1 * 2 = 4 permutations
    expect(results[0].metrics.netPnL).toBeGreaterThanOrEqual(results[1].metrics.netPnL);
    expect(results[0].parameters).toHaveProperty('zigzagLen');
  });

  it('2. WalkForwardTestingService - splits metrics into 60% Training, 20% Validation, 20% Out-of-Sample', () => {
    const baseMetrics = {
      totalTrades: 100,
      winningTrades: 60,
      losingTrades: 40,
      winRatePercent: 60.0,
      grossPnL: 10000,
      tradingFees: 1000,
      netPnL: 9000,
      profitFactor: 2.5,
      sharpeRatio: 2.1,
      sortinoRatio: 2.8,
      maxDrawdownPercent: 5.0,
      avgHoldTimeMinutes: 120,
    };

    const wfResult = WalkForwardTestingService.runWalkForwardTest(baseMetrics);

    expect(wfResult.trainingPerformance.totalTrades).toBe(60);
    expect(wfResult.validationPerformance.totalTrades).toBe(20);
    expect(wfResult.outOfSamplePerformance.totalTrades).toBe(20);
    expect(wfResult.robustnessScore).toBeGreaterThan(0);
    expect(wfResult.robustnessScore).toBeLessThanOrEqual(100);
  });

  it('3. MonteCarloSimulatorService - runs 1000 randomized iterations and computes Probability of Ruin', () => {
    const baseMetrics = {
      totalTrades: 50,
      winningTrades: 30,
      losingTrades: 20,
      winRatePercent: 60.0,
      grossPnL: 8000,
      tradingFees: 800,
      netPnL: 7200,
      profitFactor: 2.2,
      sharpeRatio: 1.9,
      sortinoRatio: 2.4,
      maxDrawdownPercent: 4.5,
      avgHoldTimeMinutes: 180,
    };

    const mcResult = MonteCarloSimulatorService.runSimulation(baseMetrics, {
      iterations: 1000,
      confidenceLevel: 95,
    });

    expect(mcResult.iterations).toBe(1000);
    expect(mcResult.expectedReturnUsd).toBeGreaterThan(0);
    expect(mcResult.probabilityOfRuinPercent).toBeGreaterThanOrEqual(0);
    expect(mcResult.confidenceIntervalLowerUsd).toBeLessThan(mcResult.confidenceIntervalUpperUsd);
  });

  it('4. OptimizationReportExporterService - exports institutional CSV formatted string', async () => {
    const history = await optService.getOptimizationHistory();
    const csv = OptimizationReportExporterService.exportCsv(history);

    expect(csv).toContain('RunID,Symbol,Timeframe,ProfileName');
    expect(csv).toContain('BTCUSD.P');
  });
});
