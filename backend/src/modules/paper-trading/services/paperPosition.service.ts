import { PaperPositionDto, PaperPositionSide } from '@algoapp/shared';
import { PaperWalletService } from './paperWallet.service.js';

let openPositions: PaperPositionDto[] = [
  {
    id: 'POS-8801',
    symbol: 'BTCUSD.P',
    side: PaperPositionSide.LONG,
    entryPrice: 63150.0,
    markPrice: 64250.0,
    quantity: 0.5,
    notionalValue: 32125.0,
    unrealizedPnL: 550.0,
    realizedPnL: 0.0,
    leverage: 10.0,
    marginAllocated: 3212.5,
    stopLoss: 62400.0,
    takeProfit: 65800.0,
    openedAt: '2026-08-02T18:14:02Z',
    updatedAt: '2026-08-02T20:44:00Z',
  },
  {
    id: 'POS-8802',
    symbol: 'ETHUSD.P',
    side: PaperPositionSide.LONG,
    entryPrice: 3420.0,
    markPrice: 3480.25,
    quantity: 4.0,
    notionalValue: 13921.0,
    unrealizedPnL: 241.0,
    realizedPnL: 0.0,
    leverage: 5.0,
    marginAllocated: 2784.2,
    stopLoss: 3380.0,
    takeProfit: 3580.0,
    openedAt: '2026-08-02T19:05:18Z',
    updatedAt: '2026-08-02T20:44:00Z',
  },
  {
    id: 'POS-8803',
    symbol: 'SOLUSD.P',
    side: PaperPositionSide.SHORT,
    entryPrice: 144.2,
    markPrice: 142.1,
    quantity: 50.0,
    notionalValue: 7105.0,
    unrealizedPnL: 105.0,
    realizedPnL: 0.0,
    leverage: 5.0,
    marginAllocated: 1421.0,
    stopLoss: 146.5,
    takeProfit: 138.0,
    openedAt: '2026-08-02T19:42:50Z',
    updatedAt: '2026-08-02T20:44:00Z',
  },
  {
    id: 'POS-8804',
    symbol: 'XRPUSD.P',
    side: PaperPositionSide.LONG,
    entryPrice: 0.562,
    markPrice: 0.584,
    quantity: 10000.0,
    notionalValue: 5840.0,
    unrealizedPnL: 220.0,
    realizedPnL: 0.0,
    leverage: 3.0,
    marginAllocated: 1946.6,
    stopLoss: 0.548,
    takeProfit: 0.625,
    openedAt: '2026-08-02T20:10:11Z',
    updatedAt: '2026-08-02T20:44:00Z',
  },
];

export class PaperPositionService {
  public static async getOpenPositions(): Promise<PaperPositionDto[]> {
    return openPositions;
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

    openPositions.splice(index, 1);
    return { ...pos, realizedPnL, updatedAt: new Date().toISOString() };
  }
}
