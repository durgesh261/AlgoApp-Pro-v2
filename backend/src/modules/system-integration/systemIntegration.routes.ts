import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  runPipeline,
  getTraces,
  getTraceById,
  getHealthOverview,
} from './systemIntegration.controller.js';

const router = Router();

router.post('/pipeline/run', asyncHandler(runPipeline));
router.get('/traces', asyncHandler(getTraces));
router.get('/traces/:id', asyncHandler(getTraceById));
router.get('/health-overview', asyncHandler(getHealthOverview));

export const systemIntegrationRouter = router;
