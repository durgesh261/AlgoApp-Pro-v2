import { Router } from 'express';
import { ApiResponse, getIsoUtcTimestamp } from '@algoapp/shared';
import { config } from '../../config/index.js';

import { DynamicRiskLeverageService } from './services/DynamicRiskLeverageService.js';

export const liveTradingRouter = Router();

liveTradingRouter.get('/status', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const response: ApiResponse<{ module: string; status: string }> = {
    success: true,
    data: {
      module: 'live-trading',
      status: 'initialized',
    },
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

// Scanner routes moved to scanner.routes.ts

const handleCalculateRisk = (req: any, res: any) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const source = req.method === 'POST' ? req.body : req.query;
  const { accountBalance, entryPrice, stopLossPrice, direction, side } = source;
  const result = DynamicRiskLeverageService.calculateRiskAndLeverage({
    accountBalance: Number(accountBalance) || 1000,
    entryPrice: Number(entryPrice) || 60000,
    stopLossPrice: Number(stopLossPrice) || 59000,
    direction: direction === 'SELL' || side === 'SELL' ? 'SELL' : 'BUY',
  });
  const response: ApiResponse<any> = {
    success: true,
    data: result,
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
};

liveTradingRouter.post('/calculate-risk', handleCalculateRisk);
liveTradingRouter.get('/calculate-risk', handleCalculateRisk);
liveTradingRouter.post('/risk/calculate', handleCalculateRisk);
liveTradingRouter.get('/risk/calculate', handleCalculateRisk);

