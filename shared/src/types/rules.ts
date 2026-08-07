export interface RuleMetadataDto {
  ruleId: string;
  name: string;
  description: string;
  purpose: string;
  currentValue: string | number | boolean;
}

export interface ConfidenceBonusesDto {
  freshZoneBonus: number;
  mergedZoneBonus: number;
  firstTouchBonus: number;
  momentumBonus: number;
  opposingZonePenalty: number;
  brokenZonePenalty: number;
}

export interface RiskRulesDto {
  minConfidence: number;
  maxSimultaneousTrades: number;
  riskPercent: number;
  maxLeverageCap: number;
}


export interface TradingRuleConfigDto {
  id: string;
  ruleVersion: string; // e.g. "v2.0.0"
  configVersion: string;
  supportedPairs: string[];
  supportedTimeframe: string;
  confidenceBonuses: ConfidenceBonusesDto;
  riskRules: RiskRulesDto;
  updatedAt: string;
}

export interface CalculateLeverageInput {
  entryPrice: number;
  stopLossPrice: number;
  riskPercent: number;
  maxLeverage?: number | undefined;
}

export interface LeverageOutputDto {
  recommendedLeverage: number;
  stopLossDistancePercent: number;
  riskPercent: number;
  boundedByMax: boolean;
}
