import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { StrategyOptimizationEngineService } from './services/strategyOptimizationEngine.service.js';
import { OptimizationReportExporterService } from './services/optimizationReportExporter.service.js';

const optService = new StrategyOptimizationEngineService();

export const runOptimization = async (req: Request, res: Response): Promise<void> => {
  const results = await optService.runParameterSweep(req.body);

  const response: ApiResponse<typeof results> = {
    success: true,
    data: results,
    meta: {
      requestId: (req as any).correlationId || 'req-run-optimization',
      timestamp: new Date().toISOString(),
    },
  };

  res.status(201).json(response);
};

export const getOptimizationHistory = async (req: Request, res: Response): Promise<void> => {
  const history = await optService.getOptimizationHistory();

  const response: ApiResponse<typeof history> = {
    success: true,
    data: history,
    meta: {
      requestId: (req as any).correlationId || 'req-optimization-history',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const exportOptimizationCsv = async (_req: Request, res: Response): Promise<void> => {
  const history = await optService.getOptimizationHistory();
  const csv = OptimizationReportExporterService.exportCsv(history);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="strategy_optimization_results.csv"');
  res.status(200).send(csv);
};
