import { CandleDto } from '@algoapp/shared';
import { eventBus } from '../services/EventBus.js';

export interface LiveCandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
}

const TIMEFRAME_MS: Record<string, number> = {
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
  '1H': 3_600_000,
  '4H': 14_400_000,
};

export class CandleEngine {
  private candles = new Map<string, Map<string, LiveCandleData>>();
  private historical1HCandles = new Map<string, CandleDto[]>();

  public ingestTick(symbol: string, price: number, volume: number, ts: Date): void {
    if (isNaN(price) || price <= 0) return;

    for (const [tf, ms] of Object.entries(TIMEFRAME_MS)) {
      const bucket = Math.floor(ts.getTime() / ms) * ms;
      const key = `${symbol}:${tf}`;

      if (!this.candles.has(key)) {
        this.candles.set(key, new Map());
      }
      const map = this.candles.get(key)!;
      const bucketKey = String(bucket);

      let isNew = false;
      if (!map.has(bucketKey)) {
        isNew = true;
        map.set(bucketKey, {
          open: price,
          high: price,
          low: price,
          close: price,
          volume: isNaN(volume) ? 0 : volume,
          timestamp: new Date(bucket),
        });
      } else {
        const c = map.get(bucketKey)!;
        if (price > c.high) c.high = price;
        if (price < c.low) c.low = price;
        c.close = price;
        if (!isNaN(volume)) c.volume += volume;
      }

      const liveCandle = map.get(bucketKey)!;
      eventBus.emit(`candle:${symbol}:${tf}`, liveCandle);

      // Maintain ordered 1H history
      if (tf === '1H') {
        this.update1HHistory(symbol, liveCandle, isNew);
      }
    }

    eventBus.emit('market:tick', { symbol, price, volume, timestamp: ts });
  }

  private update1HHistory(symbol: string, live: LiveCandleData, isNew: boolean): void {
    if (!this.historical1HCandles.has(symbol)) {
      this.historical1HCandles.set(symbol, []);
    }
    const list = this.historical1HCandles.get(symbol)!;
    const candleDto: CandleDto = {
      id: `CNDL-${symbol}-${live.timestamp.getTime()}`,
      symbol,
      timeframe: '1H',
      open: live.open,
      high: live.high,
      low: live.low,
      close: live.close,
      volume: live.volume,
      timestamp: live.timestamp.toISOString(),
    };

    if (list.length === 0) {
      list.push(candleDto);
    } else {
      const last = list[list.length - 1]!;
      if (new Date(last.timestamp).getTime() === live.timestamp.getTime()) {
        list[list.length - 1] = candleDto;
      } else {
        list.push(candleDto);
        if (list.length > 500) list.shift();
      }
    }

    eventBus.emit(`candle:1H:update`, { symbol, candle: candleDto, isNew });
  }

  public setInitial1HCandles(symbol: string, candles: CandleDto[]): void {
    this.historical1HCandles.set(symbol, candles);
    if (candles.length > 0) {
      const latest = candles[candles.length - 1]!;
      const key = `${symbol}:1H`;
      if (!this.candles.has(key)) {
        this.candles.set(key, new Map());
      }
      const map = this.candles.get(key)!;
      const ts = new Date(latest.timestamp);
      map.set(String(ts.getTime()), {
        open: latest.open,
        high: latest.high,
        low: latest.low,
        close: latest.close,
        volume: latest.volume,
        timestamp: ts,
      });
    }
  }

  public get1HCandles(symbol: string): CandleDto[] {
    return this.historical1HCandles.get(symbol) || [];
  }

  public getLiveCandle(symbol: string, timeframe: string = '1H'): LiveCandleData | null {
    const key = `${symbol}:${timeframe}`;
    const map = this.candles.get(key);
    if (!map || map.size === 0) return null;

    const sorted = Array.from(map.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
    return sorted[0] ? sorted[0][1] : null;
  }
}

export const candleEngine = new CandleEngine();

