import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getProductionOverview,
  setExecutionMode,
  triggerBackup,
} from './production.controller.js';

const router = Router();

router.get('/overview', asyncHandler(getProductionOverview));
router.post('/mode', asyncHandler(setExecutionMode));
router.post('/backup', asyncHandler(triggerBackup));

export const productionRouter = router;
