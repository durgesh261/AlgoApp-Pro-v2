import {
  CandleDto,
  LiquiditySweepDto,
  MarketStructureEventDto,
  OrderBlockDto,
  TradingTimeframe,
  ZigZagLegDto,
} from '@algoapp/shared';
import { OrderBlockWidthEngine } from './orderBlockWidthEngine.js';

// ============================================================================
// UAlgo Price Action Toolkit — ZigZag + BOS/CHoCH + OB + Liquidity Sweeps
// Direct TypeScript port of the Pine Script UAlgo section.
//
// Pine Script defaults:
//   zigzagLen = 9
//   liquidity_len = 30
//   trendLineLength = 20
// ============================================================================

export const PAT_ZIGZAG_LEN    = 9;
export const PAT_LIQUIDITY_LEN = 30;

export interface PatLegOutput {
  zigzagLegs:      ZigZagLegDto[];
  structureEvents: MarketStructureEventDto[];
  orderBlocks:     OrderBlockDto[];
  liquiditySweeps: LiquiditySweepDto[];
  paTrend:         'BULLISH' | 'BEARISH';
  atr14:           number;
}

export class PatLegEngine {

  // ============================================================
  // ATR(14) — Pine Script ta.atr(14)
  // ============================================================
  public static calculateAtr14(candles: CandleDto[]): number {
    if (candles.length < 2) return 1.0;
    const period = Math.min(14, candles.length - 1);
    let sum = 0;
    for (let i = candles.length - period; i < candles.length; i++) {
      const c    = candles[i]!;
      const prev = candles[i - 1]!;
      const tr = Math.max(
        c.high - c.low,
        Math.abs(c.high - prev.close),
        Math.abs(c.low  - prev.close)
      );
      sum += tr;
    }
    return sum / period;
  }

  // ============================================================
  // Main engine — bar-by-bar UAlgo state machine
  // ============================================================
  public static run(
    symbol:    string,
    candles:   CandleDto[],
    timeframe: TradingTimeframe = '1H'
  ): PatLegOutput {
    const zigzagLegs:      ZigZagLegDto[]           = [];
    const structureEvents: MarketStructureEventDto[] = [];
    const orderBlocks:     OrderBlockDto[]           = [];
    const liquiditySweeps: LiquiditySweepDto[]       = [];

    const atr14 = this.calculateAtr14(candles);
    const n     = candles.length;
    const len   = PAT_ZIGZAG_LEN;

    if (n < len + 2) {
      return { zigzagLegs, structureEvents, orderBlocks, liquiditySweeps, paTrend: 'BULLISH', atr14 };
    }

    // ── ZigZag paTrend tracking ──
    // Pine Script:
    //   to_up   = high[len] >= ta.highest(high, len)
    //   to_down = low[len]  <= ta.lowest(low, len)
    //   paTrend = paTrend==1 && to_down ? -1 : paTrend==-1 && to_up ? 1 : paTrend
    //
    // "ta.highest(high, len)" includes the current bar.
    // So at bar i: high[len] = candles[i-len].high
    //              ta.highest(high, len) = max(candles[i-len+1 .. i].high) — wait...
    //
    // Actually Pine Script ta.highest(src, len) = highest of src over last `len` bars
    // including current. So ta.highest(high, len) at bar i = max(candles[i-len+1..i].high).
    // high[len] at bar i = candles[i - len].high.
    // to_up  = candles[i-len].high >= max(candles[i-len+1..i].high)   → that bar's high is max
    // to_down = candles[i-len].low  <= min(candles[i-len+1..i].low)   → that bar's low is min
    //
    // This is equivalent to: "the bar `len` ago is an extremum vs. the next `len` bars"

    // Pivot highs and lows detected by the ZigZag
    const highValIdx: number[] = []; // bar timestamps where zigzag high pivot confirmed
    const highVal:    number[] = [];
    const lowValIdx:  number[] = [];
    const lowVal:     number[] = [];

    let paTrend = 1; // 1 = bullish, -1 = bearish (Pine Script default)
    let drawDown = false;
    let drawUp   = false;
    let lastState: 'up' | 'down' | null = null;

    // Liquidity level tracking
    const bullishLiqLevels: Array<{ value: number; barIdx: number; time: string }> = [];
    const bearishLiqLevels: Array<{ value: number; barIdx: number; time: string }> = [];

    for (let i = len; i < n; i++) {
      const candle = candles[i]!;

      // ── to_up / to_down detection ──
      // high[len] at bar i = candles[i - len].high
      const targetHigh = candles[i - len]!.high;
      const targetLow  = candles[i - len]!.low;

      // ta.highest(high, len) = max of last `len` bars (candles[i-len+1..i])
      let maxHigh = -Infinity;
      let minLow  = Infinity;
      for (let j = i - len + 1; j <= i; j++) {
        if (candles[j]!.high > maxHigh) maxHigh = candles[j]!.high;
        if (candles[j]!.low  < minLow)  minLow  = candles[j]!.low;
      }

      const to_up   = targetHigh >= maxHigh;
      const to_down = targetLow  <= minLow;

      const prevTrend = paTrend;
      if      (paTrend ===  1 && to_down) paTrend = -1;
      else if (paTrend === -1 && to_up)   paTrend =  1;

      const trendChanged = paTrend !== prevTrend;

      if (trendChanged && paTrend === 1) {
        // Pine Script: trend changed to bullish → push HIGH pivot
        const pivotTime  = candles[i - len]!.timestamp;
        const pivotPrice = candles[i - len]!.high;
        const pivotIdx   = i - len;
        highValIdx.push(pivotIdx);
        highVal.push(pivotPrice);

        // Draw zigzag leg from last low to this high
        if (lowVal.length > 0) {
          const lastLow    = lowVal[lowVal.length - 1]!;
          const lastLowIdx = lowValIdx[lowValIdx.length - 1]!;
          zigzagLegs.push({
            startIndex:  lastLowIdx,
            endIndex:    pivotIdx,
            startPrice:  lastLow,
            endPrice:    pivotPrice,
            direction:   'UP',
            priceLength: pivotPrice - lastLow,
            barLength:   pivotIdx - lastLowIdx,
            startTime:   candles[lastLowIdx]!.timestamp,
            endTime:     pivotTime,
          });
        }
        drawUp = false;

        // Track as bearish liquidity level (high to be swept)
        bearishLiqLevels.push({ value: pivotPrice, barIdx: pivotIdx, time: pivotTime });
      }

      if (trendChanged && paTrend === -1) {
        // Pine Script: trend changed to bearish → push LOW pivot
        const pivotTime  = candles[i - len]!.timestamp;
        const pivotPrice = candles[i - len]!.low;
        const pivotIdx   = i - len;
        lowValIdx.push(pivotIdx);
        lowVal.push(pivotPrice);

        // Draw zigzag leg from last high to this low
        if (highVal.length > 0) {
          const lastHigh    = highVal[highVal.length - 1]!;
          const lastHighIdx = highValIdx[highValIdx.length - 1]!;
          zigzagLegs.push({
            startIndex:  lastHighIdx,
            endIndex:    pivotIdx,
            startPrice:  lastHigh,
            endPrice:    pivotPrice,
            direction:   'DOWN',
            priceLength: lastHigh - pivotPrice,
            barLength:   pivotIdx - lastHighIdx,
            startTime:   candles[lastHighIdx]!.timestamp,
            endTime:     pivotTime,
          });
        }
        drawDown = false;

        // Track as bullish liquidity level (low to be swept)
        bullishLiqLevels.push({ value: pivotPrice, barIdx: pivotIdx, time: pivotTime });
      }

      // ── BOS / CHoCH DOWN detection ──
      // Pine Script: if size(lowVal) > 1 && !drawDown && close < lastLowVal
      if (lowVal.length > 1 && !drawDown) {
        const lastLowLevel = lowVal[lowVal.length - 1]!;
        const lastLowIdx   = lowValIdx[lowValIdx.length - 1]!;

        if (candle.close < lastLowLevel) {
          const tag: 'BOS' | 'CHOCH' = (lastState === null || lastState === 'up') ? 'CHOCH' : 'BOS';
          structureEvents.push({
            index:                 i,
            time:                  candle.timestamp,
            type:                  tag,
            direction:             'BEARISH',
            brokenLevel:           lastLowLevel,
            isInternal:            false,
            confirmationCandleIndex: i,
          });
          drawDown  = true;
          lastState = 'down';

          // UAlgo OB: find bar with max(high) between lastLowIdx and current bar
          let maxH  = -Infinity;
          let obIdx = lastLowIdx;
          for (let k = lastLowIdx; k < i; k++) {
            if (candles[k]!.high > maxH) { maxH = candles[k]!.high; obIdx = k; }
          }
          const obCandle = candles[obIdx]!;
          const ob = OrderBlockWidthEngine.enrichOrderBlock(
            `OB-PAT-BEAR-${symbol}-${obIdx}-${i}`,
            symbol, timeframe, 'BEARISH',
            Number(obCandle.high.toFixed(4)),
            Number((obCandle.high - atr14).toFixed(4)), // Pine Script: top=high, bottom=high-atr
            obIdx, i,
            false, false, 0,
            'PAT', obCandle.timestamp
          );
          orderBlocks.push(ob);
        }
      }

      // ── BOS / CHoCH UP detection ──
      // Pine Script: if size(highVal) > 1 && !drawUp && close > lastHighVal
      if (highVal.length > 1 && !drawUp) {
        const lastHighLevel = highVal[highVal.length - 1]!;
        const lastHighIdx   = highValIdx[highValIdx.length - 1]!;

        if (candle.close > lastHighLevel) {
          const tag: 'BOS' | 'CHOCH' = (lastState === null || lastState === 'down') ? 'CHOCH' : 'BOS';
          structureEvents.push({
            index:                 i,
            time:                  candle.timestamp,
            type:                  tag,
            direction:             'BULLISH',
            brokenLevel:           lastHighLevel,
            isInternal:            false,
            confirmationCandleIndex: i,
          });
          drawUp    = true;
          lastState = 'up';

          // UAlgo OB: find bar with max(high) between lastHighIdx and current bar
          let maxH  = -Infinity;
          let obIdx = lastHighIdx;
          for (let k = lastHighIdx; k < i; k++) {
            if (candles[k]!.high > maxH) { maxH = candles[k]!.high; obIdx = k; }
          }
          const obCandle = candles[obIdx]!;
          const ob = OrderBlockWidthEngine.enrichOrderBlock(
            `OB-PAT-BULL-${symbol}-${obIdx}-${i}`,
            symbol, timeframe, 'BULLISH',
            Number(obCandle.high.toFixed(4)),
            Number(obCandle.low.toFixed(4)),
            obIdx, i,
            false, false, 0,
            'PAT', obCandle.timestamp
          );
          orderBlocks.push(ob);
        }
      }
    }

    // ── Liquidity Sweeps ──
    // UAlgo: pivots over liquidity_len bars, sweep = wick breaks + close reverses
    const liqSweeps = this.detectLiquiditySweeps(symbol, candles, timeframe, PAT_LIQUIDITY_LEN);
    liquiditySweeps.push(...liqSweeps);

    // Apply mitigation to OBs
    this.applyMitigation(orderBlocks, candles);

    return {
      zigzagLegs,
      structureEvents,
      orderBlocks,
      liquiditySweeps,
      paTrend: paTrend >= 0 ? 'BULLISH' : 'BEARISH',
      atr14,
    };
  }

  // ============================================================
  // Liquidity Sweeps — UAlgo liquidity_len=30 pivot sweep detection
  //
  // Pine Script logic:
  //   pivot high over `liquidity_len` bars → bullish liq level
  //   pivot low  over `liquidity_len` bars → bearish liq level
  //   sweep = price breaks level by wick, then close reverses
  // ============================================================
  private static detectLiquiditySweeps(
    symbol:    string,
    candles:   CandleDto[],
    timeframe: TradingTimeframe,
    liqLen:    number
  ): LiquiditySweepDto[] {
    const sweeps: LiquiditySweepDto[] = [];
    const n = candles.length;

    // Collect pivot highs and lows (confirmed after liqLen bars on each side)
    const pivotHighs: Array<{ idx: number; price: number }> = [];
    const pivotLows:  Array<{ idx: number; price: number }> = [];

    for (let i = liqLen; i < n - liqLen; i++) {
      const ph = candles[i]!.high;
      const pl = candles[i]!.low;

      let isHigh = true;
      let isLow  = true;
      for (let j = i - liqLen; j <= i + liqLen; j++) {
        if (j === i) continue;
        if (candles[j]!.high >= ph) { isHigh = false; }
        if (candles[j]!.low  <= pl) { isLow  = false; }
        if (!isHigh && !isLow) break;
      }
      if (isHigh) pivotHighs.push({ idx: i, price: ph });
      if (isLow)  pivotLows.push({ idx: i, price: pl });
    }

    // Check each subsequent candle for a sweep of each pivot
    for (const ph of pivotHighs) {
      for (let i = ph.idx + 1; i < n; i++) {
        const c         = candles[i]!;
        const candleRange = c.high - c.low;
        if (candleRange <= 0) continue;

        // High sweep: wick breaks above pivot, close reverses below
        if (c.high > ph.price && c.close < ph.price) {
          const upperWick = c.high - Math.max(c.open, c.close);
          sweeps.push({
            id:           `SWEEP-HIGH-PAT-${symbol}-${i}-${ph.idx}`,
            symbol,
            timeframe,
            sweepType:    'HIGH_SWEEP',
            sweptLevel:   ph.price,
            sweepPrice:   c.high,
            candleIndex:  i,
            candleTime:   c.timestamp,
            isSwingSweep: true,
            wickRatio:    Number((upperWick / candleRange).toFixed(2)),
          });
          break; // only record first sweep per pivot
        }
      }
    }

    for (const pl of pivotLows) {
      for (let i = pl.idx + 1; i < n; i++) {
        const c           = candles[i]!;
        const candleRange = c.high - c.low;
        if (candleRange <= 0) continue;

        // Low sweep: wick breaks below pivot, close reverses above
        if (c.low < pl.price && c.close > pl.price) {
          const lowerWick = Math.min(c.open, c.close) - c.low;
          sweeps.push({
            id:           `SWEEP-LOW-PAT-${symbol}-${i}-${pl.idx}`,
            symbol,
            timeframe,
            sweepType:    'LOW_SWEEP',
            sweptLevel:   pl.price,
            sweepPrice:   c.low,
            candleIndex:  i,
            candleTime:   c.timestamp,
            isSwingSweep: true,
            wickRatio:    Number((lowerWick / candleRange).toFixed(2)),
          });
          break;
        }
      }
    }

    return sweeps;
  }

  // ============================================================
  // Apply mitigation check to PAT order blocks
  // ============================================================
  private static applyMitigation(orderBlocks: OrderBlockDto[], candles: CandleDto[]): void {
    for (const ob of orderBlocks) {
      const searchStart = ob.breakCandleIndex + 1;
      let isMitigated      = false;
      let mitigatedAtIndex: number | undefined;

      for (let m = searchStart; m < candles.length; m++) {
        const c = candles[m]!;
        if (ob.type === 'BULLISH' && c.low < ob.lowerPrice) {
          isMitigated      = true;
          mitigatedAtIndex = m;
          break;
        }
        if (ob.type === 'BEARISH' && c.high > ob.upperPrice) {
          isMitigated      = true;
          mitigatedAtIndex = m;
          break;
        }
      }

      (ob as any).isMitigated      = isMitigated;
      (ob as any).mitigatedAtIndex = mitigatedAtIndex;
      if (isMitigated) (ob as any).touchCount = 1;
    }
  }
}
