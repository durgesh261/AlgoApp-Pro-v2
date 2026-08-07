import {
  TradingRuleConfigDto,
  CalculateLeverageInput,
  LeverageOutputDto,
  RuleMetadataDto,
  UpdateTradingRuleConfigInput,
} from '@algoapp/shared';

import { prisma } from '../../../db.js';
import { DynamicLeverageEvaluator } from '../evaluators/dynamicLeverageEvaluator.js';
import { RuleRegistry } from '../registry/ruleRegistry.js';

const defaultRuleConfig = {
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
    minConfidence: 85,
    maxSimultaneousTrades: 1,
    riskPercent: 35.0,
    maxLeverageCap: 100,
  }
};

export class TradingRulesService {
  public static async getRuleConfig(): Promise<TradingRuleConfigDto> {
    let config = await prisma.tradingRuleConfig.findUnique({
      where: { id: 'default-trading-rules' }
    });

    if (!config) {
      config = await prisma.tradingRuleConfig.create({
        data: {
          id: 'default-trading-rules',
          ruleVersion: defaultRuleConfig.ruleVersion,
          configVersion: defaultRuleConfig.configVersion,
          supportedPairsJson: JSON.stringify(defaultRuleConfig.supportedPairs),
          supportedTimeframe: defaultRuleConfig.supportedTimeframe,
          bonusesJson: JSON.stringify(defaultRuleConfig.confidenceBonuses),
          riskRulesJson: JSON.stringify(defaultRuleConfig.riskRules),
        }
      });
    }

    return {
      id: config.id,
      ruleVersion: config.ruleVersion,
      configVersion: config.configVersion,
      supportedPairs: JSON.parse(config.supportedPairsJson),
      supportedTimeframe: config.supportedTimeframe,
      confidenceBonuses: JSON.parse(config.bonusesJson || '{}'),
      riskRules: JSON.parse(config.riskRulesJson || '{}'),
      updatedAt: config.updatedAt.toISOString(),
    };
  }

  public static async updateRuleConfig(input: UpdateTradingRuleConfigInput): Promise<TradingRuleConfigDto> {
    const current = await this.getRuleConfig();

    const updatedRiskRules = {
      ...current.riskRules,
      minConfidence: input.minConfidence ?? current.riskRules.minConfidence,
      maxSimultaneousTrades: input.maxSimultaneousTrades ?? current.riskRules.maxSimultaneousTrades,
      riskPercent: input.riskPercent ?? current.riskRules.riskPercent,
      maxLeverageCap: input.maxLeverageCap ?? current.riskRules.maxLeverageCap,
    };

    const updated = await prisma.tradingRuleConfig.update({
      where: { id: 'default-trading-rules' },
      data: {
        configVersion: `cfg-${Date.now()}`,
        riskRulesJson: JSON.stringify(updatedRiskRules),
      }
    });

    return {
      id: updated.id,
      ruleVersion: updated.ruleVersion,
      configVersion: updated.configVersion,
      supportedPairs: JSON.parse(updated.supportedPairsJson),
      supportedTimeframe: updated.supportedTimeframe,
      confidenceBonuses: JSON.parse(updated.bonusesJson || '{}'),
      riskRules: JSON.parse(updated.riskRulesJson || '{}'),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  public static calculateLeverage(input: CalculateLeverageInput): LeverageOutputDto {
    return DynamicLeverageEvaluator.calculateLeverage(input);
  }

  public static getRuleRegistry(): RuleMetadataDto[] {
    return RuleRegistry.getAllRuleMetadata();
  }
}
