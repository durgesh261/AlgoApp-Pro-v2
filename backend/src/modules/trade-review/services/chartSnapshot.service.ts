import { TradeChartSnapshotDto } from '@algoapp/shared';

export class ChartSnapshotService {
  public static getSnapshot(
    entryPrice: number,
    exitPrice: number,
    stopLoss: number,
    takeProfit: number
  ): TradeChartSnapshotDto {
    const supplyZoneLow = Math.max(entryPrice, exitPrice) * 1.01;
    const supplyZoneHigh = supplyZoneLow * 1.015;

    const demandZoneHigh = Math.min(entryPrice, exitPrice) * 0.99;
    const demandZoneLow = demandZoneHigh * 0.985;

    return {
      entryPrice,
      exitPrice,
      stopLossPrice: stopLoss,
      takeProfitPrice: takeProfit,
      supplyZoneRange: `[${supplyZoneLow.toFixed(1)} - ${supplyZoneHigh.toFixed(1)}]`,
      demandZoneRange: `[${demandZoneLow.toFixed(1)} - ${demandZoneHigh.toFixed(1)}]`,
    };
  }
}
