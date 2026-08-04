import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { evaluateIndicator } from './indicator.controller.js';

const router = Router();

router.get('/evaluate', asyncHandler(evaluateIndicator));
router.post('/evaluate', asyncHandler(evaluateIndicator));

export const indicatorRouter = router;
