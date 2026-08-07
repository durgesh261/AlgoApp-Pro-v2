import {
  CandleDto,
  MarketStructure,
  MarketStructureEventDto,
  PivotPointDto,
  TradingTimeframe,
} from '@algoapp/shared';

export type StructureEvent = MarketStructureEventDto;

export class MarketStructureEngine {
  /**
   * Bar-by-bar chronological evaluation of Market Structure (BOS & CHoCH)
   * for both Swing Structure and Internal Structure matching LuxAlgo & UAlgo.
   */
  public static evaluateStructure(
    symbol: string,
    candles: CandleDto[],
    pivotsInternal: PivotPointDto[],
    pivotsSwing: PivotPointDto[],
    timeframe: TradingTimeframe = '1H'
  ): {
    marketStructure: MarketStructure;
    events: MarketStructureEventDto[];
    swingEvents: MarketStructureEventDto[];
    internalEvents: MarketStructureEventDto[];
  } {
    const events: MarketStructureEventDto[] = [];
    const swingEvents: MarketStructureEventDto[] = [];
    const internalEvents: MarketStructureEventDto[] = [];

    let swingTrend: 'BULLISH' | 'BEARISH' = 'BULLISH';
    let internalTrend: 'BULLISH' | 'BEARISH' = 'BULLISH';

    let lastBosTime: string | undefined = undefined;
    let lastChochTime: string | undefined = undefined;
    let lastPivotType: 'HIGH' | 'LOW' | undefined = undefined;
    let lastPivotPrice: number | undefined = undefined;

    if (candles.length === 0) {
      return {
        marketStructure: {
          symbol,
          timeframe,
          trend: 'BULLISH',
          internalTrend: 'BULLISH',
          swingTrend: 'BULLISH',
          liquiditySwept: false,
        },
        events,
        swingEvents,
        internalEvents,
      };
    }

    // Sort pivots chronologically
    const sortedSwingPivots = [...pivotsSwing].sort((a, b) => a.index - b.index);
    const sortedInternalPivots = [...pivotsInternal].sort((a, b) => a.index - b.index);

    // Track latest active confirmed swing levels
    let activeSwingHigh: PivotPointDto | null = null;
    let activeSwingLow: PivotPointDto | null = null;

    let activeInternalHigh: PivotPointDto | null = null;
    let activeInternalLow: PivotPointDto | null = null;

    let swingPivotIdx = 0;
    let internalPivotIdx = 0;

    // Bar-by-bar chronological sweep
    for (let i = 0; i < candles.length; i++) {
      const candle = candles[i]!;

      // 1. Ingest any swing pivots confirmed at or before this candle index
      while (
        swingPivotIdx < sortedSwingPivots.length &&
        sortedSwingPivots[swingPivotIdx]!.confirmedAtIndex <= i
      ) {
        const p = sortedSwingPivots[swingPivotIdx]!;
        if (p.type === 'HIGH') {
          activeSwingHigh = p;
        } else {
          activeSwingLow = p;
        }
        lastPivotType = p.type;
        lastPivotPrice = p.price;
        swingPivotIdx++;
      }

      // 2. Ingest any internal pivots confirmed at or before this candle index
      while (
        internalPivotIdx < sortedInternalPivots.length &&
        sortedInternalPivots[internalPivotIdx]!.confirmedAtIndex <= i
      ) {
        const p = sortedInternalPivots[internalPivotIdx]!;
        if (p.type === 'HIGH') {
          activeInternalHigh = p;
        } else {
          activeInternalLow = p;
        }
        internalPivotIdx++;
      }

      // 3. Evaluate Swing Structure Breakouts (Bar Close Confirmation)
      if (activeSwingHigh && candle.close > activeSwingHigh.price) {
        const isReversal = swingTrend === 'BEARISH';
        const type = isReversal ? 'CHOCH' : 'BOS';
        swingTrend = 'BULLISH';
        lastBosTime = candle.timestamp;
        if (type === 'CHOCH') lastChochTime = candle.timestamp;

        const evt: MarketStructureEventDto = {
          index: i,
          time: candle.timestamp,
          type,
          direction: 'BULLISH',
          brokenLevel: activeSwingHigh.price,
          isInternal: false,
          confirmationCandleIndex: i,
        };
        events.push(evt);
        swingEvents.push(evt);

        // Consume broken high so it doesn't trigger repeatedly on consecutive bars
        activeSwingHigh = null;
      } else if (activeSwingLow && candle.close < activeSwingLow.price) {
        const isReversal = swingTrend === 'BULLISH';
        const type = isReversal ? 'CHOCH' : 'BOS';
        swingTrend = 'BEARISH';
        lastBosTime = candle.timestamp;
        if (type === 'CHOCH') lastChochTime = candle.timestamp;

        const evt: MarketStructureEventDto = {
          index: i,
          time: candle.timestamp,
          type,
          direction: 'BEARISH',
          brokenLevel: activeSwingLow.price,
          isInternal: false,
          confirmationCandleIndex: i,
        };
        events.push(evt);
        swingEvents.push(evt);

        // Consume broken low
        activeSwingLow = null;
      }

      // 4. Evaluate Internal Structure Breakouts (Bar Close Confirmation)
      if (activeInternalHigh && candle.close > activeInternalHigh.price) {
        const isReversal = internalTrend === 'BEARISH';
        const type = isReversal ? 'CHOCH' : 'BOS';
        internalTrend = 'BULLISH';

        const evt: MarketStructureEventDto = {
          index: i,
          time: candle.timestamp,
          type,
          direction: 'BULLISH',
          brokenLevel: activeInternalHigh.price,
          isInternal: true,
          confirmationCandleIndex: i,
        };
        events.push(evt);
        internalEvents.push(evt);

        activeInternalHigh = null;
      } else if (activeInternalLow && candle.close < activeInternalLow.price) {
        const isReversal = internalTrend === 'BULLISH';
        const type = isReversal ? 'CHOCH' : 'BOS';
        internalTrend = 'BEARISH';

        const evt: MarketStructureEventDto = {
          index: i,
          time: candle.timestamp,
          type,
          direction: 'BEARISH',
          brokenLevel: activeInternalLow.price,
          isInternal: true,
          confirmationCandleIndex: i,
        };
        events.push(evt);
        internalEvents.push(evt);

        activeInternalLow = null;
      }
    }

    return {
      marketStructure: {
        symbol,
        timeframe,
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
      swingEvents,
      internalEvents,
    };
  }
}
