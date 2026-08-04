import { Request, Response } from 'express';
import { ApiResponse, ExecutionMode } from '@algoapp/shared';
import { SystemIntegrationCoordinator } from './services/systemIntegrationCoordinator.js';
import { PipelineTraceService } from './services/pipelineTraceService.js';
import { SystemHealthAggregator } from './services/systemHealthAggregator.js';

export const runPipeline = async (req: Request, res: Response): Promise<void> => {
  const { symbol, timeframe, mode, price, quantity } = req.body;
  const trace = await SystemIntegrationCoordinator.processCandlePipeline({
    symbol: symbol || 'BTCUSD.P',
    timeframe: timeframe || '1H',
    mode: mode || ExecutionMode.SHADOW,
    price,
    quantity,
  });

  const response: ApiResponse<typeof trace> = {
    success: true,
    data: trace,
    meta: {
      requestId: (req as any).correlationId || 'req-run-pipeline',
      timestamp: new Date().toISOString(),
    },
  };
  res.status(201).json(response);
};

export const getTraces = async (req: Request, res: Response): Promise<void> => {
  const traces = await PipelineTraceService.getTraces(50);

  const response: ApiResponse<typeof traces> = {
    success: true,
    data: traces,
    meta: {
      requestId: (req as any).correlationId || 'req-get-traces',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getTraceById = async (req: Request, res: Response): Promise<void> => {
  const trace = await PipelineTraceService.getTraceById(req.params.id as string);
  if (!trace) {
    res.status(404).json({
      success: false,
      error: 'Trace not found',
      meta: { requestId: (req as any).correlationId || 'req-get-trace-by-id', timestamp: new Date().toISOString() },
    });
    return;
  }

  const response: ApiResponse<typeof trace> = {
    success: true,
    data: trace,
    meta: {
      requestId: (req as any).correlationId || 'req-get-trace-by-id',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getHealthOverview = async (req: Request, res: Response): Promise<void> => {
  const mode = (req.query.mode as ExecutionMode) || ExecutionMode.SHADOW;
  const overview = await SystemHealthAggregator.getSystemOverview(mode);

  const response: ApiResponse<typeof overview> = {
    success: true,
    data: overview,
    meta: {
      requestId: (req as any).correlationId || 'req-get-health-overview',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};
