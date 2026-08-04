import { z } from 'zod';

export const calculateLeverageSchema = z.object({
  entryPrice: z.number().positive('Entry price must be greater than 0'),
  stopLossPrice: z.number().positive('Stop loss price must be greater than 0'),
  riskPercent: z.number().positive('Risk percent must be greater than 0').max(10, 'Max risk 10%'),
  maxLeverage: z.number().positive().optional(),
});

export const updateTradingRuleConfigSchema = z.object({
  minConfidence: z.number().min(0).max(100).optional(),
  maxDailyLoss: z.number().positive().optional(),
  maxDrawdownPercent: z.number().positive().optional(),
  maxSimultaneousTrades: z.number().positive().optional(),
});

export type CalculateLeverageSchemaInput = z.infer<typeof calculateLeverageSchema>;
export type UpdateTradingRuleConfigInput = z.infer<typeof updateTradingRuleConfigSchema>;
