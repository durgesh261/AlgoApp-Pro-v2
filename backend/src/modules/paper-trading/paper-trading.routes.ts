import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getPaperWallet,
  getPaperOrders,
  createPaperOrder,
  cancelPaperOrder,
  modifyPaperOrder,
  getPaperPositions,
  closePaperPosition,
  getPaperRiskConfig,
  updatePaperRiskConfig,
  getPaperJournal,
  getPaperAnalytics,
} from './paper-trading.controller.js';

const router = Router();

router.get('/wallet', asyncHandler(getPaperWallet));

router.get('/orders', asyncHandler(getPaperOrders));
router.post('/orders', asyncHandler(createPaperOrder));
router.delete('/orders/:id', asyncHandler(cancelPaperOrder));
router.patch('/orders/:id', asyncHandler(modifyPaperOrder));

router.get('/positions', asyncHandler(getPaperPositions));
router.post('/positions/:id/close', asyncHandler(closePaperPosition));

router.get('/risk', asyncHandler(getPaperRiskConfig));
router.patch('/risk', asyncHandler(updatePaperRiskConfig));

router.get('/journal', asyncHandler(getPaperJournal));
router.get('/analytics', asyncHandler(getPaperAnalytics));

export const paperTradingRouter = router;
