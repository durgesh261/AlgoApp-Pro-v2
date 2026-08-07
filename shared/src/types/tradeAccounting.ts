import { ExecutionMode } from './execution.js';
import { TradingTimeframe } from './strategyProfile.js';

export interface FeeScheduleDto {
  makerFeeRate: number; // default 0.0002 (0.02% / 2 bps) - Delta Exchange India Standard
  takerFeeRate: number; // default 0.0005 (0.05% / 5 bps) - Delta Exchange India Standard
  gstRate: number;      // default 0.18 (18% GST on trading fees and regulatory charges)
  fundingRate: number;  // default 0.0001 (0.01% / 1 bp per interval)
  taxRate: number;      // default 0.30 (30% flat STCG / Business income tax on net crypto gains)
  tdsRate?: number | undefined; // 0.0 for Futures/Derivatives (1% only on Spot VDA transfer)
  liquidationFeeRate?: number | undefined; // default 0.005 (0.50%)
}

export interface SlippageDetails {
  expectedEntryPrice?: number | undefined;
  actualEntryPrice: number;
  entrySlippage: number;
  entrySlippagePercent: number;
  expectedExitPrice?: number | undefined;
  actualExitPrice: number;
  exitSlippage: number;
  exitSlippagePercent: number;
  totalSlippage: number;
  totalSlippagePercent: number;
}

export interface RiskRewardDetails {
  initialRiskUsd: number;
  initialRiskPercent: number;
  plannedRewardUsd: number;
  plannedRewardPercent: number;
  plannedRR: number;
  actualRewardUsd: number;
  actualRR: number;
}

export interface TradeFeeBreakdown {
  openingFee: number;
  closingFee: number;
  baseTradingFee: number;
  tradingFee: number; // Total trading fee including GST
  gstRate: number; // 0.18
  gstOnFees: number; // 18% GST applied to exchange fees
  fundingFee: number;
  liquidationFee: number;
  totalFees: number;
  isEntryMaker: boolean;
  isExitMaker: boolean;
}

export interface TaxBreakdown {
  grossTaxableGain: number;
  taxRate: number;
  stcgTax: number;
  tdsRate: number;
  tdsAmount: number;
  isTdsApplicable: boolean; // false for Delta India Futures & Options
  lossOffsettingAllowed: boolean; // true for Delta India Futures & Options
  taxRegime: 'DERIVATIVES_FUTURES_SPECULATIVE' | 'SPOT_VDA_115BBH';
  totalTax: number;
}

export interface TradeAccountingCalculation {
  tradeId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  notionalValue: number;
  exitNotionalValue: number;
  leverage: number;
  marginUsed: number;
  grossPnL: number;
  feeBreakdown: TradeFeeBreakdown;
  taxBreakdown: TaxBreakdown;
  tradingFee: number;
  gstOnFees: number;
  fundingFee: number;
  tax: number;
  netPnL: number;
  roiPercent: number;
  effectiveLeverage: number;
  capitalUtilizationPercent: number;
  slippage: SlippageDetails;
  riskReward: RiskRewardDetails;
  resultStatus: 'WIN' | 'LOSS' | 'BREAKEVEN';
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
  initialBalance: number; // $10.00
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

export interface ResetChallengeInput {
  initialBalance?: number;
  dailyTargetPercent?: number;
  totalTargetPercent?: number;
  maxDailyDrawdownPercent?: number;
  maxOverallDrawdownPercent?: number;
  minimumTradingDays?: number;
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

export interface TradeExecutionTimelineItem {
  stage:
    | 'SIGNAL_GENERATED'
    | 'ORDER_SUBMITTED'
    | 'ORDER_ACCEPTED'
    | 'ORDER_FILLED'
    | 'POSITION_OPENED'
    | 'POSITION_MODIFIED'
    | 'POSITION_CLOSED'
    | 'ACCOUNTING_COMPLETED'
    | 'REVIEW_CREATED';
  timestamp: string;
  latencyMs?: number | undefined;
  details: string;
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
  expectedEntryPrice?: number | undefined;
  expectedExitPrice?: number | undefined;
  entrySlippage?: number | undefined;
  exitSlippage?: number | undefined;
  totalSlippage?: number | undefined;
  quantity: number;
  notionalValue: number;
  marginUsed: number;
  leverage: number;
  riskPercent: number;
  rewardPercent: number;
  plannedRR?: number | undefined;
  actualRR?: number | undefined;
  stopLoss: number;
  takeProfit: number;
  grossPnL: number;
  baseTradingFee?: number | undefined;
  tradingFee: number;
  gstOnFees?: number | undefined;
  openingFee?: number | undefined;
  closingFee?: number | undefined;
  fundingFee: number;
  tax: number;
  stcgTax?: number | undefined;
  tdsAmount?: number | undefined;
  isTdsApplicable?: boolean | undefined;
  lossOffsettingAllowed?: boolean | undefined;
  netPnL: number;
  roiPercent?: number | undefined;
  capitalUtilizationPercent?: number | undefined;
  durationSeconds: number;
  durationFormatted?: string | undefined;
  executionLatencyMs: number;
  decisionConfidence: number;
  decisionExplanation: string;
  resultStatus: 'WIN' | 'LOSS' | 'BREAKEVEN';
  syncStatus: 'SYNCHRONIZED' | 'SIMULATED' | 'RECONCILED' | 'PENDING';
  timeline?: TradeExecutionTimelineItem[] | undefined;
  auditTrailJson?: string | undefined;
  executedAt: string;
  closedAt: string;
}

export interface TradeLedgerFilterDto {
  symbol?: string | undefined;
  timeframe?: string | undefined;
  executionMode?: ExecutionMode | undefined;
  side?: 'LONG' | 'SHORT' | undefined;
  resultStatus?: 'WIN' | 'LOSS' | 'BREAKEVEN' | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  strategyProfileId?: string | undefined;
  minPnL?: number | undefined;
  maxPnL?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface TradeAccountingSummaryDto {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRatePercent: number;
  lossRatePercent: number;
  profitFactor: number;
  totalGrossPnL: number;
  totalTradingFees: number;
  totalGstOnFees: number;
  totalFundingFees: number;
  totalTaxes: number;
  totalNetPnL: number;
  averageWinUsd: number;
  averageLossUsd: number;
  largestWinUsd: number;
  largestLossUsd: number;
  averageRR: number;
  averageDurationSeconds: number;
  totalVolumeUsd: number;
  totalSlippageUsd: number;
  netRoiPercent: number;
  updatedAt: string;
}

export interface TradeLedgerReconciliationReportDto {
  status: 'MATCHED' | 'DISCREPANCY_DETECTED';
  reconciledAt: string;
  totalLedgerTrades: number;
  totalDeltaTrades: number;
  mismatchesCount: number;
  mismatches: Array<{
    tradeId: string;
    field: string;
    ledgerValue: any;
    deltaValue: any;
    discrepancyUsd: number;
  }>;
}
