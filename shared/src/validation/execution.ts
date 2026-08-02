import { z } from 'zod';
import { ExecutionMode } from '../types/execution.js';

export const submitExecutionSchema = z.object({
  decisionId: z.string().min(1, 'Decision ID is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  side: z.enum(['LONG', 'SHORT']),
  mode: z.nativeEnum(ExecutionMode).optional().default(ExecutionMode.PAPER),
  quantity: z.number().positive('Quantity must be greater than 0'),
  price: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  idempotencyKey: z.string().optional(),
});

export type SubmitExecutionSchemaInput = z.infer<typeof submitExecutionSchema>;
