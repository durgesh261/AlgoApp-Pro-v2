import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  submitExecution,
  getSessions,
  getRequests,
  getResults,
  getJournal,
} from './execution.controller.js';
import {
  getDeltaHealth,
  connectDelta,
  disconnectDelta,
  toggleKillSwitch,
} from './delta.controller.js';

const router = Router();

router.post('/submit', asyncHandler(submitExecution));
router.get('/sessions', asyncHandler(getSessions));
router.get('/requests', asyncHandler(getRequests));
router.get('/results', asyncHandler(getResults));
router.get('/journal', asyncHandler(getJournal));

// Delta Exchange Routes
router.get('/delta/health', asyncHandler(getDeltaHealth));
router.post('/delta/connect', asyncHandler(connectDelta));
router.post('/delta/disconnect', asyncHandler(disconnectDelta));
router.post('/delta/kill-switch', asyncHandler(toggleKillSwitch));

export const executionRouter = router;
