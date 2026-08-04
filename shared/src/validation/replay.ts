import { z } from 'zod';
import { ReplayControlAction } from '../types/replay.js';

export const replayControlSchema = z.object({
  action: z.nativeEnum(ReplayControlAction),
  speedMultiplier: z.number().positive().optional(),
  targetIndex: z.number().nonnegative().optional(),
});

export type ReplayControlInput = z.infer<typeof replayControlSchema>;
