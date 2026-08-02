import { Request, Response } from 'express';
import { ApiResponse } from '@algoapp/shared';
import { calculateLeverageSchema, updateTradingRuleConfigSchema } from '@algoapp/shared';
import { TradingRulesService } from './services/tradingRules.service.js';

export const getTradingRuleConfig = async (req: Request, res: Response): Promise<void> => {
  const config = await TradingRulesService.getRuleConfig();
  const response: ApiResponse<typeof config> = {
    success: true,
    data: config,
    meta: {
      requestId: (req as any).correlationId || 'req-trading-rules-config',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const updateTradingRuleConfig = async (req: Request, res: Response): Promise<void> => {
  const validated = updateTradingRuleConfigSchema.parse(req.body);
  const updated = await TradingRulesService.updateRuleConfig(validated);

  const response: ApiResponse<typeof updated> = {
    success: true,
    data: updated,
    meta: {
      requestId: (req as any).correlationId || 'req-update-trading-rules',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const calculateLeverage = async (req: Request, res: Response): Promise<void> => {
  const validated = calculateLeverageSchema.parse(req.body);
  const leverageOutput = TradingRulesService.calculateLeverage(validated);

  const response: ApiResponse<typeof leverageOutput> = {
    success: true,
    data: leverageOutput,
    meta: {
      requestId: (req as any).correlationId || 'req-calc-leverage',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};

export const getRuleRegistry = async (req: Request, res: Response): Promise<void> => {
  const registry = TradingRulesService.getRuleRegistry();

  const response: ApiResponse<typeof registry> = {
    success: true,
    data: registry,
    meta: {
      requestId: (req as any).correlationId || 'req-rule-registry',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
};
