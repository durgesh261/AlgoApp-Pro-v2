import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { ShadowTradingEngineService } from './services/shadowTradingEngine.service.js';

const shadowEngine = new ShadowTradingEngineService();

export const getShadowDashboard = async (req: Request, res: Response): Promise<void> => {
  const data = await shadowEngine.getDashboardData();

  const response: ApiResponse<typeof data> = {
    success: true,
    data,
    meta: {
      requestId: (req as any).correlationId || 'req-shadow-dashboard',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const triggerShadowCycle = async (req: Request, res: Response): Promise<void> => {
  const result = await shadowEngine.runShadowCycle();

  const response: ApiResponse<typeof result> = {
    success: true,
    data: result,
    meta: {
      requestId: (req as any).correlationId || 'req-shadow-cycle',
      timestamp: new Date().toISOString(),
    },
  };

  res.status(201).json(response);
};
