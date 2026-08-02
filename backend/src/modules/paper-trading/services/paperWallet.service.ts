import { PaperWalletDto } from '@algoapp/shared';

// Memory fallback store for standalone paper trading execution
let currentWallet: PaperWalletDto = {
  id: 'default-paper-wallet',
  virtualBalance: 50000.0,
  availableMargin: 50000.0,
  usedMargin: 0.0,
  realizedPnL: 3840.5,
  unrealizedPnL: 1116.0,
  equity: 54956.5,
  updatedAt: new Date().toISOString(),
};

export class PaperWalletService {
  public static async getWallet(): Promise<PaperWalletDto> {
    // Recalculate equity
    currentWallet.equity =
      currentWallet.virtualBalance + currentWallet.realizedPnL + currentWallet.unrealizedPnL;
    currentWallet.availableMargin = Math.max(0, currentWallet.equity - currentWallet.usedMargin);
    currentWallet.updatedAt = new Date().toISOString();
    return currentWallet;
  }

  public static async allocateMargin(amount: number): Promise<boolean> {
    const wallet = await this.getWallet();
    if (wallet.availableMargin < amount) {
      return false;
    }
    currentWallet.usedMargin += amount;
    currentWallet.availableMargin -= amount;
    currentWallet.updatedAt = new Date().toISOString();
    return true;
  }

  public static async releaseMargin(amount: number): Promise<void> {
    currentWallet.usedMargin = Math.max(0, currentWallet.usedMargin - amount);
    currentWallet.availableMargin = currentWallet.equity - currentWallet.usedMargin;
    currentWallet.updatedAt = new Date().toISOString();
  }

  public static async updatePnL(realizedDelta: number, unrealizedCurrent: number): Promise<PaperWalletDto> {
    currentWallet.realizedPnL += realizedDelta;
    currentWallet.unrealizedPnL = unrealizedCurrent;
    return this.getWallet();
  }
}
