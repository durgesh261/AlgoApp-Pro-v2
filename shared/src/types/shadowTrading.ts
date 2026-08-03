export interface ShadowDecisionRecordDto {
  id: string;
  timestamp: string;
  symbol: string;
  timeframe: string;
  strategyProfileId: string;
  supplyZoneRange: string;
  demandZoneRange: string;
  decision: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  positionSize: number;
  reasonCodes: string[];
  expectedRR: number;
  expectedProfitUsd: number;
}

export interface MarketOutcomeValidationDto {
  decisionId: string;
  tpHit: boolean;
  slHit: boolean;
  mfe: number;
  mae: number;
  holdDurationMinutes: number;
  accuracyPercent: number;
}

export interface ChallengeSimulationDto {
  passRatePercent: number;
  failRatePercent: number;
  avgDaysToPass: number;
  maxDrawdownPercent: number;
  capitalGrowthPercent: number;
  totalSimulations: number;
}

export interface StabilityMatrixItemDto {
  symbol: string;
  timeframe: string;
  regime: 'TRENDING' | 'RANGING' | 'HIGH_VOLATILITY' | 'LOW_VOLATILITY';
  stabilityScore: number; // 0 - 100
  winRatePercent: number;
}

export interface ProductionReadinessScoreDto {
  indicatorAccuracy: number;
  decisionAccuracy: number;
  executionAccuracy: number;
  syncAccuracy: number;
  accountingAccuracy: number;
  challengeAccuracy: number;
  overallReadinessScore: number;
  isProductionReady: boolean;
}
