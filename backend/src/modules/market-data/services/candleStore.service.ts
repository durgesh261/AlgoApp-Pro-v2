import { CandleDto, IngestCandleInput } from '@algoapp/shared';
import { MarketDataValidator } from './marketDataValidator.js';
import { MarketEventGenerator } from './marketEventGenerator.js';
import { MarketEventType } from '@algoapp/shared';

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
    open: 139.5,
    high: 143.2,
    low: 138.8,
    close: 142.1,
    volume: 15420.0,
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
  public static async getCandles(symbol: string, limit: number = 50): Promise<CandleDto[]> {
    return historicalCandlesStore
      .filter((c) => c.symbol === symbol)
      .slice(-limit);
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
