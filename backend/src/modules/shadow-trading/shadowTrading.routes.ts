import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { getShadowDashboard, triggerShadowCycle } from './shadowTrading.controller.js';

const router = Router();

router.get('/dashboard', asyncHandler(getShadowDashboard));
router.post('/cycle', asyncHandler(triggerShadowCycle));

export const shadowTradingRouter = router;
