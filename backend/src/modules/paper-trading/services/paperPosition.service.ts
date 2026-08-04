import { PaperPositionDto, PaperPositionSide } from '@algoapp/shared';
import { PaperWalletService } from './paperWallet.service.js';

let openPositions: PaperPositionDto[] = [];

// History of closed positions — the source of truth for win/loss analytics.
// Previously closePosition() discarded this data entirely, which is why
// analytics endpoints had to fall back to hardcoded numbers.
let closedPositions: PaperPositionDto[] = [];

export class PaperPositionService {
  public static async getOpenPositions(): Promise<PaperPositionDto[]> {
    return openPositions;
  }

  public static async getClosedPositions(): Promise<PaperPositionDto[]> {
    return closedPositions;
  }

  public static async openPosition(
    symbol: string,
    side: PaperPositionSide,
    entryPrice: number,
    quantity: number,
    leverage: number,
    stopLoss?: number,
    takeProfit?: number
  ): Promise<PaperPositionDto> {
    const notionalValue = entryPrice * quantity;
    const marginAllocated = notionalValue / leverage;

    await PaperWalletService.allocateMargin(marginAllocated);

    const position: PaperPositionDto = {
      id: `POS-${Date.now()}`,
      symbol,
      side,
      entryPrice,
      markPrice: entryPrice,
      quantity,
      notionalValue,
      unrealizedPnL: 0.0,
      realizedPnL: 0.0,
      leverage,
      marginAllocated,
      stopLoss,
      takeProfit,
      openedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    openPositions.push(position);
    return position;
  }

  public static async closePosition(positionId: string, exitPrice: number): Promise<PaperPositionDto | null> {
    const index = openPositions.findIndex((p) => p.id === positionId);
    if (index === -1) return null;

    const pos = openPositions[index]!;
    const pnlMultiplier = pos.side === PaperPositionSide.LONG ? 1 : -1;
    const realizedPnL = (exitPrice - pos.entryPrice) * pos.quantity * pnlMultiplier;

    await PaperWalletService.releaseMargin(pos.marginAllocated);
    await PaperWalletService.updatePnL(realizedPnL, 0);

    const closed: PaperPositionDto = {
      ...pos,
      markPrice: exitPrice,
      unrealizedPnL: 0,
      realizedPnL,
      updatedAt: new Date().toISOString(),
    };

    openPositions.splice(index, 1);
    closedPositions.push(closed);
    return closed;
  }
}
