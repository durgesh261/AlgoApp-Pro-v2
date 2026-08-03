import { z } from 'zod';

export const tradingViewWebhookSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  timeframe: z.enum(['15M', '1H'], {
    errorMap: () => ({ message: 'Only 15M and 1H timeframes are supported' }),
  }),
  open: z.number().positive('Open price must be positive'),
  high: z.number().positive('High price must be positive'),
  low: z.number().positive('Low price must be positive'),
  close: z.number().positive('Close price must be positive'),
  volume: z.number().nonnegative('Volume must be non-negative'),
  timestamp: z.string().min(1, 'Timestamp is required'),
  passphrase: z.string().optional(),
});

export type TradingViewWebhookSchemaInput = z.infer<typeof tradingViewWebhookSchema>;
