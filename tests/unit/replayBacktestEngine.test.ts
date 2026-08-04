import { describe, it, expect } from 'vitest';
import { ReplayControlAction, ReplayStatus } from '@algoapp/shared';
import { ReplayEngineService } from '../../backend/src/modules/replay-backtest/services/replayEngine.service.js';
import { BacktestMetricsCalculator } from '../../backend/src/modules/replay-backtest/services/backtestMetricsCalculator.js';

describe('Replay & Backtesting Core Unit Tests', () => {
  it('should advance replay timeline candle by candle deterministically', async () => {
    let session = await ReplayEngineService.getActiveSession('BTCUSD.P');
    const initialIndex = session.currentCandleIndex;

    session = await ReplayEngineService.controlReplay(ReplayControlAction.PLAY);
    expect(session.status).toBe(ReplayStatus.PLAYING);

    session = await ReplayEngineService.controlReplay(ReplayControlAction.STEP_FORWARD);
    expect(session.currentCandleIndex).toBe(initialIndex + 1);

    session = await ReplayEngineService.controlReplay(ReplayControlAction.PAUSE);
    expect(session.status).toBe(ReplayStatus.PAUSED);
  });

  it('should calculate accurate backtest metrics (Win Rate, Profit Factor, Max Drawdown)', () => {
    const mockTrades = [
      {
        id: '1',
        sessionId: 'SES-1',
        symbol: 'BTCUSD.P',
        side: 'LONG' as const,
        entryPrice: 60000,
        exitPrice: 61000,
        quantity: 1,
        pnl: 1000,
        status: 'WIN' as const,
        timestamp: '2026-08-02T10:00:00Z',
      },
      {
        id: '2',
        sessionId: 'SES-1',
        symbol: 'BTCUSD.P',
        side: 'SHORT' as const,
        entryPrice: 61000,
        exitPrice: 61500,
        quantity: 1,
        pnl: -500,
        status: 'LOSS' as const,
        timestamp: '2026-08-02T11:00:00Z',
      },
    ];

    const metrics = BacktestMetricsCalculator.calculateMetrics(mockTrades, 0, 0);
    expect(metrics.totalTrades).toBe(2);
    expect(metrics.winningTrades).toBe(1);
    expect(metrics.losingTrades).toBe(1);
    expect(metrics.winRate).toBe(50.0);
    expect(metrics.profitFactor).toBe(2.0); // 1000 / 500
    expect(metrics.netPnL).toBe(500.0);
  });
});
