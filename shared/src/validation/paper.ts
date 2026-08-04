import { z } from 'zod';
import { PaperOrderSide, PaperOrderType } from '../types/paper.js';

export const createPaperOrderSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  side: z.nativeEnum(PaperOrderSide),
  orderType: z.nativeEnum(PaperOrderType),
  price: z.number().positive('Price must be greater than 0').optional(),
  stopPrice: z.number().positive('Stop price must be greater than 0').optional(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  leverage: z.number().min(1).max(125).default(10),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
});

export const modifyPaperOrderSchema = z.object({
  price: z.number().positive().optional(),
  stopPrice: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
});

export const updatePaperRiskConfigSchema = z.object({
  maxDailyLoss: z.number().positive().optional(),
  maxDrawdownPercent: z.number().min(1).max(100).optional(),
  maxOpenPositions: z.number().min(1).max(50).optional(),
  maxRiskPerTradePercent: z.number().min(0.1).max(50).optional(),
  isEmergencyStopActive: z.boolean().optional(),
});

export type CreatePaperOrderInput = z.infer<typeof createPaperOrderSchema>;
export type ModifyPaperOrderInput = z.infer<typeof modifyPaperOrderSchema>;
export type UpdatePaperRiskConfigInput = z.infer<typeof updatePaperRiskConfigSchema>;
