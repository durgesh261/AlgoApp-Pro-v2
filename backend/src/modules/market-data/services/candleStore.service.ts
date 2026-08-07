import { CandleDto, IngestCandleInput, MarketEventType } from '@algoapp/shared';
import { MarketDataValidator } from './marketDataValidator.js';
import { MarketEventGenerator } from './marketEventGenerator.js';

import { candleEngine } from '../../../engine/CandleEngine.js';

let historicalCandlesStore: CandleDto[] = [];

export class CandleStoreService {
  public static async getCandles(
    symbol: string,
    timeframeOrLimit: string | number = '1H',
    limitNum: number = 1000
  ): Promise<CandleDto[]> {
    let timeframe: '15M' | '1H' = '1H';
    let limit = limitNum;

    if (typeof timeframeOrLimit === 'number') {
      limit = timeframeOrLimit;
      timeframe = '1H';
    } else if (timeframeOrLimit === '15M' || timeframeOrLimit === '1H') {
      timeframe = timeframeOrLimit;
    }

    // Check if candleEngine already has live aggregated 1H candles
    if (timeframe === '1H') {
      const live1HCandles = candleEngine.get1HCandles(symbol);
      if (live1HCandles.length >= 10) {
        return live1HCandles.slice(-limit);
      }
    }

    const symbolMap: Record<string, string> = {
      'BTCUSD.P': 'BTCUSD',
      'ETHUSD.P': 'ETHUSD',
      'SOLUSD.P': 'SOLUSD',
      'XRPUSD.P': 'XRPUSD',
    };
    const deltaSymbol = symbolMap[symbol] || symbol.replace('.P', '');
    const resolution = timeframe === '15M' ? '15' : '60';
    const stepSec = timeframe === '15M' ? 900 : 3600;
    const to = Math.floor(Date.now() / 1000);
    const from = to - limit * stepSec;

    try {
      const url = `https://api.india.delta.exchange/v2/chart/history?resolution=${resolution}&symbol=${deltaSymbol}&from=${from}&to=${to}`;
      const res = await fetch(url).catch(() => fetch(`https://api.delta.exchange/v2/chart/history?resolution=${resolution}&symbol=${deltaSymbol}&from=${from}&to=${to}`));
      const data: any = await res.json();

      if (data && data.success && data.result && Array.isArray(data.result.c)) {
        const c = data.result.c;
        const o = data.result.o;
        const h = data.result.h;
        const l = data.result.l;
        const v = data.result.v;
        const t = data.result.t;

        const candles: CandleDto[] = [];
        for (let i = 0; i < c.length; i++) {
          candles.push({
            id: `CNDL-${symbol}-${t[i]}`,
            symbol,
            timeframe,
            open: o[i],
            high: h[i],
            low: l[i],
            close: c[i],
            volume: v[i],
            timestamp: new Date(t[i] * 1000).toISOString(),
          });
        }
        if (candles.length > 0) {
          if (timeframe === '1H') {
            candleEngine.setInitial1HCandles(symbol, candles);
          }
          return candles.slice(-limit);
        }
      }
    } catch {
      // Fallback to memory store if offline
    }

    const filtered = historicalCandlesStore.filter((c) => c.symbol === symbol && c.timeframe === timeframe);
    return filtered.slice(-limit);
  }

  public static async ingestCandle(input: IngestCandleInput): Promise<CandleDto> {
    const validation = MarketDataValidator.validateCandle(input);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid candle data.');
    }

    // Duplicate timestamp check
    const existing = historicalCandlesStore.find(
      (c) => c.symbol === input.symbol && c.timestamp === input.timestamp
    );
    if (existing) {
      throw new Error(`DUPLICATE_CANDLE: Candle at timestamp ${input.timestamp} already exists.`);
    }

    const candle: CandleDto = {
      id: `CNDL-${Date.now()}`,
      symbol: input.symbol,
      timeframe: '1H',
      open: input.open,
      high: input.high,
      low: input.low,
      close: input.close,
      volume: input.volume,
      timestamp: input.timestamp,
    };

    historicalCandlesStore.push(candle);

    await MarketEventGenerator.emitEvent(input.symbol, MarketEventType.NEW_CANDLE, candle);

    return candle;
  }
}
