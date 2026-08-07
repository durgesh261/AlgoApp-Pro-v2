import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { evaluateDecisionSchema } from '@algoapp/shared';
import { DecisionEngineService } from './services/decisionEngine.service.js';

export const getDecisionLogs = async (req: Request, res: Response): Promise<void> => {
  const logs = await DecisionEngineService.getDecisionLogs();

  const response: ApiResponse<typeof logs> = {
    success: true,
    data: logs,
    meta: {
      requestId: (req as any).correlationId || 'req-decision-logs',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const evaluateDecision = async (req: Request, res: Response): Promise<void> => {
  const validated = evaluateDecisionSchema.parse(req.body);
  const decision = await DecisionEngineService.evaluateDecision({
    symbol: validated.symbol,
    timeframe: '1H',
    currentPrice: validated.currentPrice,
    indicators: {} as any,
  });

  const response: ApiResponse<typeof decision> = {
    success: true,
    data: decision,
    meta: {
      requestId: (req as any).correlationId || 'req-eval-decision',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};
