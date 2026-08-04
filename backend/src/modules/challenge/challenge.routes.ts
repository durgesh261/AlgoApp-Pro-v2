import { Router } from 'express';
import { ApiResponse, getIsoUtcTimestamp } from '@algoapp/shared';
import { config } from '../../config/index.js';

export const challengeRouter = Router();

challengeRouter.get('/status', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const response: ApiResponse<{ module: string; status: string }> = {
    success: true,
    data: {
      module: 'challenge',
      status: 'initialized',
    },
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});
