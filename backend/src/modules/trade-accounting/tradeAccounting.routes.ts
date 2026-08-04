import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getWalletState,
  getChallengeState,
  getLedger,
  syncTrade,
  resetChallenge,
  exportLedgerCsv,
} from './tradeAccounting.controller.js';

const router = Router();

router.get('/wallet', asyncHandler(getWalletState));
router.get('/challenge', asyncHandler(getChallengeState));
router.post('/challenge/reset', asyncHandler(resetChallenge));
router.get('/ledger', asyncHandler(getLedger));
router.post('/sync-trade', asyncHandler(syncTrade));
router.get('/export-ledger-csv', asyncHandler(exportLedgerCsv));

export const tradeAccountingRouter = router;
