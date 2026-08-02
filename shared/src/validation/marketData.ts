import { z } from 'zod';

export const ingestCandleSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  timeframe: z.literal('1H', { errorMap: () => ({ message: 'Only 1H timeframe supported' }) }),
  open: z.number().positive('Open price must be positive'),
  high: z.number().positive('High price must be positive'),
  low: z.number().positive('Low price must be positive'),
  close: z.number().positive('Close price must be positive'),
  volume: z.number().nonnegative('Volume cannot be negative'),
  timestamp: z.string().datetime({ message: 'Timestamp must be valid ISO 8601 string' }),
});

export const getMarketCandlesQuerySchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  timeframe: z.literal('1H').default('1H'),
  limit: z.coerce.number().positive().max(500).default(50),
});

export type IngestCandleInput = z.infer<typeof ingestCandleSchema>;
export type GetMarketCandlesQueryInput = z.infer<typeof getMarketCandlesQuerySchema>;
