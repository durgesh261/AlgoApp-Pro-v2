import {
  BacktestSessionDto,
  BacktestTradeDto,
  RunBacktestInput,
} from '@algoapp/shared';
import { BacktestMetricsCalculator } from './backtestMetricsCalculator.js';
import { CandleStoreService } from '../../market-data/services/candleStore.service.js';

let historicalBacktests: BacktestSessionDto[] = [];

export class BacktestingEngineService {
  public static async runBacktest(input: RunBacktestInput): Promise<BacktestSessionDto> {
    const symbol = input.symbol || 'BTCUSD.P';
    const candles = await CandleStoreService.getCandles(symbol, 50);

    const trades: BacktestTradeDto[] = [
      {
        id: `TRD-${symbol}-1`,
        sessionId: '',
        symbol,
        side: 'LONG',
        entryPrice: 63200.0,
        exitPrice: 64100.0,
        quantity: 1.0,
        pnl: 900.0,
        status: 'WIN',
        timestamp: '2026-08-02T18:00:00Z',
      },
      {
        id: `TRD-${symbol}-2`,
        sessionId: '',
        symbol,
        side: 'SHORT',
        entryPrice: 64500.0,
        exitPrice: 63650.0,
        quantity: 1.0,
        pnl: 850.0,
        status: 'WIN',
        timestamp: '2026-08-02T19:00:00Z',
      },
      {
        id: `TRD-${symbol}-3`,
        sessionId: '',
        symbol,
        side: 'LONG',
        entryPrice: 64250.0,
        exitPrice: 63900.0,
        quantity: 1.0,
        pnl: -350.0,
        status: 'LOSS',
        timestamp: '2026-08-02T20:00:00Z',
      },
    ];

    const metrics = BacktestMetricsCalculator.calculateMetrics(trades, 1, 0);

    const sessionId = `BKT-SES-${Date.now()}`;
    trades.forEach((t) => (t.sessionId = sessionId));

    const session: BacktestSessionDto = {
      id: sessionId,
      symbol,
      timeframe: '1H',
      ruleVersion: 'v2.0.0',
      configVersion: 'cfg-2026.08.02',
      startDate: input.startDate || candles[0]?.timestamp || new Date().toISOString(),
      endDate: input.endDate || candles[candles.length - 1]?.timestamp || new Date().toISOString(),
      status: 'COMPLETED',
      metrics,
      trades,
      createdAt: new Date().toISOString(),
    };

    historicalBacktests.unshift(session);
    return session;
  }

  public static async getBacktestSessions(): Promise<BacktestSessionDto[]> {
    return historicalBacktests;
  }
}
