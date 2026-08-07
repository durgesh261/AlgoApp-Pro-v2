import { Request, Response } from 'express';
import { ApiResponse, NotificationSeverity } from '@algoapp/shared';
import { NotificationCenterService } from './services/notificationCenter.service.js';
import { AuditTimelineService } from './services/auditTimeline.service.js';
import { ExchangeSyncAndReconciliationService } from './services/exchangeSyncAndReconciliation.service.js';

const notifService = new NotificationCenterService();
const auditService = new AuditTimelineService();
const syncReconcileService = new ExchangeSyncAndReconciliationService();

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const severity = req.query.severity as NotificationSeverity | undefined;
  const notifications = await notifService.getNotifications(severity);

  const response: ApiResponse<typeof notifications> = {
    success: true,
    data: notifications,
    meta: {
      requestId: (req as any).correlationId || 'req-notifications',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await notifService.markAsRead(id || '');

  const response: ApiResponse<{ success: boolean }> = {
    success: true,
    data: { success: updated },
    meta: {
      requestId: (req as any).correlationId || 'req-notification-read',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
  const updated = await notifService.markAllAsRead();

  const response: ApiResponse<{ success: boolean }> = {
    success: true,
    data: { success: updated },
    meta: {
      requestId: (req as any).correlationId || 'req-notification-read-all',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const clearNotifications = async (req: Request, res: Response): Promise<void> => {
  const updated = await notifService.clearAll();

  const response: ApiResponse<{ success: boolean }> = {
    success: true,
    data: { success: updated },
    meta: {
      requestId: (req as any).correlationId || 'req-notification-clear',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};


export const getAuditTimeline = async (req: Request, res: Response): Promise<void> => {
  const { tradeId } = req.params;
  const timeline = await auditService.getTimeline(tradeId || 'SAMPLE-TRD-1');

  const response: ApiResponse<typeof timeline> = {
    success: true,
    data: timeline,
    meta: {
      requestId: (req as any).correlationId || 'req-audit-timeline',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const runReconciliation = async (req: Request, res: Response): Promise<void> => {
  const report = await syncReconcileService.runReconciliation();

  const response: ApiResponse<typeof report> = {
    success: true,
    data: report,
    meta: {
      requestId: (req as any).correlationId || 'req-reconciliation-run',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const getSubsystemHealth = async (req: Request, res: Response): Promise<void> => {
  const healthList = await syncReconcileService.getSubsystemHealth();

  const response: ApiResponse<typeof healthList> = {
    success: true,
    data: healthList,
    meta: {
      requestId: (req as any).correlationId || 'req-subsystem-health',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};
