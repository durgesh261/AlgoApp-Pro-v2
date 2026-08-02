import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { replayControlSchema, runBacktestSchema } from '@algoapp/shared';
import { ReplayEngineService } from './services/replayEngine.service.js';
import { BacktestingEngineService } from './services/backtestingEngine.service.js';

export const getReplaySession = async (req: Request, res: Response): Promise<void> => {
  const symbol = (req.query['symbol'] as string) || 'BTCUSD.P';
  const session = await ReplayEngineService.getActiveSession(symbol);

  const response: ApiResponse<typeof session> = {
    success: true,
    data: session,
    meta: {
      requestId: (req as any).correlationId || 'req-replay-session',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const controlReplay = async (req: Request, res: Response): Promise<void> => {
  const validated = replayControlSchema.parse(req.body);
  const payload: { speedMultiplier?: number; targetIndex?: number } = {};
  if (validated.speedMultiplier !== undefined) payload.speedMultiplier = validated.speedMultiplier;
  if (validated.targetIndex !== undefined) payload.targetIndex = validated.targetIndex;

  const session = await ReplayEngineService.controlReplay(validated.action, payload);

  const response: ApiResponse<typeof session> = {
    success: true,
    data: session,
    meta: {
      requestId: (req as any).correlationId || 'req-control-replay',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getReplayEvents = async (req: Request, res: Response): Promise<void> => {
  const events = ReplayEngineService.getReplayEvents();

  const response: ApiResponse<typeof events> = {
    success: true,
    data: events,
    meta: {
      requestId: (req as any).correlationId || 'req-replay-events',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getBacktestSessions = async (req: Request, res: Response): Promise<void> => {
  const sessions = await BacktestingEngineService.getBacktestSessions();

  const response: ApiResponse<typeof sessions> = {
    success: true,
    data: sessions,
    meta: {
      requestId: (req as any).correlationId || 'req-backtest-sessions',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const runBacktest = async (req: Request, res: Response): Promise<void> => {
  const validated = runBacktestSchema.parse(req.body);
  const payload: { symbol: string; timeframe?: '1H'; startDate?: string; endDate?: string; initialBalance?: number } = {
    symbol: validated.symbol,
  };
  if (validated.timeframe) payload.timeframe = validated.timeframe;
  if (validated.startDate) payload.startDate = validated.startDate;
  if (validated.endDate) payload.endDate = validated.endDate;
  if (validated.initialBalance !== undefined) payload.initialBalance = validated.initialBalance;

  const session = await BacktestingEngineService.runBacktest(payload);

  const response: ApiResponse<typeof session> = {
    success: true,
    data: session,
    meta: {
      requestId: (req as any).correlationId || 'req-run-backtest',
      timestamp: new Date().toISOString(),
    },
  };
  res.status(201).json(response);
};
