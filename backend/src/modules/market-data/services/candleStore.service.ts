import { CandleDto, IngestCandleInput, MarketEventType } from '@algoapp/shared';
import { MarketDataValidator } from './marketDataValidator.js';
import { MarketEventGenerator } from './marketEventGenerator.js';

let historicalCandlesStore: CandleDto[] = [
  {
    id: 'CNDL-BTC-1',
    symbol: 'BTCUSD.P',
    timeframe: '1H',
    open: 63200.0,
    high: 64100.0,
    low: 63100.0,
    close: 63850.0,
    volume: 1850.5,
    timestamp: '2026-08-02T18:00:00Z',
  },
  {
    id: 'CNDL-BTC-2',
    symbol: 'BTCUSD.P',
    timeframe: '1H',
    open: 63850.0,
    high: 64500.0,
    low: 63650.0,
    close: 64250.0,
    volume: 2140.2,
    timestamp: '2026-08-02T19:00:00Z',
  },
  {
    id: 'CNDL-ETH-1',
    symbol: 'ETHUSD.P',
    timeframe: '1H',
    open: 3410.0,
    high: 3490.0,
    low: 3400.0,
    close: 3480.25,
    volume: 8420.0,
    timestamp: '2026-08-02T19:00:00Z',
  },
  {
    id: 'CNDL-SOL-1',
    symbol: 'SOLUSD.P',
    timeframe: '1H',
    open: 138.5,
    high: 144.2,
    low: 137.8,
    close: 142.1,
    volume: 48200.0,
    timestamp: '2026-08-02T19:00:00Z',
  },
  {
    id: 'CNDL-XRP-1',
    symbol: 'XRPUSD.P',
    timeframe: '1H',
    open: 0.565,
    high: 0.589,
    low: 0.562,
    close: 0.584,
    volume: 425000.0,
    timestamp: '2026-08-02T19:00:00Z',
  },
];

export class CandleStoreService {
  public static async getCandles(
    symbol: string,
    timeframeOrLimit: string | number = '1H',
    limitNum: number = 50
  ): Promise<CandleDto[]> {
    let timeframe: '15M' | '1H' = '1H';
    let limit = limitNum;

    if (typeof timeframeOrLimit === 'number') {
      limit = timeframeOrLimit;
      timeframe = '1H';
    } else if (timeframeOrLimit === '15M' || timeframeOrLimit === '1H') {
      timeframe = timeframeOrLimit;
    }

    const filtered = historicalCandlesStore.filter((c) => c.symbol === symbol && c.timeframe === timeframe);
    if (filtered.length === 0) {
      return historicalCandlesStore
        .filter((c) => c.symbol === symbol)
        .map((c) => ({ ...c, timeframe }))
        .slice(-limit);
    }
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
