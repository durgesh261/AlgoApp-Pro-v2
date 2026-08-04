import { MonteCarloConfig, MonteCarloResult, PerformanceMetrics } from '@algoapp/shared';

export class MonteCarloSimulatorService {
  public static runSimulation(
    metrics: PerformanceMetrics,
    config: MonteCarloConfig = { iterations: 1000, confidenceLevel: 95 }
  ): MonteCarloResult {
    const iterations = config.iterations || 1000;
    const simulatedReturns: number[] = [];
    const simulatedDrawdowns: number[] = [];
    let ruinCount = 0;

    const initialCapital = 50000.0;
    const avgTradePnL = metrics.totalTrades > 0 ? metrics.netPnL / metrics.totalTrades : 0;

    for (let i = 0; i < iterations; i++) {
      let balance = initialCapital;
      let peak = initialCapital;
      let maxDD = 0;

      for (let t = 0; t < metrics.totalTrades; t++) {
        // Randomize trade result with normal noise
        const win = Math.random() < (metrics.winRatePercent / 100);
        const tradeOutcome = win ? Math.abs(avgTradePnL * 1.5) : -Math.abs(avgTradePnL * 1.2);
        balance += tradeOutcome;
        peak = Math.max(peak, balance);

        const dd = peak > 0 ? ((peak - balance) / peak) * 100 : 0;
        maxDD = Math.max(maxDD, dd);

        if (balance <= initialCapital * 0.5) {
          ruinCount += 1;
          break;
        }
      }

      simulatedReturns.push(balance - initialCapital);
      simulatedDrawdowns.push(maxDD);
    }

    simulatedReturns.sort((a, b) => a - b);
    simulatedDrawdowns.sort((a, b) => a - b);

    const expectedReturnUsd = Number((simulatedReturns.reduce((sum, r) => sum + r, 0) / iterations).toFixed(2));
    const worstDrawdownPercent = Number((simulatedDrawdowns[Math.floor(iterations * 0.95)] ?? 0).toFixed(2));
    const probabilityOfRuinPercent = Number(((ruinCount / iterations) * 100).toFixed(1));

    const lowerIdx = Math.floor(iterations * ((100 - config.confidenceLevel) / 200));
    const upperIdx = Math.floor(iterations * (1 - (100 - config.confidenceLevel) / 200));

    const confidenceIntervalLowerUsd = Number((simulatedReturns[lowerIdx] ?? 0).toFixed(2));
    const confidenceIntervalUpperUsd = Number((simulatedReturns[upperIdx] ?? 0).toFixed(2));
    const avgRecoveryTimeDays = Number((worstDrawdownPercent * 0.4).toFixed(1));

    return {
      iterations,
      expectedReturnUsd,
      worstDrawdownPercent,
      probabilityOfRuinPercent,
      confidenceIntervalLowerUsd,
      confidenceIntervalUpperUsd,
      avgRecoveryTimeDays,
    };
  }
}
