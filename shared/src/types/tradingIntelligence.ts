export type MarketRegimeType =
  | 'TRENDING_BULLISH'
  | 'TRENDING_BEARISH'
  | 'RANGING'
  | 'EXPANSION'
  | 'COMPRESSION'
  | 'HIGH_VOLATILITY'
  | 'LOW_VOLATILITY';

export interface TradeIntelligenceScoreDto {
  tradeId: string;
  symbol: string;
  overallScore: number; // 0 - 100
  entryQuality: number; // 0 - 100
  exitQuality: number; // 0 - 100
  timingQuality: number; // 0 - 100
  zoneQuality: number; // 0 - 100
  rrQuality: number; // 0 - 100
  confidenceAccuracy: number; // 0 - 100
  executionAccuracy: number; // 0 - 100
  journalCorrelation: string;
  evaluatedAt: string;
}

export interface StrategyPerformanceMetricsDto {
  profileId: string;
  profileName: string;
  totalTrades: number;
  winRate: number; // Percentage 0 - 100
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  recoveryFactor: number;
  maxDrawdownPercent: number;
  avgRiskRewardRatio: number;
  avgHoldTimeMinutes: number;
  avgTradingFee: number;
  avgNetProfit: number;
  updatedAt: string;
}

export interface MarketRegimeInfoDto {
  symbol: string;
  timeframe: string;
  regime: MarketRegimeType;
  atr: number;
  volatilityPercent: number;
  trendStrength: number; // 0 - 100
  session: string;
  timestamp: string;
}

export interface PatternDiscoveryItemDto {
  id: string;
  category: 'SESSION' | 'TIMEFRAME' | 'CONFIDENCE' | 'PAIR' | 'PROFILE' | 'REGIME';
  title: string;
  patternDescription: string;
  sampleSize: number;
  winRate: number;
  avgProfit: number;
  statisticalSignificance: number; // 0 - 100
}

export interface TraderAnalyticsDto {
  weeklyProgressPercent: number;
  monthlyProgressPercent: number;
  quarterlyProgressPercent: number;
  annualProgressPercent: number;
  consistencyScore: number; // 0 - 100
  disciplineScore: number; // 0 - 100
  riskManagementScore: number; // 0 - 100
  avgMistakeFrequencyPerWeek: number;
}

export interface StrategyRecommendationDto {
  id: string;
  category: 'THRESHOLD' | 'SESSION' | 'LEVERAGE' | 'FRESHNESS' | 'SIZING';
  recommendation: string;
  targetParameter: string;
  currentValue: string;
  recommendedValue: string;
  confidenceScore: number;
  supportingEvidenceText: string;
  historicalTradeIds: string[];
}

export interface JournalIntelligenceDto {
  totalJournalEntries: number;
  dominantEmotion: string;
  emotionWinRateMap: Record<string, number>;
  confidenceAccuracyCorrelation: number;
  recurringMistakes: string[];
  keyLessonsLearned: string[];
}

export interface RiskIntelligenceDto {
  dailyRiskPercent: number;
  weeklyRiskPercent: number;
  monthlyRiskPercent: number;
  riskConsistencyScore: number; // 0 - 100
  riskDriftPercent: number;
  capitalEfficiencyPercent: number;
}
