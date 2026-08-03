import { CandleDto, SupplyZone, DemandZone } from '@algoapp/shared';
import { PivotPoint } from './pivotEngine.js';

export class SmcZoneEngine {
  public static calculateAtr200(candles: CandleDto[]): number {
    if (candles.length < 2) return 100.0;
    const trs: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i]!.high;
      const low = candles[i]!.low;
      const prevClose = candles[i - 1]!.close;
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      trs.push(tr);
    }
    const recentTrs = trs.slice(-200);
    const sum = recentTrs.reduce((acc, v) => acc + v, 0);
    return sum / Math.max(1, recentTrs.length);
  }

  public static extractSmcZones(
    symbol: string,
    candles: CandleDto[],
    pivots: PivotPoint[]
  ): { supplyZones: SupplyZone[]; demandZones: DemandZone[] } {
    const supplyZones: SupplyZone[] = [];
    const demandZones: DemandZone[] = [];

    if (candles.length === 0 || pivots.length === 0) {
      return { supplyZones, demandZones };
    }

    const atr200 = this.calculateAtr200(candles);

    for (const p of pivots) {
      const c = candles[p.index];
      if (!c) continue;

      // Volatility filter: skip outlier bars >= 2 * ATR200
      if (c.high - c.low >= 2 * atr200) continue;

      if (p.type === 'LOW') {
        // Bullish SMC Order Block (Demand Zone)
        const lowerPrice = Number(c.low.toFixed(2));
        const upperPrice = Number((c.low + 0.4 * atr200).toFixed(2));

        demandZones.push({
          id: `SMC-DEM-${symbol}-${p.index}`,
          symbol,
          timeframe: '1H',
          type: 'DEMAND',
          upperPrice,
          lowerPrice,
          patStrength: 0.0,
          smcStrength: 90.0,
          mergedStrength: 90.0,
          width: Number((upperPrice - lowerPrice).toFixed(2)),
          freshness: 100.0,
          touchCount: 0,
          age: candles.length - 1 - p.index,
          confidence: 90.0,
          status: 'NEW',
          source: 'SMC',
          createdAt: p.time,
          updatedAt: p.time,
        });
      } else {
        // Bearish SMC Order Block (Supply Zone)
        const upperPrice = Number(c.high.toFixed(2));
        const lowerPrice = Number((c.high - 0.4 * atr200).toFixed(2));

        supplyZones.push({
          id: `SMC-SUP-${symbol}-${p.index}`,
          symbol,
          timeframe: '1H',
          type: 'SUPPLY',
          upperPrice,
          lowerPrice,
          patStrength: 0.0,
          smcStrength: 90.0,
          mergedStrength: 90.0,
          width: Number((upperPrice - lowerPrice).toFixed(2)),
          freshness: 100.0,
          touchCount: 0,
          age: candles.length - 1 - p.index,
          confidence: 90.0,
          status: 'NEW',
          source: 'SMC',
          createdAt: p.time,
          updatedAt: p.time,
        });
      }
    }

    return { supplyZones, demandZones };
  }
}
