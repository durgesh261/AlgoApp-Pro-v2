import { z } from 'zod';

export const evaluateStrategySignalSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  currentPrice: z.number().positive('Current price must be greater than 0'),
  timeframe: z.literal('1H').default('1H'),
});

export const getZonesQuerySchema = z.object({
  symbol: z.string().optional(),
  timeframe: z.literal('1H').default('1H'),
});

export type EvaluateStrategySignalInput = z.infer<typeof evaluateStrategySignalSchema>;
export type GetZonesQueryInput = z.infer<typeof getZonesQuerySchema>;
