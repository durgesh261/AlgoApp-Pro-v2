import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getTradingRuleConfig,
  updateTradingRuleConfig,
  calculateLeverage,
  getRuleRegistry,
} from './rules.controller.js';

const router = Router();

router.get('/config', asyncHandler(getTradingRuleConfig));
router.patch('/config', asyncHandler(updateTradingRuleConfig));
router.post('/calculate-leverage', asyncHandler(calculateLeverage));
router.get('/registry', asyncHandler(getRuleRegistry));

export const rulesRouter = router;
