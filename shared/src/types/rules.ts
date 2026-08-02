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
  maxZoneWidthBtc: number;
  maxZoneWidthEth: number;
  maxZoneWidthAlt: number;
  maxTouchCount: number;
  minRewardToRisk: number;
  maxDailyLoss: number;
  maxDrawdownPercent: number;
  maxSimultaneousTrades: number;
}

export interface ChallengeRulesDto {
  startingBalance: number;
  targetProfit: number;
  dailyLossLimit: number;
  maxDrawdownLimit: number;
  minTradingDays: number;
}

export interface TradingRuleConfigDto {
  id: string;
  ruleVersion: string; // e.g. "v2.0.0"
  configVersion: string;
  supportedPairs: string[];
  supportedTimeframe: '1H';
  confidenceBonuses: ConfidenceBonusesDto;
  riskRules: RiskRulesDto;
  challengeRules: ChallengeRulesDto;
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
