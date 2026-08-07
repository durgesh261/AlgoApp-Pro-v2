import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse, getIsoUtcTimestamp } from '@algoapp/shared';
import { config } from '../../config/index.js';
import { AnalyticsEngineService } from './services/analyticsEngine.service.js';

export const analyticsRouter = Router();

analyticsRouter.get('/status', (req: Request, res: Response) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const response: ApiResponse<{ module: string; status: string }> = {
    success: true,
    data: {
      module: 'analytics',
      status: 'initialized',
    },
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

analyticsRouter.get('/strategy-metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
    const profileId = (req.query.profileId as string) || 'DEF-1H-PROF';
    
    const data = await AnalyticsEngineService.getStrategyMetrics(profileId);
    
    res.status(200).json({
      success: true,
      data,
      meta: { requestId, timestamp: getIsoUtcTimestamp() },
    });
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/trader-analytics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
    const data = await AnalyticsEngineService.getTraderAnalytics();
    
    res.status(200).json({
      success: true,
      data,
      meta: { requestId, timestamp: getIsoUtcTimestamp() },
    });
  } catch (err) {
    next(err);
  }
});
