import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { StrategyProfileService } from './services/strategyProfile.service.js';

const profileService = new StrategyProfileService();

export const getProfiles = async (req: Request, res: Response): Promise<void> => {
  const profiles = await profileService.getProfiles();

  const response: ApiResponse<typeof profiles> = {
    success: true,
    data: profiles,
    meta: {
      requestId: (req as any).correlationId || 'req-profile-list',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const getProfileById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const profile = await profileService.getProfileById(id || '');

  const response: ApiResponse<typeof profile> = {
    success: true,
    data: profile,
    meta: {
      requestId: (req as any).correlationId || 'req-profile-detail',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  const profile = await profileService.createProfile(req.body);

  const response: ApiResponse<typeof profile> = {
    success: true,
    data: profile,
    meta: {
      requestId: (req as any).correlationId || 'req-profile-create',
      timestamp: new Date().toISOString(),
    },
  };

  res.status(201).json(response);
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const profile = await profileService.updateProfile(id || '', req.body);

  const response: ApiResponse<typeof profile> = {
    success: true,
    data: profile,
    meta: {
      requestId: (req as any).correlationId || 'req-profile-update',
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
};
