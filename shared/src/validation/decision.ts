import { z } from 'zod';

export const evaluateDecisionSchema = z.object({
  signalId: z.string().min(1, 'Signal ID is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  currentPrice: z.number().positive('Current price must be greater than 0'),
  timeframe: z.literal('1H').default('1H'),
});

export type EvaluateDecisionInput = z.infer<typeof evaluateDecisionSchema>;
