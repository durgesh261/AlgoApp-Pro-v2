import { z } from 'zod';

export const runBacktestSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  timeframe: z.literal('1H').default('1H'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  initialBalance: z.number().positive().optional().default(50000),
});

export type RunBacktestSchemaInput = z.infer<typeof runBacktestSchema>;
