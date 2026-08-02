import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { TradingViewAdapterService } from './services/tradingViewAdapter.service.js';
import { TradingViewHealthMonitor } from './services/tradingViewHealthMonitor.js';

const adapterService = new TradingViewAdapterService();

export const receiveWebhook = async (req: Request, res: Response): Promise<void> => {
  const result = await adapterService.receiveWebhook(req.body);

  const response: ApiResponse<typeof result> = {
    success: true,
    data: result,
    meta: {
      requestId: (req as any).correlationId || 'req-tradingview-webhook',
      timestamp: new Date().toISOString(),
    },
  };

  const statusCode = result.status === 'MALFORMED' ? 400 : 200;
  res.status(statusCode).json(response);
};

export const getHealth = async (req: Request, res: Response): Promise<void> => {
  const health = await adapterService.checkHealth();

  const response: ApiResponse<typeof health> = {
    success: true,
    data: health,
    meta: {
      requestId: (req as any).correlationId || 'req-tradingview-health',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  const events = await TradingViewHealthMonitor.getEvents();

  const response: ApiResponse<typeof events> = {
    success: true,
    data: events,
    meta: {
      requestId: (req as any).correlationId || 'req-tradingview-events',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getErrors = async (req: Request, res: Response): Promise<void> => {
  const errors = await TradingViewHealthMonitor.getErrors();

  const response: ApiResponse<typeof errors> = {
    success: true,
    data: errors,
    meta: {
      requestId: (req as any).correlationId || 'req-tradingview-errors',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};
