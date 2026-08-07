import { WalletStateDto } from '@algoapp/shared';
import { prisma } from '../../../db.js';

let memoryWalletState: WalletStateDto = {
  id: 'default-wallet-state',
  currentBalance: 10.0,
  availableBalance: 10.0,
  usedMargin: 0.0,
  equity: 10.0,
  realizedPnL: 0.0,
  unrealizedPnL: 0.0,
  grossPnL: 0.0,
  netPnL: 0.0,
  dailyProfit: 0.0,
  weeklyProfit: 0.0,
  monthlyProfit: 0.0,
  peakEquity: 10.0,
  maxDrawdownPercent: 0.0,
  updatedAt: new Date().toISOString(),
};

export class WalletEngineService {
  /**
   * Retrieves the current synchronized wallet state.
   */
  public async getWalletState(): Promise<WalletStateDto> {
    try {
      if (prisma.walletState?.findUnique) {
        const dbState = await prisma.walletState.findUnique({
          where: { id: 'default-wallet-state' },
        });
        if (dbState) {
          memoryWalletState = {
            id: dbState.id,
            currentBalance: dbState.currentBalance,
            availableBalance: dbState.availableBalance,
            usedMargin: dbState.usedMargin,
            equity: dbState.equity,
            realizedPnL: dbState.realizedPnL,
            unrealizedPnL: dbState.unrealizedPnL,
            grossPnL: dbState.grossPnL,
            netPnL: dbState.netPnL,
            dailyProfit: dbState.dailyProfit,
            weeklyProfit: dbState.weeklyProfit,
            monthlyProfit: dbState.monthlyProfit,
            peakEquity: dbState.peakEquity,
            maxDrawdownPercent: dbState.maxDrawdownPercent,
            updatedAt: dbState.updatedAt.toISOString(),
          };
        }
      }
    } catch {
      // Fallback to memory
    }

    return memoryWalletState;
  }

  /**
   * Applies the exact financial result of a completed trade to wallet state.
   */
  public async applyTradeResult(
    netPnL: number,
    grossPnL: number,
    marginReleased: number = 0
  ): Promise<WalletStateDto> {
    const current = await this.getWalletState();

    const currentBalance = Number((current.currentBalance + netPnL).toFixed(4));
    const usedMargin = Math.max(0, Number((current.usedMargin - marginReleased).toFixed(4)));
    const availableBalance = Math.max(0, Number((currentBalance - usedMargin).toFixed(4)));
    const equity = currentBalance;
    const realizedPnL = Number((current.realizedPnL + netPnL).toFixed(4));
    const totalGrossPnL = Number((current.grossPnL + grossPnL).toFixed(4));
    const totalNetPnL = Number((current.netPnL + netPnL).toFixed(4));
    const peakEquity = Math.max(current.peakEquity, equity);

    const drawdownAmount = peakEquity - equity;
    const maxDrawdownPercent =
      peakEquity > 0
        ? Math.max(current.maxDrawdownPercent, Number(((drawdownAmount / peakEquity) * 100).toFixed(2)))
        : 0;

    memoryWalletState = {
      ...current,
      currentBalance,
      availableBalance,
      usedMargin,
      equity,
      realizedPnL,
      grossPnL: totalGrossPnL,
      netPnL: totalNetPnL,
      dailyProfit: Number((current.dailyProfit + netPnL).toFixed(4)),
      weeklyProfit: Number((current.weeklyProfit + netPnL).toFixed(4)),
      monthlyProfit: Number((current.monthlyProfit + netPnL).toFixed(4)),
      peakEquity,
      maxDrawdownPercent,
      updatedAt: new Date().toISOString(),
    };

    // Persist to Prisma
    try {
      if (prisma.walletState?.upsert) {
        await prisma.walletState.upsert({
          where: { id: 'default-wallet-state' },
          create: {
            id: 'default-wallet-state',
            currentBalance,
            availableBalance,
            usedMargin,
            equity,
            realizedPnL,
            unrealizedPnL: 0,
            grossPnL: totalGrossPnL,
            netPnL: totalNetPnL,
            dailyProfit: memoryWalletState.dailyProfit,
            weeklyProfit: memoryWalletState.weeklyProfit,
            monthlyProfit: memoryWalletState.monthlyProfit,
            peakEquity,
            maxDrawdownPercent,
          },
          update: {
            currentBalance,
            availableBalance,
            usedMargin,
            equity,
            realizedPnL,
            grossPnL: totalGrossPnL,
            netPnL: totalNetPnL,
            dailyProfit: memoryWalletState.dailyProfit,
            weeklyProfit: memoryWalletState.weeklyProfit,
            monthlyProfit: memoryWalletState.monthlyProfit,
            peakEquity,
            maxDrawdownPercent,
          },
        });
      }
    } catch {
      // Memory fallback active
    }

    return memoryWalletState;
  }

  /**
   * Resets wallet to specified baseline balance.
   */
  public async resetWallet(initialBalance: number = 10.0): Promise<WalletStateDto> {
    memoryWalletState = {
      id: 'default-wallet-state',
      currentBalance: initialBalance,
      availableBalance: initialBalance,
      usedMargin: 0.0,
      equity: initialBalance,
      realizedPnL: 0.0,
      unrealizedPnL: 0.0,
      grossPnL: 0.0,
      netPnL: 0.0,
      dailyProfit: 0.0,
      weeklyProfit: 0.0,
      monthlyProfit: 0.0,
      peakEquity: initialBalance,
      maxDrawdownPercent: 0.0,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (prisma.walletState?.upsert) {
        await prisma.walletState.upsert({
          where: { id: 'default-wallet-state' },
          create: {
            id: 'default-wallet-state',
            currentBalance: initialBalance,
            availableBalance: initialBalance,
            usedMargin: 0.0,
            equity: initialBalance,
            realizedPnL: 0.0,
            unrealizedPnL: 0.0,
            grossPnL: 0.0,
            netPnL: 0.0,
            dailyProfit: 0.0,
            weeklyProfit: 0.0,
            monthlyProfit: 0.0,
            peakEquity: initialBalance,
            maxDrawdownPercent: 0.0,
          },
          update: {
            currentBalance: initialBalance,
            availableBalance: initialBalance,
            usedMargin: 0.0,
            equity: initialBalance,
            realizedPnL: 0.0,
            unrealizedPnL: 0.0,
            grossPnL: 0.0,
            netPnL: 0.0,
            dailyProfit: 0.0,
            weeklyProfit: 0.0,
            monthlyProfit: 0.0,
            peakEquity: initialBalance,
            maxDrawdownPercent: 0.0,
          },
        });
      }
    } catch {
      // Memory fallback active
    }

    return memoryWalletState;
  }
}
