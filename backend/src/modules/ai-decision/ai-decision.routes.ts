import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { explainDecision } from './ai-decision.controller.js';

const router = Router();

router.post('/explain', asyncHandler(explainDecision));

export const aiDecisionRouter = router;
