import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { IndicatorEngineService } from './services/indicatorEngine.service.js';

const engineService = new IndicatorEngineService();

export const evaluateIndicator = async (req: Request, res: Response): Promise<void> => {
  const symbol = (req.query.symbol as string) || (req.body && req.body.symbol) || 'BTCUSD.P';
  const customCandles = req.body && Array.isArray(req.body.candles) ? req.body.candles : undefined;

  const data = await engineService.evaluateSymbol(symbol, customCandles);

  const response: ApiResponse<typeof data> = {
    success: true,
    data,
    meta: {
      requestId: (req as any).correlationId || 'req-indicator-evaluate',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};
