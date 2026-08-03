import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  runValidation,
  getHistory,
  getReportById,
  exportCsv,
} from './indicatorValidation.controller.js';

const router = Router();

router.post('/run', asyncHandler(runValidation));
router.get('/history', asyncHandler(getHistory));
router.get('/report/:id', asyncHandler(getReportById));
router.get('/export-csv/:id', asyncHandler(exportCsv));

export const indicatorValidationRouter = router;
