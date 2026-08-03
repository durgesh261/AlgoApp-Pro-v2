import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getNocStatus,
  getErrors,
  exportErrorsCsv,
  getDatabaseDiagnostics,
  createBackup,
  getBackupHistory,
  generateDiagnosticsReport,
} from './operationsCenter.controller.js';

const router = Router();

router.get('/status', asyncHandler(getNocStatus));
router.get('/errors', asyncHandler(getErrors));
router.get('/export-errors-csv', asyncHandler(exportErrorsCsv));
router.get('/database-diagnostics', asyncHandler(getDatabaseDiagnostics));
router.post('/backup', asyncHandler(createBackup));
router.get('/backup-history', asyncHandler(getBackupHistory));
router.get('/diagnostics-report', asyncHandler(generateDiagnosticsReport));

export const operationsCenterRouter = router;
