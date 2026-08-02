import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  submitExecution,
  getSessions,
  getRequests,
  getResults,
  getJournal,
} from './execution.controller.js';

const router = Router();

router.post('/submit', asyncHandler(submitExecution));
router.get('/sessions', asyncHandler(getSessions));
router.get('/requests', asyncHandler(getRequests));
router.get('/results', asyncHandler(getResults));
router.get('/journal', asyncHandler(getJournal));

export const executionRouter = router;
