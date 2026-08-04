import { Request, Response } from 'express';
import { ApiResponse, ExecutionMode, AppEnvironment } from '@algoapp/shared';
import { LiveTradingGuard } from './services/liveTradingGuard.js';
import { ProductionMetricsService } from './services/productionMetricsService.js';
import { BackupManager } from './services/backupManager.js';
import { EnvValidator } from '../../config/envValidator.js';

let activeExecutionMode: ExecutionMode = ExecutionMode.PAPER;

export const getProductionOverview = async (req: Request, res: Response): Promise<void> => {
  const envConfig = EnvValidator.validateEnv();
  const safetyCheck = await LiveTradingGuard.evaluateSafety(activeExecutionMode);
  const metrics = await ProductionMetricsService.getMetrics();
  const backupStatus = await BackupManager.getBackupStatus();

  const overview = {
    environment: envConfig.nodeEnv as AppEnvironment,
    activeExecutionMode,
    isLiveTradingAllowed: safetyCheck.isAllowed && activeExecutionMode === ExecutionMode.LIVE,
    safetyCheck,
    metrics,
    backupStatus,
    updatedAt: new Date().toISOString(),
  };

  const response: ApiResponse<typeof overview> = {
    success: true,
    data: overview,
    meta: {
      requestId: (req as any).correlationId || 'req-get-prod-overview',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const setExecutionMode = async (req: Request, res: Response): Promise<void> => {
  const { mode, userConfirmed } = req.body;

  if (mode === ExecutionMode.LIVE) {
    if (!userConfirmed) {
      res.status(400).json({
        success: false,
        error: 'LIVE_MODE_REJECTED: Explicit user confirmation required to enable Live Trading.',
        meta: { requestId: (req as any).correlationId || 'req-set-mode', timestamp: new Date().toISOString() },
      });
      return;
    }
    LiveTradingGuard.setExplicitUserConfirmed(true);
    LiveTradingGuard.setLiveModeActive(true);
    activeExecutionMode = ExecutionMode.LIVE;
  } else if (mode === ExecutionMode.SANDBOX) {
    activeExecutionMode = ExecutionMode.SANDBOX;
  } else {
    activeExecutionMode = ExecutionMode.PAPER;
    LiveTradingGuard.setLiveModeActive(false);
  }

  const overview = {
    activeExecutionMode,
    userConfirmed: Boolean(userConfirmed),
    updatedAt: new Date().toISOString(),
  };

  const response: ApiResponse<typeof overview> = {
    success: true,
    data: overview,
    meta: {
      requestId: (req as any).correlationId || 'req-set-mode',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const triggerBackup = async (req: Request, res: Response): Promise<void> => {
  const backupStatus = await BackupManager.triggerBackup();

  const response: ApiResponse<typeof backupStatus> = {
    success: true,
    data: backupStatus,
    meta: {
      requestId: (req as any).correlationId || 'req-trigger-backup',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};
