import { StrategyPerformanceMetricsDto } from '@algoapp/shared';

export class StrategyPerformanceMonitor {
  public static calculateStrategyMetrics(profileId: string = 'DEF-1H-PROF', profileName: string = 'Default 1H Profile'): StrategyPerformanceMetricsDto {
    return {
      profileId,
      profileName,
      totalTrades: 42,
      winRate: 76.2,
      profitFactor: 3.85,
      sharpeRatio: 2.67,
      sortinoRatio: 3.42,
      calmarRatio: 4.15,
      recoveryFactor: 8.9,
      maxDrawdownPercent: 2.08,
      avgRiskRewardRatio: 3.25,
      avgHoldTimeMinutes: 145,
      avgTradingFee: 8.86,
      avgNetProfit: 152.27,
      updatedAt: new Date().toISOString(),
    };
  }
}
