import { PaperAnalyticsDto } from '@algoapp/shared';
import { PaperWalletService } from './paperWallet.service.js';
import { PaperPositionService } from './paperPosition.service.js';

export class PaperAnalyticsService {
  /**
   * Computes analytics from actual closed paper positions and live wallet
   * state instead of returning fixed numbers. Fields with no real data yet
   * (e.g. no closed trades) are omitted rather than faked.
   */
  public static async getAnalytics(): Promise<PaperAnalyticsDto> {
    const wallet = await PaperWalletService.getWallet();
    const closed = await PaperPositionService.getClosedPositions();

    const totalTrades = closed.length;
    const winners = closed.filter((p) => p.realizedPnL > 0);
    const losers = closed.filter((p) => p.realizedPnL < 0);
    const winningTrades = winners.length;
    const losingTrades = losers.length;

    const grossWin = winners.reduce((sum, p) => sum + p.realizedPnL, 0);
    const grossLoss = Math.abs(losers.reduce((sum, p) => sum + p.realizedPnL, 0));

    const winRatePercent = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : undefined;
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : undefined;
    const averageWin = winningTrades > 0 ? grossWin / winningTrades : undefined;
    const averageLoss = losingTrades > 0 ? -(grossLoss / losingTrades) : undefined;

    // Rebuild the equity curve in trade-closure order, starting from the
    // wallet balance before any realized/unrealized PnL was applied.
    const startingBalance = wallet.equity - wallet.realizedPnL - wallet.unrealizedPnL;
    let running = startingBalance;
    const sortedClosed = [...closed].sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
    const equityCurve = sortedClosed.map((p) => {
      running += p.realizedPnL;
      return { timestamp: p.updatedAt, equity: running };
    });
    equityCurve.push({ timestamp: wallet.updatedAt ?? new Date().toISOString(), equity: wallet.equity });

    const pairTotals = new Map<string, { wins: number; total: number; pnl: number }>();
    for (const p of closed) {
      const entry = pairTotals.get(p.symbol) ?? { wins: 0, total: 0, pnl: 0 };
      entry.total += 1;
      if (p.realizedPnL > 0) entry.wins += 1;
      entry.pnl += p.realizedPnL;
      pairTotals.set(p.symbol, entry);
    }
    const pairPerformance =
      pairTotals.size > 0
        ? Array.from(pairTotals.entries()).map(([symbol, v]) => ({
            symbol,
            winRate: v.total > 0 ? (v.wins / v.total) * 100 : 0,
            totalPnL: v.pnl,
          }))
        : undefined;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRatePercent,
      profitFactor,
      averageWin,
      averageLoss,
      netPnL: wallet.realizedPnL,
      equityCurve,
      pairPerformance,
    };
  }
}
