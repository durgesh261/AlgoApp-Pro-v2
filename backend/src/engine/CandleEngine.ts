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

      if (!map.has(bucketKey)) {
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

      eventBus.emit(`candle:${symbol}:${tf}`, map.get(bucketKey));
    }
  }

  public getLiveCandle(symbol: string, timeframe: string): LiveCandleData | null {
    const key = `${symbol}:${timeframe}`;
    const map = this.candles.get(key);
    if (!map || map.size === 0) return null;

    const sorted = Array.from(map.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
    return sorted[0] ? sorted[0][1] : null;
  }
}

export const candleEngine = new CandleEngine();
