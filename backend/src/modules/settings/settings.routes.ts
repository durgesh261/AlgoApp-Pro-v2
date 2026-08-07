import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { SettingsController } from './settings.controller.js';
import { ApiResponse, getIsoUtcTimestamp } from '@algoapp/shared';
import { config } from '../../config/index.js';

export const settingsRouter = Router();

// Legacy status endpoint
settingsRouter.get('/status', (req, res) => {
  const requestId = (req.headers[config.correlationHeader.toLowerCase()] as string) || 'unknown';
  const response: ApiResponse<{ module: string; status: string }> = {
    success: true,
    data: {
      module: 'settings',
      status: 'initialized',
    },
    meta: {
      requestId,
      timestamp: getIsoUtcTimestamp(),
    },
  };
  res.status(200).json(response);
});

// Settings & Delta API Key Management
settingsRouter.get('/', asyncHandler(SettingsController.getSettings));
settingsRouter.post('/delta-credentials', asyncHandler(SettingsController.saveDeltaCredentials));
settingsRouter.post('/delta-credentials/test', asyncHandler(SettingsController.testDeltaCredentials));
settingsRouter.delete('/delta-credentials', asyncHandler(SettingsController.deleteDeltaCredentials));
