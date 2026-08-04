import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  runOptimization,
  getOptimizationHistory,
  exportOptimizationCsv,
} from './strategyOptimization.controller.js';

const router = Router();

router.post('/run', asyncHandler(runOptimization));
router.get('/history', asyncHandler(getOptimizationHistory));
router.get('/export-csv', asyncHandler(exportOptimizationCsv));

export const strategyOptimizationRouter = router;
