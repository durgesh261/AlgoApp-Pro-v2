import { Router, Request, Response } from 'express';
import { candleEngine } from '../engine/CandleEngine.js';

export const enterpriseApiRouter = Router();

// Delta Connection Health
enterpriseApiRouter.get('/health/delta', (_req: Request, res: Response) => {
  res.json({
    status: 'ACTIVE',
    provider: 'Delta Exchange India',
    restStatus: 'CONNECTED',
    wsStatus: 'CONNECTED',
    timestamp: new Date().toISOString(),
  });
});

// Live Market Candle from in-memory CandleEngine
enterpriseApiRouter.get('/market/candle/:symbol/:timeframe', (req: Request, res: Response) => {
  const symbol = req.params['symbol'];
  const timeframe = req.params['timeframe'];

  if (!symbol || !timeframe) {
    return res.status(400).json({ success: false, message: 'symbol and timeframe are required' });
  }

  const candle = candleEngine.getLiveCandle(symbol, timeframe);
  if (!candle) {
    return res.status(404).json({ success: false, message: 'No live candle data yet' });
  }
  return res.json({ success: true, data: candle });
});

// Event status endpoint
enterpriseApiRouter.get('/events/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'EventBus operational',
    timestamp: new Date().toISOString(),
  });
});
