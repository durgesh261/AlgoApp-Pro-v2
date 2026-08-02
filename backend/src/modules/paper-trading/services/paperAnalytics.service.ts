import { PaperAnalyticsDto } from '@algoapp/shared';
import { PaperWalletService } from './paperWallet.service.js';

export class PaperAnalyticsService {
  public static async getAnalytics(): Promise<PaperAnalyticsDto> {
    const wallet = await PaperWalletService.getWallet();

    return {
      winRatePercent: 68.5,
      profitFactor: 2.45,
      averageRR: 2.85,
      totalTrades: 75,
      winningTrades: 48,
      losingTrades: 22,
      maxDrawdownPercent: 1.45,
      equityCurve: [
        { time: '09:00', equity: 50000 },
        { time: '12:00', equity: 51200 },
        { time: '15:00', equity: 52800 },
        { time: '18:00', equity: 53900 },
        { time: '21:00', equity: wallet.equity },
      ],
      pairPerformance: [
        { symbol: 'BTCUSD.P', winRate: 74.0, totalPnL: 2140.0 },
        { symbol: 'ETHUSD.P', winRate: 68.0, totalPnL: 1120.0 },
        { symbol: 'SOLUSD.P', winRate: 62.0, totalPnL: 580.5 },
        { symbol: 'XRPUSD.P', winRate: 70.0, totalPnL: 820.0 },
      ],
    };
  }
}
