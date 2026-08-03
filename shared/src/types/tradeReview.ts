import { TradeLedgerEntryDto } from './tradeAccounting.js';

export interface TradeJournalNoteDto {
  id: string;
  tradeId: string;
  idea: string;
  whyEntered: string;
  whyExited: string;
  mistakes: string;
  lessons: string;
  emotion: 'CALM' | 'ANXIOUS' | 'CONFIDENT' | 'FOMO' | 'DISCIPLINED';
  confidenceBefore: number; // 1 - 10
  confidenceAfter: number;  // 1 - 10
  improvementNotes: string;
  tags: string[];
  isFavorite: boolean;
  updatedAt: string;
}

export interface AiTradeReviewDto {
  tradeSummary: string;
  decisionSummary: string;
  strengths: string[];
  weaknesses: string[];
  riskAnalysis: string;
  challengeImpact: string;
  alternativeOutcome: string;
  improvementSuggestions: string[];
}

export interface TradeChartSnapshotDto {
  entryPrice: number;
  exitPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  supplyZoneRange: string;
  demandZoneRange: string;
}

export interface TradeReviewDetailDto {
  tradeId: string;
  ledgerEntry: TradeLedgerEntryDto;
  journalNote?: TradeJournalNoteDto | undefined;
  aiReview: AiTradeReviewDto;
  chartSnapshot: TradeChartSnapshotDto;
}

export interface PerformanceReviewSummaryDto {
  dailyReviewNetPnL: number;
  weeklyReviewNetPnL: number;
  monthlyReviewNetPnL: number;
  bestTradePnL: number;
  worstTradePnL: number;
  avgHoldTimeMinutes: number;
  avgWinUsd: number;
  avgLossUsd: number;
  largestWinUsd: number;
  largestLossUsd: number;
  pairDistribution: Record<string, number>;
}
