import { Request, Response } from 'express';
import { ApiResponse, DeltaEnvironment } from '@algoapp/shared';
import { DeltaAdapter } from './adapters/delta/deltaAdapter.js';
import { EmergencyKillSwitch } from './adapters/delta/emergencyKillSwitch.js';

let defaultAdapter = new DeltaAdapter(DeltaEnvironment.SANDBOX, true);

export const getDeltaHealth = async (req: Request, res: Response): Promise<void> => {
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
    defaultAdapter = new DeltaAdapter(DeltaEnvironment.PRODUCTION, true);
  } else {
    defaultAdapter = new DeltaAdapter(DeltaEnvironment.SANDBOX, true);
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
