import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { evaluateStrategySignalSchema, getZonesQuerySchema } from '@algoapp/shared';
import { ZoneDetectorService } from './services/zoneDetector.service.js';
import { StrategySignalService } from './services/strategySignal.service.js';
import { StrategyPipelineService } from './services/strategyPipeline.service.js';

export const getStrategyZones = async (req: Request, res: Response): Promise<void> => {
  const query = getZonesQuerySchema.parse(req.query);
  const zones = await ZoneDetectorService.getZones(query.symbol);

  const response: ApiResponse<typeof zones> = {
    success: true,
    data: zones,
    meta: {
      requestId: (req as any).correlationId || 'req-strategy-zones',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getStrategySignals = async (req: Request, res: Response): Promise<void> => {
  const signals = await StrategySignalService.getLatestSignals();

  const response: ApiResponse<typeof signals> = {
    success: true,
    data: signals,
    meta: {
      requestId: (req as any).correlationId || 'req-strategy-signals',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const evaluateStrategySignal = async (req: Request, res: Response): Promise<void> => {
  const validated = evaluateStrategySignalSchema.parse(req.body);
  const signal = await StrategySignalService.evaluateSignal(validated.symbol, validated.currentPrice);

  const response: ApiResponse<typeof signal> = {
    success: true,
    data: signal,
    meta: {
      requestId: (req as any).correlationId || 'req-eval-strategy-signal',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const runStrategyPipelineHandler = async (req: Request, res: Response): Promise<void> => {
  const { symbol, timeframe, candles, autoExecute } = req.body;
  const result = await StrategyPipelineService.runPipeline({
    symbol: symbol || 'BTCUSD.P',
    timeframe: timeframe || '1H',
    candles: candles || [],
    autoExecute: autoExecute !== false,
  });

  const response: ApiResponse<typeof result> = {
    success: true,
    data: result,
    meta: {
      requestId: (req as any).correlationId || 'req-strategy-pipeline',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};
