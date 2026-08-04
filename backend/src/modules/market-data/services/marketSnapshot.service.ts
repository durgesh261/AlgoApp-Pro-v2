import { MarketSnapshotDto } from '@algoapp/shared';

let snapshotCache: Record<string, MarketSnapshotDto> = {
  'BTCUSD.P': {
    id: 'SNAP-BTC',
    symbol: 'BTCUSD.P',
    currentPrice: 64250.0,
    spread: 0.5,
    session: 'NEW_YORK',
    trend: 'BULLISH',
    volatility: 'MEDIUM',
    timestamp: new Date().toISOString(),
  },
  'ETHUSD.P': {
    id: 'SNAP-ETH',
    symbol: 'ETHUSD.P',
    currentPrice: 3480.25,
    spread: 0.25,
    session: 'NEW_YORK',
    trend: 'BULLISH',
    volatility: 'MEDIUM',
    timestamp: new Date().toISOString(),
  },
  'SOLUSD.P': {
    id: 'SNAP-SOL',
    symbol: 'SOLUSD.P',
    currentPrice: 142.1,
    spread: 0.05,
    session: 'NEW_YORK',
    trend: 'BEARISH',
    volatility: 'HIGH',
    timestamp: new Date().toISOString(),
  },
  'XRPUSD.P': {
    id: 'SNAP-XRP',
    symbol: 'XRPUSD.P',
    currentPrice: 0.584,
    spread: 0.0001,
    session: 'NEW_YORK',
    trend: 'BULLISH',
    volatility: 'MEDIUM',
    timestamp: new Date().toISOString(),
  },
};

export class MarketSnapshotService {
  public static async getSnapshot(symbol: string): Promise<MarketSnapshotDto> {
    return snapshotCache[symbol] || {
      id: `SNAP-${symbol}`,
      symbol,
      currentPrice: 64000.0,
      spread: 0.5,
      session: 'NEW_YORK',
      trend: 'NEUTRAL',
      volatility: 'MEDIUM',
      timestamp: new Date().toISOString(),
    };
  }

  public static async updateSnapshot(symbol: string, currentPrice: number, spread?: number): Promise<MarketSnapshotDto> {
    const existing = await this.getSnapshot(symbol);
    const updated: MarketSnapshotDto = {
      ...existing,
      currentPrice,
      spread: spread ?? existing.spread,
      timestamp: new Date().toISOString(),
    };
    snapshotCache[symbol] = updated;
    return updated;
  }
}
