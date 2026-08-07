import { Router } from 'express';
import { SystemController } from './system.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

export const systemRouter = Router();

systemRouter.get('/liveness', asyncHandler(async (req, res) => SystemController.getLiveness(req, res)));
systemRouter.get('/readiness', asyncHandler(async (req, res) => SystemController.getReadiness(req, res)));
systemRouter.post('/hard-reset', asyncHandler(async (req, res) => SystemController.hardReset(req, res)));
