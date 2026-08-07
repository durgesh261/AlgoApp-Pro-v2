import { CandleDto, IngestCandleInput, MarketEventType } from '@algoapp/shared';
import { prisma } from '../../../db.js';
import { MarketDataValidator } from './marketDataValidator.js';
import { MarketEventGenerator } from './marketEventGenerator.js';
import { candleEngine } from '../../../engine/CandleEngine.js';

export class CandleStoreService {
  /**
   * Get candles from DB first, fall back to Delta API, then memory.
   * Candles are now PERSISTED to SQLite (Strategy §24).
   */
  public static async getCandles(
    symbol: string,
    timeframeOrLimit: string | number = '1H',
    limitNum: number = 500
  ): Promise<CandleDto[]> {
    let timeframe: '15M' | '1H' = '1H';
    let limit = limitNum;

    if (typeof timeframeOrLimit === 'number') {
      limit = timeframeOrLimit;
      timeframe = '1H';
    } else if (timeframeOrLimit === '15M' || timeframeOrLimit === '1H') {
      timeframe = timeframeOrLimit;
    }

    // 1. Try live candle engine first (most recent)
    if (timeframe === '1H') {
      const live1HCandles = candleEngine.get1HCandles(symbol);
      if (live1HCandles.length >= 10) {
        return live1HCandles.slice(-limit);
      }
    }

    // 2. Try database (persisted across restarts)
    try {
      const dbCandles = await prisma.marketCandle.findMany({
        where: { symbol, timeframe },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      if (dbCandles.length >= 10) {
        const candles: CandleDto[] = dbCandles.reverse().map((c) => ({
          id: c.id,
          symbol: c.symbol,
          timeframe: c.timeframe as '1H' | '15M',
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume,
          timestamp: c.timestamp.toISOString(),
        }));
        
        // Seed the candle engine with DB data
        if (timeframe === '1H') {
          candleEngine.setInitial1HCandles(symbol, candles);
        }
        return candles;
      }
    } catch (err) {
      console.warn('[CandleStore] DB read error:', err);
    }

    // 3. Fetch from Delta Exchange API
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
      const res = await fetch(url).catch(() => 
        fetch(`https://api.delta.exchange/v2/chart/history?resolution=${resolution}&symbol=${deltaSymbol}&from=${from}&to=${to}`)
      );
      const data: any = await res.json();

      if (data?.success && data.result && Array.isArray(data.result.c)) {
        const candles: CandleDto[] = [];
        for (let i = 0; i < data.result.c.length; i++) {
          candles.push({
            id: `CNDL-${symbol}-${data.result.t[i]}`,
            symbol,
            timeframe,
            open: data.result.o[i],
            high: data.result.h[i],
            low: data.result.l[i],
            close: data.result.c[i],
            volume: data.result.v[i],
            timestamp: new Date(data.result.t[i] * 1000).toISOString(),
          });
        }

        if (candles.length > 0) {
          // Persist to DB
          await this.persistCandles(candles);
          
          if (timeframe === '1H') {
            candleEngine.setInitial1HCandles(symbol, candles);
          }
          return candles.slice(-limit);
        }
      }
    } catch (err) {
      console.warn('[CandleStore] API fetch error:', err);
    }

    return [];
  }

  /**
   * Ingest a single candle and persist to DB.
   */
  public static async ingestCandle(input: IngestCandleInput): Promise<CandleDto> {
    const validation = MarketDataValidator.validateCandle(input);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid candle data.');
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

    // Persist to DB
    await this.persistCandles([candle]);

    await MarketEventGenerator.emitEvent(input.symbol, MarketEventType.NEW_CANDLE, candle);

    return candle;
  }

  /**
   * Persist candles to SQLite database.
   */
  private static async persistCandles(candles: CandleDto[]): Promise<void> {
    if (candles.length === 0) return;

    try {
      const operations = candles.map((c) => 
        prisma.marketCandle.upsert({
          where: {
            symbol_timeframe_timestamp: {
              symbol: c.symbol,
              timeframe: c.timeframe,
              timestamp: new Date(c.timestamp),
            },
          },
          update: {
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume,
          },
          create: {
            id: c.id,
            symbol: c.symbol,
            timeframe: c.timeframe,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume,
            timestamp: new Date(c.timestamp),
          },
        })
      );

      await prisma.$transaction(operations);
    } catch (err) {
      console.warn('[CandleStore] DB persist error:', err);
    }
  }
}
