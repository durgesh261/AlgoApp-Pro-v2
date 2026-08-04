import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  receiveWebhook,
  getHealth,
  getEvents,
  getErrors,
} from './tradingview.controller.js';

const router = Router();

router.post('/webhook', asyncHandler(receiveWebhook));
router.get('/health', asyncHandler(getHealth));
router.get('/events', asyncHandler(getEvents));
router.get('/errors', asyncHandler(getErrors));

export const tradingViewRouter = router;
