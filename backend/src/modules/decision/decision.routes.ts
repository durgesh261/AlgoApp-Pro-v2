import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { getDecisionLogs, evaluateDecision } from './decision.controller.js';

const router = Router();

router.get('/logs', asyncHandler(getDecisionLogs));
router.post('/evaluate', asyncHandler(evaluateDecision));

export const decisionRouter = router;
