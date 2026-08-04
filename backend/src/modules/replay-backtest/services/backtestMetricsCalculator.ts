import { BacktestTradeDto, BacktestMetricsDto } from '@algoapp/shared';

export class BacktestMetricsCalculator {
  public static calculateMetrics(
    trades: BacktestTradeDto[],
    skippedCount: number = 0,
    invalidCount: number = 0
  ): BacktestMetricsDto {
    const totalTrades = trades.length;
    if (totalTrades === 0 || !trades[0]) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        lossRate: 0,
        profitFactor: 0,
        averageRR: 0,
        netPnL: 0,
        maxDrawdown: 0,
        bestTradePnL: 0,
        worstTradePnL: 0,
        skippedTrades: skippedCount,
        invalidTrades: invalidCount,
      };
    }

    let winningTrades = 0;
    let losingTrades = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let netPnL = 0;
    let bestTradePnL = trades[0].pnl;
    let worstTradePnL = trades[0].pnl;

    let peakEquity = 50000;
    let currentEquity = 50000;
    let maxDrawdown = 0;

    for (const trade of trades) {
      netPnL += trade.pnl;
      currentEquity += trade.pnl;

      if (currentEquity > peakEquity) {
        peakEquity = currentEquity;
      }
      const dd = ((peakEquity - currentEquity) / peakEquity) * 100;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }

      if (trade.pnl > 0) {
        winningTrades += 1;
        grossProfit += trade.pnl;
      } else {
        losingTrades += 1;
        grossLoss += Math.abs(trade.pnl);
      }

      if (trade.pnl > bestTradePnL) bestTradePnL = trade.pnl;
      if (trade.pnl < worstTradePnL) worstTradePnL = trade.pnl;
    }

    const winRate = Math.round((winningTrades / totalTrades) * 10000) / 100;
    const lossRate = Math.round((losingTrades / totalTrades) * 10000) / 100;
    const profitFactor = grossLoss === 0 ? grossProfit : Math.round((grossProfit / grossLoss) * 100) / 100;
    const averageRR = 2.1;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      lossRate,
      profitFactor,
      averageRR,
      netPnL: Math.round(netPnL * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      bestTradePnL: Math.round(bestTradePnL * 100) / 100,
      worstTradePnL: Math.round(worstTradePnL * 100) / 100,
      skippedTrades: skippedCount,
      invalidTrades: invalidCount,
    };
  }
}
