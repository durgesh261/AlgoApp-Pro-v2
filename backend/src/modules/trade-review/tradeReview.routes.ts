import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getTradeReview,
  saveJournalNote,
  getPerformanceSummary,
  exportTradeReviewCsv,
  exportTradeReviewJson,
} from './tradeReview.controller.js';

const router = Router();

router.get('/performance-summary', asyncHandler(getPerformanceSummary));
router.get('/:tradeId', asyncHandler(getTradeReview));
router.post('/:tradeId/journal', asyncHandler(saveJournalNote));
router.get('/:tradeId/export-csv', asyncHandler(exportTradeReviewCsv));
router.get('/:tradeId/export-json', asyncHandler(exportTradeReviewJson));

export const tradeReviewRouter = router;
