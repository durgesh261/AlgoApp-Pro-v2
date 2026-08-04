import { z } from 'zod';

export const ingestCandleSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  timeframe: z.enum(['15M', '1H'], { errorMap: () => ({ message: 'Supported timeframes: 15M, 1H' }) }).default('1H'),
  open: z.number().positive('Open price must be positive'),
  high: z.number().positive('High price must be positive'),
  low: z.number().positive('Low price must be positive'),
  close: z.number().positive('Close price must be positive'),
  volume: z.number().nonnegative('Volume cannot be negative'),
  timestamp: z.string().datetime({ message: 'Timestamp must be valid ISO 8601 string' }),
});

export const getMarketCandlesQuerySchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  timeframe: z.enum(['15M', '1H']).default('1H'),
  limit: z.coerce.number().positive().max(500).default(50),
});

export type IngestCandleInput = z.infer<typeof ingestCandleSchema>;
export type GetMarketCandlesQueryInput = z.infer<typeof getMarketCandlesQuerySchema>;
