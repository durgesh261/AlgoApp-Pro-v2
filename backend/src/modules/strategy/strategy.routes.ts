import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getStrategyZones,
  getStrategySignals,
  evaluateStrategySignal,
} from './strategy.controller.js';

const router = Router();

router.get('/zones', asyncHandler(getStrategyZones));
router.get('/signals', asyncHandler(getStrategySignals));
router.post('/evaluate', asyncHandler(evaluateStrategySignal));

export const strategyRouter = router;
