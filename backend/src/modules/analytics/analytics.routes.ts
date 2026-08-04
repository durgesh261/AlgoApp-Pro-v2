import { Router } from 'express';
import { ApiResponse, getIsoUtcTimestamp } from '@algoapp/shared';
import { config } from '../../config/index.js';

export const analyticsRouter = Router();

analyticsRouter.get('/status', (req, res) => {
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
