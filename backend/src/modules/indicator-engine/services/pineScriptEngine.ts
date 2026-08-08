import { CandleDto } from '@algoapp/shared';

export interface PineOrderBlock {
  id: string;
  symbol: string;
  type: 'BULLISH' | 'BEARISH';
  upperPrice: number;
  lowerPrice: number;
  barTime: number; // timestamp
  barIndex: number;
  source: 'LUXALGO' | 'UALGO';
  strength: number;
  isMitigated: boolean;
  isBroken: boolean;
}

export interface PineLiquiditySweep {
  value: number;
  barTime: number;
  type: 'HIGH_SWEEP' | 'LOW_SWEEP';
  broken: boolean;
}

export interface PineStructureEvent {
  type: 'BOS' | 'CHOCH';
  direction: 'BULLISH' | 'BEARISH';
  level: number;
  barTime: number;
  barIndex: number;
  internal: boolean;
}

export class PineScriptEngine {
  private static readonly BEARISH = -1;
  private static readonly BULLISH = 1;

  public static detectLuxAlgoOBs(
    candles: CandleDto[],
    symbol: string
  ): { orderBlocks: PineOrderBlock[]; structures: PineStructureEvent[] } {
    const orderBlocks: PineOrderBlock[] = [];
    const structures: PineStructureEvent[] = [];

    if (candles.length < 10) return { orderBlocks, structures };

    const atr = this.computeATR(candles, 200);
    const cumulativeMeanRange = this.computeCumulativeMeanRange(candles);

    const parsedHighs: number[] = [];
    const parsedLows: number[] = [];
    const highs: number[] = [];
    const lows: number[] = [];
    const times: number[] = [];

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i]!;
      const volatilityMeasure = atr[i]! || cumulativeMeanRange[i]! || (c.high - c.low);
      const isHighVol = (c.high - c.low) >= (2 * volatilityMeasure);
      
      parsedHighs.push(isHighVol ? c.low : c.high);
      parsedLows.push(isHighVol ? c.high : c.low);
      highs.push(c.high);
      lows.push(c.low);
      times.push(new Date(c.timestamp).getTime());
    }

    const swingLength = 5;
    const swingHighs: { index: number; value: number; time: number }[] = [];
    const swingLows: { index: number; value: number; time: number }[] = [];

    for (let i = swingLength; i < candles.length - swingLength; i++) {
      const windowHigh = candles.slice(i - swingLength, i + swingLength + 1).map(c => c!.high);
      const windowLow = candles.slice(i - swingLength, i + swingLength + 1).map(c => c!.low);
      const c = candles[i]!;
      
      if (c.high === Math.max(...windowHigh)) {
        swingHighs.push({ index: i, value: c.high, time: times[i]! });
      }
      if (c.low === Math.min(...windowLow)) {
        swingLows.push({ index: i, value: c.low, time: times[i]! });
      }
    }

    let swingTrend = 0;
    let lastSwingHigh = swingHighs[0];
    let lastSwingLow = swingLows[0];

    for (let i = 1; i < Math.max(swingHighs.length, swingLows.length); i++) {
      const sh = swingHighs[i];
      const sl = swingLows[i];

      if (sh && lastSwingHigh && lastSwingLow) {
        if (sh.value > lastSwingHigh.value) {
          const isCHoCH = swingTrend === this.BEARISH;
          structures.push({
            type: isCHoCH ? 'CHOCH' : 'BOS',
            direction: 'BULLISH',
            level: sh.value,
            barTime: sh.time,
            barIndex: sh.index,
            internal: false,
          });

          const ob = this.extractLuxOB(
            candles, parsedHighs, parsedLows, times,
            lastSwingLow.index, sh.index, 'BEARISH'
          );
          if (ob) orderBlocks.push({ ...ob, symbol, source: 'LUXALGO' });

          swingTrend = this.BULLISH;
          lastSwingHigh = sh;
        }
      }

      if (sl && lastSwingHigh && lastSwingLow) {
        if (sl.value < lastSwingLow.value) {
          const isCHoCH = swingTrend === this.BULLISH;
          structures.push({
            type: isCHoCH ? 'CHOCH' : 'BOS',
            direction: 'BEARISH',
            level: sl.value,
            barTime: sl.time,
            barIndex: sl.index,
            internal: false,
          });

          const ob = this.extractLuxOB(
            candles, parsedHighs, parsedLows, times,
            lastSwingHigh.index, sl.index, 'BULLISH'
          );
          if (ob) orderBlocks.push({ ...ob, symbol, source: 'LUXALGO' });

          swingTrend = this.BEARISH;
          lastSwingLow = sl;
        }
      }
    }

    return { orderBlocks, structures };
  }

  public static detectUAlgoOBs(
    candles: CandleDto[],
    symbol: string
  ): { orderBlocks: PineOrderBlock[]; liquiditySweeps: PineLiquiditySweep[] } {
    const orderBlocks: PineOrderBlock[] = [];
    const liquiditySweeps: PineLiquiditySweep[] = [];

    if (candles.length < 20) return { orderBlocks, liquiditySweeps };

    const zigzagLen = 9;
    const atr14 = this.computeATR(candles, 14);
    const paTrend: number[] = [];
    const highs: number[] = candles.map(c => c.high);
    const lows: number[] = candles.map(c => c.low);
    const closes: number[] = candles.map(c => c.close);
    const times: number[] = candles.map(c => new Date(c.timestamp).getTime());

    let trend = 1;
    for (let i = zigzagLen; i < candles.length - zigzagLen; i++) {
      const h = highs[i]!;
      const l = lows[i]!;
      const isHigh = h >= Math.max(...highs.slice(i - zigzagLen, i + zigzagLen + 1).map(x => x!));
      const isLow = l <= Math.min(...lows.slice(i - zigzagLen, i + zigzagLen + 1).map(x => x!));
      
      if (trend === 1 && isLow) {
        trend = -1;
      } else if (trend === -1 && isHigh) {
        trend = 1;
      }
      paTrend.push(trend);
    }

    const highVals: { value: number; index: number; time: number }[] = [];
    const lowVals: { value: number; index: number; time: number }[] = [];

    for (let i = zigzagLen; i < candles.length - zigzagLen; i++) {
      const h = highs[i]!;
      const l = lows[i]!;
      const windowHigh = highs.slice(i - zigzagLen, i + zigzagLen + 1).map(x => x!);
      const windowLow = lows.slice(i - zigzagLen, i + zigzagLen + 1).map(x => x!);
      
      if (h === Math.max(...windowHigh)) {
        highVals.push({ value: h, index: i, time: times[i]! });
      }
      if (l === Math.min(...windowLow)) {
        lowVals.push({ value: l, index: i, time: times[i]! });
      }
    }

    for (let i = 1; i < paTrend.length; i++) {
      const currentTrend = paTrend[i]!;
      const prevTrend = paTrend[i - 1]!;
      if (currentTrend !== prevTrend) {
        const idx = i + zigzagLen;
        if (idx >= candles.length) continue;

        const atr = atr14[idx] || (candles[idx]!.high - candles[idx]!.low);
        
        if (currentTrend === 1) {
          const lastHigh = highVals.filter(h => h.index < idx).pop();
          if (lastHigh) {
            let maxHigh = 0;
            let maxBar = idx;
            for (let j = Math.max(0, idx - zigzagLen * 2); j < idx; j++) {
              const c = candles[j]!;
              if (c.high > maxHigh) {
                maxHigh = c.high;
                maxBar = j;
              }
            }
            
            orderBlocks.push({
              id: `UALGO-BEAR-${symbol}-${times[maxBar]!}`,
              symbol,
              type: 'BEARISH',
              upperPrice: maxHigh,
              lowerPrice: maxHigh - atr,
              barTime: times[maxBar]!,
              barIndex: maxBar,
              source: 'UALGO',
              strength: 75,
              isMitigated: false,
              isBroken: false,
            });
          }
        } else {
          const lastLow = lowVals.filter(l => l.index < idx).pop();
          if (lastLow) {
            let minLow = Infinity;
            let minBar = idx;
            for (let j = Math.max(0, idx - zigzagLen * 2); j < idx; j++) {
              const c = candles[j]!;
              if (c.low < minLow) {
                minLow = c.low;
                minBar = j;
              }
            }

            orderBlocks.push({
              id: `UALGO-BULL-${symbol}-${times[minBar]!}`,
              symbol,
              type: 'BULLISH',
              upperPrice: minLow + atr,
              lowerPrice: minLow,
              barTime: times[minBar]!,
              barIndex: minBar,
              source: 'UALGO',
              strength: 75,
              isMitigated: false,
              isBroken: false,
            });
          }
        }
      }
    }

    const liquidityLen = 30;
    for (let i = liquidityLen; i < candles.length - liquidityLen; i++) {
      const h = highs[i]!;
      const l = lows[i]!;
      const c = closes[i]!;
      const windowHigh = highs.slice(i - liquidityLen, i + liquidityLen + 1).map(x => x!);
      const windowLow = lows.slice(i - liquidityLen, i + liquidityLen + 1).map(x => x!);
      
      if (h === Math.max(...windowHigh)) {
        const nextH = i < candles.length - 1 ? candles[i+1]!.high : 0;
        liquiditySweeps.push({
          value: h,
          barTime: times[i]!,
          type: 'HIGH_SWEEP',
          broken: c > h || nextH > h,
        });
      }
      if (l === Math.min(...windowLow)) {
        const nextL = i < candles.length - 1 ? candles[i+1]!.low : Infinity;
        liquiditySweeps.push({
          value: l,
          barTime: times[i]!,
          type: 'LOW_SWEEP',
          broken: c < l || nextL < l,
        });
      }
    }

    return { orderBlocks, liquiditySweeps };
  }

  public static computeFullIndicator(candles: CandleDto[], symbol: string) {
    const lux = this.detectLuxAlgoOBs(candles, symbol);
    const ualgo = this.detectUAlgoOBs(candles, symbol);

    const allOBs = [...lux.orderBlocks, ...ualgo.orderBlocks];
    const uniqueOBs = this.deduplicateOBs(allOBs);

    return {
      orderBlocks: uniqueOBs,
      structures: lux.structures,
      liquiditySweeps: ualgo.liquiditySweeps,
      marketStructure: this.detectMarketStructure(lux.structures),
    };
  }

  private static extractLuxOB(
    candles: CandleDto[],
    parsedHighs: number[],
    parsedLows: number[],
    times: number[],
    startIdx: number,
    endIdx: number,
    bias: 'BULLISH' | 'BEARISH'
  ): PineOrderBlock | null {
    if (startIdx < 0 || endIdx >= candles.length || startIdx >= endIdx) return null;

    const sliceHighs = parsedHighs.slice(startIdx, endIdx).map(x => x!);
    const sliceLows = parsedLows.slice(startIdx, endIdx).map(x => x!);
    
    let barIndex: number;
    let barHigh: number;
    let barLow: number;

    if (bias === 'BEARISH') {
      barHigh = Math.max(...sliceHighs);
      const localIdx = sliceHighs.indexOf(barHigh);
      barIndex = startIdx + localIdx;
      barLow = candles[barIndex]!.low;
    } else {
      barLow = Math.min(...sliceLows);
      const localIdx = sliceLows.indexOf(barLow);
      barIndex = startIdx + localIdx;
      barHigh = candles[barIndex]!.high;
    }

    return {
      id: `LUX-${bias}-${times[barIndex]!}`,
      symbol: '',
      type: bias,
      upperPrice: barHigh,
      lowerPrice: barLow,
      barTime: times[barIndex]!,
      barIndex,
      source: 'LUXALGO',
      strength: 70,
      isMitigated: false,
      isBroken: false,
    };
  }

  private static deduplicateOBs(obs: PineOrderBlock[]): PineOrderBlock[] {
    const result: PineOrderBlock[] = [];
    const consumed = new Set<number>();

    for (let i = 0; i < obs.length; i++) {
      if (consumed.has(i)) continue;
      let ob = obs[i]!;

      for (let j = i + 1; j < obs.length; j++) {
        if (consumed.has(j)) continue;
        let obj = obs[j]!;
        if (obj.type !== ob.type) continue;

        const overlap = this.calculateOverlap(
          ob.lowerPrice, ob.upperPrice,
          obj.lowerPrice, obj.upperPrice
        );

        if (overlap > 0.60) {
          ob.upperPrice = Math.max(ob.upperPrice, obj.upperPrice);
          ob.lowerPrice = Math.min(ob.lowerPrice, obj.lowerPrice);
          ob.strength = Math.round((ob.strength + obj.strength) / 2 + 5);
          ob.source = 'LUXALGO';
          consumed.add(j);
        }
      }

      result.push(ob);
    }

    return result;
  }

  private static calculateOverlap(l1: number, u1: number, l2: number, u2: number): number {
    const overlapLower = Math.max(l1, l2);
    const overlapUpper = Math.min(u1, u2);
    if (overlapUpper <= overlapLower) return 0;
    const overlapSize = overlapUpper - overlapLower;
    const minSize = Math.min(u1 - l1, u2 - l2);
    return minSize > 0 ? overlapSize / minSize : 0;
  }

  private static computeATR(candles: CandleDto[], period: number): number[] {
    const atr: number[] = [];
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i]!;
      if (i === 0) {
        atr.push(c.high - c.low);
        continue;
      }
      const prevC = candles[i - 1]!;
      const tr = Math.max(
        c.high - c.low,
        Math.abs(c.high - prevC.close),
        Math.abs(c.low - prevC.close)
      );
      const lastAtr = atr[atr.length - 1]!;
      if (i < period) {
        atr.push((lastAtr * i + tr) / (i + 1));
      } else {
        atr.push((lastAtr * (period - 1) + tr) / period);
      }
    }
    return atr;
  }

  private static computeCumulativeMeanRange(candles: CandleDto[]): number[] {
    const result: number[] = [];
    let cumSum = 0;
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i]!;
      cumSum += c.high - c.low;
      result.push(cumSum / (i + 1));
    }
    return result;
  }

  private static detectMarketStructure(structures: PineStructureEvent[]) {
    const recent = structures.slice(-5);
    const bullishCount = recent.filter(s => s.direction === 'BULLISH').length;
    const bearishCount = recent.filter(s => s.direction === 'BEARISH').length;
    
    return {
      trend: bullishCount > bearishCount ? 'BULLISH' : bearishCount > bullishCount ? 'BEARISH' : 'NEUTRAL',
      lastBOS: recent.filter(s => s.type === 'BOS').pop() || null,
      lastCHoCH: recent.filter(s => s.type === 'CHOCH').pop() || null,
    };
  }
}
