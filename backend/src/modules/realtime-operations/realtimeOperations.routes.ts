import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getNotifications,
  markNotificationRead,
  getAuditTimeline,
  runReconciliation,
  getSubsystemHealth,
} from './realtimeOperations.controller.js';

const router = Router();

router.get('/notifications', asyncHandler(getNotifications));
router.post('/notifications/:id/read', asyncHandler(markNotificationRead));
router.get('/audit-timeline/:tradeId', asyncHandler(getAuditTimeline));
router.post('/reconcile', asyncHandler(runReconciliation));
router.get('/subsystem-health', asyncHandler(getSubsystemHealth));

export const realtimeOperationsRouter = router;
