import { ExecutionMode } from './execution.js';
import { TradingTimeframe } from './strategyProfile.js';

export interface FeeScheduleDto {
  makerFeeRate: number; // default 0.0002 (0.02%)
  takerFeeRate: number; // default 0.0005 (0.05%)
  fundingRate: number;  // default 0.0001 (0.01%)
  taxRate: number;      // default 0.0 (configurable)
}

export interface TradeAccountingCalculation {
  tradeId: string;
  grossPnL: number;
  tradingFee: number;
  fundingFee: number;
  tax: number;
  netPnL: number;
  roiPercent: number;
  marginUsed: number;
  effectiveLeverage: number;
  capitalUtilizationPercent: number;
}

export interface WalletStateDto {
  id: string;
  currentBalance: number;
  availableBalance: number;
  usedMargin: number;
  equity: number;
  realizedPnL: number;
  unrealizedPnL: number;
  grossPnL: number;
  netPnL: number;
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  peakEquity: number;
  maxDrawdownPercent: number;
  updatedAt: string;
}

export type ChallengeStatus = 'RUNNING' | 'PASSED' | 'FAILED' | 'EXPIRED';

export interface ChallengeStateDto {
  id: string;
  startDate: string;
  currentDay: number; // 1 to 20
  remainingDays: number; // 20 - currentDay
  initialBalance: number; // $50,000
  currentBalance: number;
  grossProfit: number;
  netProfit: number;
  dailyTargetPercent: number; // 0.5%
  totalTargetPercent: number; // 10.0%
  maxDailyDrawdownPercent: number; // 5.0%
  maxOverallDrawdownPercent: number; // 10.0%
  winningDays: number;
  losingDays: number;
  winStreak: number;
  lossStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  status: ChallengeStatus;
  updatedAt: string;
}

export type PositionSizingMode = 
  | 'HUNDRED_PERCENT_AVAILABLE'
  | 'PERCENTAGE_OF_BALANCE'
  | 'FIXED_AMOUNT'
  | 'RISK_BASED';

export interface PositionSizingConfig {
  mode: PositionSizingMode;
  percentageOfBalance?: number | undefined;
  fixedAmountUsd?: number | undefined;
  riskPerTradePercent?: number | undefined;
}

export interface TradeLedgerEntryDto {
  id: string;
  tradeId: string;
  exchangeOrderId: string;
  exchangeTradeId?: string | undefined;
  symbol: string;
  timeframe: TradingTimeframe;
  strategyProfileId: string;
  strategyVersion: string;
  indicatorVersion: string;
  ruleVersion: string;
  decisionVersion: string;
  executionMode: ExecutionMode;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  marginUsed: number;
  leverage: number;
  riskPercent: number;
  rewardPercent: number;
  stopLoss: number;
  takeProfit: number;
  grossPnL: number;
  tradingFee: number;
  fundingFee: number;
  tax: number;
  netPnL: number;
  durationSeconds: number;
  executionLatencyMs: number;
  decisionConfidence: number;
  decisionExplanation: string;
  resultStatus: 'WIN' | 'LOSS' | 'BREAKEVEN';
  syncStatus: 'SYNCHRONIZED' | 'SIMULATED' | 'PENDING';
  executedAt: string;
  closedAt: string;
}
