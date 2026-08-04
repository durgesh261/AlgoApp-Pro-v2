import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { NocTelemetryService } from './services/nocTelemetry.service.js';
import { ErrorCenterService } from './services/errorCenter.service.js';
import { DatabaseInspectorService } from './services/databaseInspector.service.js';
import { BackupRecoveryManagerService } from './services/backupRecoveryManager.service.js';
import { DiagnosticsReportGeneratorService } from './services/diagnosticsReportGenerator.service.js';

const errorService = new ErrorCenterService();
const dbInspector = new DatabaseInspectorService();
const backupManager = new BackupRecoveryManagerService();

export const getNocStatus = async (req: Request, res: Response): Promise<void> => {
  const serviceHealth = await NocTelemetryService.getServiceHealthList();
  const metrics = await NocTelemetryService.getSystemMetrics();

  const response: ApiResponse<{ services: typeof serviceHealth; metrics: typeof metrics }> = {
    success: true,
    data: { services: serviceHealth, metrics },
    meta: {
      requestId: (req as any).correlationId || 'req-noc-status',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const getErrors = async (req: Request, res: Response): Promise<void> => {
  const category = req.query.category as string | undefined;
  const severity = req.query.severity as string | undefined;
  const errors = await errorService.getErrors(category, severity);

  const response: ApiResponse<typeof errors> = {
    success: true,
    data: errors,
    meta: {
      requestId: (req as any).correlationId || 'req-noc-errors',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const exportErrorsCsv = async (_req: Request, res: Response): Promise<void> => {
  const csv = await errorService.exportErrorsCsv();

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="system_error_logs.csv"');
  res.status(200).send(csv);
};

export const getDatabaseDiagnostics = async (req: Request, res: Response): Promise<void> => {
  const diagnostics = await dbInspector.getDiagnostics();

  const response: ApiResponse<typeof diagnostics> = {
    success: true,
    data: diagnostics,
    meta: {
      requestId: (req as any).correlationId || 'req-db-diagnostics',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const createBackup = async (req: Request, res: Response): Promise<void> => {
  const backup = await backupManager.createBackup();

  const response: ApiResponse<typeof backup> = {
    success: true,
    data: backup,
    meta: {
      requestId: (req as any).correlationId || 'req-create-backup',
      timestamp: new Date().toISOString(),
    },
  };

  res.status(201).json(response);
};

export const getBackupHistory = async (req: Request, res: Response): Promise<void> => {
  const history = await backupManager.getBackupHistory();

  const response: ApiResponse<typeof history> = {
    success: true,
    data: history,
    meta: {
      requestId: (req as any).correlationId || 'req-backup-history',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const generateDiagnosticsReport = async (req: Request, res: Response): Promise<void> => {
  const report = await DiagnosticsReportGeneratorService.generateReport();

  const response: ApiResponse<typeof report> = {
    success: true,
    data: report,
    meta: {
      requestId: (req as any).correlationId || 'req-diagnostics-report',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};
