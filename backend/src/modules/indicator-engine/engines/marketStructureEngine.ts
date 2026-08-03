import { CandleDto, MarketStructure } from '@algoapp/shared';
import { PivotPoint } from './pivotEngine.js';

export interface StructureEvent {
  index: number;
  time: string;
  type: 'BOS' | 'CHOCH';
  direction: 'BULLISH' | 'BEARISH';
  brokenLevel: number;
  isInternal: boolean;
}

export class MarketStructureEngine {
  public static evaluateStructure(
    symbol: string,
    candles: CandleDto[],
    pivotsInternal: PivotPoint[],
    pivotsSwing: PivotPoint[]
  ): { marketStructure: MarketStructure; events: StructureEvent[] } {
    const events: StructureEvent[] = [];
    let internalTrend: 'BULLISH' | 'BEARISH' = 'BULLISH';
    let swingTrend: 'BULLISH' | 'BEARISH' = 'BULLISH';
    let lastBosTime: string | undefined = undefined;
    let lastChochTime: string | undefined = undefined;
    let lastPivotType: 'HIGH' | 'LOW' | undefined = undefined;
    let lastPivotPrice: number | undefined = undefined;

    if (candles.length === 0) {
      return {
        marketStructure: {
          symbol,
          timeframe: '1H',
          trend: 'BULLISH',
          internalTrend: 'BULLISH',
          swingTrend: 'BULLISH',
          liquiditySwept: false,
        },
        events,
      };
    }

    // Process Swing Structure
    let lastSwingHigh = pivotsSwing.filter((p) => p.type === 'HIGH').pop();
    let lastSwingLow = pivotsSwing.filter((p) => p.type === 'LOW').pop();

    if (pivotsSwing.length > 0) {
      const lastP = pivotsSwing[pivotsSwing.length - 1]!;
      lastPivotType = lastP.type;
      lastPivotPrice = lastP.price;
    }

    const latestCandle = candles[candles.length - 1]!;

    if (lastSwingHigh && latestCandle.close > lastSwingHigh.price) {
      const isBearish: boolean = (swingTrend as string) === 'BEARISH';
      const type: 'BOS' | 'CHOCH' = isBearish ? 'CHOCH' : 'BOS';
      swingTrend = 'BULLISH';
      lastBosTime = latestCandle.timestamp;
      if (type === 'CHOCH') lastChochTime = latestCandle.timestamp;
      events.push({
        index: candles.length - 1,
        time: latestCandle.timestamp,
        type,
        direction: 'BULLISH',
        brokenLevel: lastSwingHigh.price,
        isInternal: false,
      });
    } else if (lastSwingLow && latestCandle.close < lastSwingLow.price) {
      const isBullish: boolean = (swingTrend as string) === 'BULLISH';
      const type: 'BOS' | 'CHOCH' = isBullish ? 'CHOCH' : 'BOS';
      swingTrend = 'BEARISH';
      lastBosTime = latestCandle.timestamp;
      if (type === 'CHOCH') lastChochTime = latestCandle.timestamp;
      events.push({
        index: candles.length - 1,
        time: latestCandle.timestamp,
        type,
        direction: 'BEARISH',
        brokenLevel: lastSwingLow.price,
        isInternal: false,
      });
    }

    // Process Internal Structure
    let lastInternalHigh = pivotsInternal.filter((p) => p.type === 'HIGH').pop();
    let lastInternalLow = pivotsInternal.filter((p) => p.type === 'LOW').pop();

    if (lastInternalHigh && latestCandle.close > lastInternalHigh.price) {
      internalTrend = 'BULLISH';
    } else if (lastInternalLow && latestCandle.close < lastInternalLow.price) {
      internalTrend = 'BEARISH';
    }

    return {
      marketStructure: {
        symbol,
        timeframe: '1H',
        trend: swingTrend,
        internalTrend,
        swingTrend,
        lastPivotType,
        lastPivotPrice,
        lastBosTime,
        lastChochTime,
        liquiditySwept: false,
      },
      events,
    };
  }
}
