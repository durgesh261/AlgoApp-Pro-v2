import {
  TradingRuleConfigDto,
  CalculateLeverageInput,
  LeverageOutputDto,
  RuleMetadataDto,
  UpdateTradingRuleConfigInput,
} from '@algoapp/shared';

import { DynamicLeverageEvaluator } from '../evaluators/dynamicLeverageEvaluator.js';
import { RuleRegistry } from '../registry/ruleRegistry.js';

let activeRuleConfig: TradingRuleConfigDto = {
  id: 'default-trading-rules',
  ruleVersion: 'v2.0.0',
  configVersion: 'cfg-2026.08.02',
  supportedPairs: ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'],
  supportedTimeframe: '1H',
  confidenceBonuses: {
    freshZoneBonus: 20,
    mergedZoneBonus: 15,
    firstTouchBonus: 20,
    momentumBonus: 10,
    opposingZonePenalty: -20,
    brokenZonePenalty: -100,
  },
  riskRules: {
    minConfidence: 80,
    maxZoneWidthBtc: 1500,
    maxZoneWidthEth: 150,
    maxZoneWidthAlt: 25,
    maxTouchCount: 2,
    minRewardToRisk: 2.0,
    maxDailyLoss: 1000.0,
    maxDrawdownPercent: 5.0,
    maxSimultaneousTrades: 5,
  },
  challengeRules: {
    startingBalance: 50000,
    targetProfit: 5000,
    dailyLossLimit: 2500,
    maxDrawdownLimit: 5000,
    minTradingDays: 5,
  },
  updatedAt: new Date().toISOString(),
};

export class TradingRulesService {
  public static async getRuleConfig(): Promise<TradingRuleConfigDto> {
    return activeRuleConfig;
  }

  public static async updateRuleConfig(input: UpdateTradingRuleConfigInput): Promise<TradingRuleConfigDto> {
    activeRuleConfig = {
      ...activeRuleConfig,
      riskRules: {
        ...activeRuleConfig.riskRules,
        minConfidence: input.minConfidence ?? activeRuleConfig.riskRules.minConfidence,
        maxDailyLoss: input.maxDailyLoss ?? activeRuleConfig.riskRules.maxDailyLoss,
        maxDrawdownPercent: input.maxDrawdownPercent ?? activeRuleConfig.riskRules.maxDrawdownPercent,
        maxSimultaneousTrades: input.maxSimultaneousTrades ?? activeRuleConfig.riskRules.maxSimultaneousTrades,
      },
      configVersion: `cfg-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    return activeRuleConfig;
  }

  public static calculateLeverage(input: CalculateLeverageInput): LeverageOutputDto {
    return DynamicLeverageEvaluator.calculateLeverage(input);
  }

  public static getRuleRegistry(): RuleMetadataDto[] {
    return RuleRegistry.getAllRuleMetadata();
  }
}
