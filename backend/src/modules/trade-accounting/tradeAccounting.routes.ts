import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getWalletState,
  getChallengeState,
  getLedger,
  getAccountingSummary,
  syncTrade,
  resetChallenge,
  exportLedgerCsv,
  exportLedgerJson,
  runReconciliation,
} from './tradeAccounting.controller.js';

const router = Router();

router.get('/wallet', asyncHandler(getWalletState));
router.get('/challenge', asyncHandler(getChallengeState));
router.post('/challenge/reset', asyncHandler(resetChallenge));
router.get('/ledger', asyncHandler(getLedger));
router.get('/summary', asyncHandler(getAccountingSummary));
router.post('/sync-trade', asyncHandler(syncTrade));
router.get('/export-ledger-csv', asyncHandler(exportLedgerCsv));
router.get('/export-ledger-json', asyncHandler(exportLedgerJson));
router.post('/reconcile', asyncHandler(runReconciliation));

export const tradeAccountingRouter = router;
