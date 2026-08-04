import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
} from './strategyProfile.controller.js';

const router = Router();

router.get('/', asyncHandler(getProfiles));
router.get('/:id', asyncHandler(getProfileById));
router.post('/', asyncHandler(createProfile));
router.put('/:id', asyncHandler(updateProfile));

export const strategyProfileRouter = router;
