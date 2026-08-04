import { TradingTimeframe } from './strategyProfile.js';

export interface ParameterSweepInput {
  symbol: string;
  timeframe: TradingTimeframe;
  strategyProfileId: string;
  patLenRange: number[];         // e.g. [5, 9, 14]
  liquidityLenRange: number[];   // e.g. [15, 30, 45]
  mergeThresholdRange: number[]; // e.g. [0.005, 0.01, 0.02]
  minConfidenceRange: number[];  // e.g. [60, 75, 90]
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePercent: number;
  grossPnL: number;
  tradingFees: number;
  netPnL: number;
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPercent: number;
  avgHoldTimeMinutes: number;
}

export interface WalkForwardConfig {
  trainingRatio: number;      // default 0.6 (60%)
  validationRatio: number;    // default 0.2 (20%)
  outOfSampleRatio: number;   // default 0.2 (20%)
}

export interface WalkForwardResult {
  trainingPerformance: PerformanceMetrics;
  validationPerformance: PerformanceMetrics;
  outOfSamplePerformance: PerformanceMetrics;
  robustnessScore: number; // 0 to 100
}

export interface MonteCarloConfig {
  iterations: number;     // default 1000
  confidenceLevel: number;// default 95 (95%)
}

export interface MonteCarloResult {
  iterations: number;
  expectedReturnUsd: number;
  worstDrawdownPercent: number;
  probabilityOfRuinPercent: number;
  confidenceIntervalLowerUsd: number;
  confidenceIntervalUpperUsd: number;
  avgRecoveryTimeDays: number;
}

export interface OptimizationRunResult {
  id: string;
  symbol: string;
  timeframe: TradingTimeframe;
  strategyProfileId: string;
  strategyProfileName: string;
  parameters: {
    zigzagLen: number;
    liquidityLen: number;
    mergeThreshold: number;
    minConfidence: number;
    riskPerTradePercent: number;
  };
  metrics: PerformanceMetrics;
  walkForward: WalkForwardResult;
  monteCarlo: MonteCarloResult;
  createdAt: string;
}
