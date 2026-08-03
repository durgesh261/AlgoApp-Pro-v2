import { WalletStateDto } from '@algoapp/shared';

let walletState: WalletStateDto = {
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
  public async getWalletState(): Promise<WalletStateDto> {
    return walletState;
  }

  public async applyTradeResult(netPnL: number, grossPnL: number, marginUsed: number): Promise<WalletStateDto> {
    const currentBalance = walletState.currentBalance + netPnL;
    const availableBalance = currentBalance - Math.max(0, walletState.usedMargin - marginUsed);
    const equity = currentBalance;
    const realizedPnL = walletState.realizedPnL + netPnL;
    const totalGrossPnL = walletState.grossPnL + grossPnL;
    const totalNetPnL = walletState.netPnL + netPnL;
    const peakEquity = Math.max(walletState.peakEquity, equity);
    
    const drawdownAmount = peakEquity - equity;
    const maxDrawdownPercent = peakEquity > 0 ? Math.max(walletState.maxDrawdownPercent, Number(((drawdownAmount / peakEquity) * 100).toFixed(2))) : 0;

    walletState = {
      ...walletState,
      currentBalance: Number(currentBalance.toFixed(2)),
      availableBalance: Number(availableBalance.toFixed(2)),
      equity: Number(equity.toFixed(2)),
      realizedPnL: Number(realizedPnL.toFixed(2)),
      grossPnL: Number(totalGrossPnL.toFixed(2)),
      netPnL: Number(totalNetPnL.toFixed(2)),
      dailyProfit: Number((walletState.dailyProfit + netPnL).toFixed(2)),
      weeklyProfit: Number((walletState.weeklyProfit + netPnL).toFixed(2)),
      monthlyProfit: Number((walletState.monthlyProfit + netPnL).toFixed(2)),
      peakEquity: Number(peakEquity.toFixed(2)),
      maxDrawdownPercent,
      updatedAt: new Date().toISOString(),
    };

    return walletState;
  }

  public async resetWallet(initialBalance: number = 10.0): Promise<WalletStateDto> {
    walletState = {
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
    return walletState;
  }
}
