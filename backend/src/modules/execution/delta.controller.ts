import { Request, Response } from 'express';
import { ApiResponse, DeltaEnvironment } from '@algoapp/shared';
import { DeltaAdapter } from './adapters/delta/deltaAdapter.js';
import { EmergencyKillSwitch } from './adapters/delta/emergencyKillSwitch.js';
import { DeltaStateReconciler } from './adapters/delta/deltaStateReconciler.js';
import { DeltaRecoverySimulator } from './adapters/delta/deltaRecoverySimulator.js';
import { DeltaSandboxClient } from './adapters/delta/deltaSandboxClient.js';

let defaultAdapter = new DeltaAdapter(DeltaEnvironment.SANDBOX, true);
const sandboxClient = new DeltaSandboxClient();

export const getDeltaHealth = async (req: Request, res: Response): Promise<void> => {
  console.log('HIT DELTA HEALTH');
  const health = await defaultAdapter.health();
  const response: ApiResponse<typeof health> = {
    success: true,
    data: health,
    meta: {
      requestId: (req as any).correlationId || 'req-get-delta-health',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const connectDelta = async (req: Request, res: Response): Promise<void> => {
  const { environment } = req.body;
  if (environment === DeltaEnvironment.PRODUCTION) {
    defaultAdapter = new DeltaAdapter(DeltaEnvironment.PRODUCTION, false);
  } else {
    defaultAdapter = new DeltaAdapter(DeltaEnvironment.SANDBOX, false);
  }
  await defaultAdapter.connect();
  const health = await defaultAdapter.health();

  const response: ApiResponse<typeof health> = {
    success: true,
    data: health,
    meta: {
      requestId: (req as any).correlationId || 'req-connect-delta',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const disconnectDelta = async (req: Request, res: Response): Promise<void> => {
  await defaultAdapter.disconnect();
  const health = await defaultAdapter.health();

  const response: ApiResponse<typeof health> = {
    success: true,
    data: health,
    meta: {
      requestId: (req as any).correlationId || 'req-disconnect-delta',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const toggleKillSwitch = async (req: Request, res: Response): Promise<void> => {
  const { active } = req.body;
  const isKillSwitchActive = EmergencyKillSwitch.setKillSwitch(Boolean(active));

  const response: ApiResponse<{ isKillSwitchActive: boolean }> = {
    success: true,
    data: { isKillSwitchActive },
    meta: {
      requestId: (req as any).correlationId || 'req-toggle-kill-switch',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getDeltaSyncStatus = async (req: Request, res: Response): Promise<void> => {
  const syncStatus = await sandboxClient.fetchSyncStatus();

  const response: ApiResponse<typeof syncStatus> = {
    success: true,
    data: syncStatus,
    meta: {
      requestId: (req as any).correlationId || 'req-get-delta-sync',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const reconcileDeltaState = async (req: Request, res: Response): Promise<void> => {
  const reconciliation = await DeltaStateReconciler.reconcileState();

  const response: ApiResponse<typeof reconciliation> = {
    success: true,
    data: reconciliation,
    meta: {
      requestId: (req as any).correlationId || 'req-reconcile-delta-state',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const simulateDeltaRecovery = async (req: Request, res: Response): Promise<void> => {
  const { scenario } = req.body;
  const result = await DeltaRecoverySimulator.simulateScenario(
    scenario || 'WS_DISCONNECT',
    defaultAdapter.getConnectionManager()
  );

  const response: ApiResponse<typeof result> = {
    success: true,
    data: result,
    meta: {
      requestId: (req as any).correlationId || 'req-simulate-delta-recovery',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};
