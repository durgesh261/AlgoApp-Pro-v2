import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getMarketSnapshot,
  getMarketCandles,
  ingestCandle,
  getMarketEvents,
} from './market-data.controller.js';

const router = Router();

router.get('/snapshot', asyncHandler(getMarketSnapshot));
router.get('/candles', asyncHandler(getMarketCandles));
router.post('/candles', asyncHandler(ingestCandle));
router.get('/events', asyncHandler(getMarketEvents));

export const marketDataRouter = router;
