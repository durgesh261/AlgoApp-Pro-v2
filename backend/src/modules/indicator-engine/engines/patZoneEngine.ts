import { CandleDto, SupplyZone, DemandZone } from '@algoapp/shared';
import { StructureEvent } from './marketStructureEngine.js';

export class PatZoneEngine {
  public static calculateAtr(candles: CandleDto[], period: number = 14): number {
    if (candles.length < 2) return 100.0;
    const trs: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i]!.high;
      const low = candles[i]!.low;
      const prevClose = candles[i - 1]!.close;
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      trs.push(tr);
    }
    const recentTrs = trs.slice(-period);
    const sum = recentTrs.reduce((acc, v) => acc + v, 0);
    return sum / Math.max(1, recentTrs.length);
  }

  public static extractPatZones(
    symbol: string,
    candles: CandleDto[],
    events: StructureEvent[]
  ): { supplyZones: SupplyZone[]; demandZones: DemandZone[]; liquiditySwept: boolean } {
    const supplyZones: SupplyZone[] = [];
    const demandZones: DemandZone[] = [];
    let liquiditySwept = false;

    if (candles.length < 30) {
      return { supplyZones, demandZones, liquiditySwept };
    }

    const atr = this.calculateAtr(candles, 14);
    const latest = candles[candles.length - 1]!;

    // Check Liquidity Sweeps over 30 candles
    const lookback = candles.slice(-30);
    const highestHigh = Math.max(...lookback.map((c) => c.high));
    const lowestLow = Math.min(...lookback.map((c) => c.low));

    if (latest.high >= highestHigh && latest.close < highestHigh) {
      liquiditySwept = true;
    }
    if (latest.low <= lowestLow && latest.close > lowestLow) {
      liquiditySwept = true;
    }

    // Process Structure Events for PAT Order Blocks
    for (const evt of events) {
      if (evt.direction === 'BULLISH') {
        // Demand Zone
        const demandLower = evt.brokenLevel - 0.2 * atr;
        const demandUpper = evt.brokenLevel + 0.5 * atr;
        demandZones.push({
          id: `PAT-DEM-${symbol}-${evt.index}`,
          symbol,
          timeframe: '1H',
          type: 'DEMAND',
          upperPrice: Number(demandUpper.toFixed(2)),
          lowerPrice: Number(demandLower.toFixed(2)),
          patStrength: 85.0,
          smcStrength: 0.0,
          mergedStrength: 85.0,
          width: Number((demandUpper - demandLower).toFixed(2)),
          freshness: 100.0,
          touchCount: 0,
          age: candles.length - 1 - evt.index,
          confidence: 85.0,
          status: 'NEW',
          source: 'PAT',
          createdAt: evt.time,
          updatedAt: evt.time,
        });
      } else {
        // Supply Zone
        const supplyUpper = evt.brokenLevel + 0.2 * atr;
        const supplyLower = evt.brokenLevel - 0.5 * atr;
        supplyZones.push({
          id: `PAT-SUP-${symbol}-${evt.index}`,
          symbol,
          timeframe: '1H',
          type: 'SUPPLY',
          upperPrice: Number(supplyUpper.toFixed(2)),
          lowerPrice: Number(supplyLower.toFixed(2)),
          patStrength: 85.0,
          smcStrength: 0.0,
          mergedStrength: 85.0,
          width: Number((supplyUpper - supplyLower).toFixed(2)),
          freshness: 100.0,
          touchCount: 0,
          age: candles.length - 1 - evt.index,
          confidence: 85.0,
          status: 'NEW',
          source: 'PAT',
          createdAt: evt.time,
          updatedAt: evt.time,
        });
      }
    }

    return { supplyZones, demandZones, liquiditySwept };
  }
}
