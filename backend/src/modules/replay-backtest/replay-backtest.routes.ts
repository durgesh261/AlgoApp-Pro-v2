import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getReplaySession,
  controlReplay,
  getReplayEvents,
  getBacktestSessions,
  runBacktest,
} from './replay-backtest.controller.js';

const router = Router();

router.get('/session', asyncHandler(getReplaySession));
router.post('/control', asyncHandler(controlReplay));
router.get('/events', asyncHandler(getReplayEvents));

router.get('/backtest/sessions', asyncHandler(getBacktestSessions));
router.post('/backtest/run', asyncHandler(runBacktest));

export const replayBacktestRouter = router;
