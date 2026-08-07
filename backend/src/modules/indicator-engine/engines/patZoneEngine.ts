import {
  CandleDto,
  DemandZone,
  MarketStructureEventDto,
  OrderBlockDto,
  SupplyZone,
  TradingTimeframe,
} from '@algoapp/shared';
import { OrderBlockWidthEngine } from './orderBlockWidthEngine.js';

export class PatZoneEngine {
  /**
   * Calculates 14-period Average True Range (ATR)
   */
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

  /**
   * Extracts Price Action Toolkit Lite Order Blocks and Supply/Demand Zones
   * based on structural expansion events and base-candle discovery.
   */
  public static extractPatZones(
    symbol: string,
    candles: CandleDto[],
    events: MarketStructureEventDto[],
    timeframe: TradingTimeframe = '1H'
  ): {
    supplyZones: SupplyZone[];
    demandZones: DemandZone[];
    orderBlocks: OrderBlockDto[];
  } {
    const supplyZones: SupplyZone[] = [];
    const demandZones: DemandZone[] = [];
    const orderBlocks: OrderBlockDto[] = [];

    if (candles.length < 10) {
      return { supplyZones, demandZones, orderBlocks };
    }

    const atr14 = this.calculateAtr(candles, 14);

    for (const evt of events) {
      const breakIdx = evt.confirmationCandleIndex;
      if (breakIdx <= 0 || breakIdx >= candles.length) continue;

      // Search up to 5 bars back from the breakout to locate the exact base candle
      const searchStart = Math.max(0, breakIdx - 5);

      if (evt.direction === 'BULLISH') {
        // Bullish Expansion -> Demand Zone (Bullish Order Block)
        let minLow = Infinity;
        let baseCandleIdx = searchStart;

        for (let k = searchStart; k < breakIdx; k++) {
          if (candles[k]!.low < minLow) {
            minLow = candles[k]!.low;
            baseCandleIdx = k;
          }
        }

        const baseCandle = candles[baseCandleIdx] ?? candles[breakIdx - 1]!;
        const baseHeight = baseCandle.high - baseCandle.low;
        const zoneHeight = Math.max(baseHeight * 0.5, Math.min(baseHeight, 0.6 * atr14));

        const lowerPrice = Number(baseCandle.low.toFixed(4));
        const upperPrice = Number((baseCandle.low + zoneHeight).toFixed(4));
        const width = Number((upperPrice - lowerPrice).toFixed(4));

        const zoneId = `PAT-DEM-${symbol}-${evt.index}-${baseCandleIdx}`;

        demandZones.push({
          id: zoneId,
          symbol,
          timeframe,
          type: 'DEMAND',
          upperPrice,
          lowerPrice,
          patStrength: 85.0,
          smcStrength: 0.0,
          mergedStrength: 85.0,
          width,
          freshness: 100.0,
          touchCount: 0,
          age: candles.length - 1 - breakIdx,
          confidence: 85.0,
          status: 'NEW',
          source: 'PAT',
          createdAt: evt.time,
          updatedAt: evt.time,
        });

        orderBlocks.push(
          OrderBlockWidthEngine.enrichOrderBlock(
            `OB-${zoneId}`,
            symbol,
            timeframe,
            'BULLISH',
            upperPrice,
            lowerPrice,
            baseCandleIdx,
            breakIdx,
            false,
            false,
            0,
            'PAT',
            evt.time
          )
        );
      } else {
        // Bearish Expansion -> Supply Zone (Bearish Order Block)
        let maxHigh = -Infinity;
        let baseCandleIdx = searchStart;

        for (let k = searchStart; k < breakIdx; k++) {
          if (candles[k]!.high > maxHigh) {
            maxHigh = candles[k]!.high;
            baseCandleIdx = k;
          }
        }

        const baseCandle = candles[baseCandleIdx] ?? candles[breakIdx - 1]!;
        const baseHeight = baseCandle.high - baseCandle.low;
        const zoneHeight = Math.max(baseHeight * 0.5, Math.min(baseHeight, 0.6 * atr14));

        const upperPrice = Number(baseCandle.high.toFixed(4));
        const lowerPrice = Number((baseCandle.high - zoneHeight).toFixed(4));
        const width = Number((upperPrice - lowerPrice).toFixed(4));

        const zoneId = `PAT-SUP-${symbol}-${evt.index}-${baseCandleIdx}`;

        supplyZones.push({
          id: zoneId,
          symbol,
          timeframe,
          type: 'SUPPLY',
          upperPrice,
          lowerPrice,
          patStrength: 85.0,
          smcStrength: 0.0,
          mergedStrength: 85.0,
          width,
          freshness: 100.0,
          touchCount: 0,
          age: candles.length - 1 - breakIdx,
          confidence: 85.0,
          status: 'NEW',
          source: 'PAT',
          createdAt: evt.time,
          updatedAt: evt.time,
        });

        orderBlocks.push(
          OrderBlockWidthEngine.enrichOrderBlock(
            `OB-${zoneId}`,
            symbol,
            timeframe,
            'BEARISH',
            upperPrice,
            lowerPrice,
            baseCandleIdx,
            breakIdx,
            false,
            false,
            0,
            'PAT',
            evt.time
          )
        );
      }
    }

    return { supplyZones, demandZones, orderBlocks };
  }
}
