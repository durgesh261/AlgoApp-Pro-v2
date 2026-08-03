import {
  TradeReviewDetailDto,
  PerformanceReviewSummaryDto,
  TradeLedgerEntryDto,
  ExecutionMode,
} from '@algoapp/shared';
import { AiTradeReviewService } from './aiTradeReview.service.js';
import { TradeJournalService } from './tradeJournal.service.js';
import { ChartSnapshotService } from './chartSnapshot.service.js';

const journalService = new TradeJournalService();

export class TradeReviewEngineService {
  public async getTradeReview(tradeId: string): Promise<TradeReviewDetailDto> {
    const sampleLedgerEntry: TradeLedgerEntryDto = {
      id: `LDG-${tradeId}`,
      tradeId,
      exchangeOrderId: `ORD-${tradeId}`,
      exchangeTradeId: `EX-${tradeId}`,
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      strategyProfileId: 'DEF-1H-PROF',
      strategyVersion: '1.0.0',
      indicatorVersion: '1.0.0',
      ruleVersion: '1.0.0',
      decisionVersion: '1.0.0',
      executionMode: ExecutionMode.PAPER,
      side: 'LONG',
      entryPrice: 63850.0,
      exitPrice: 65200.0,
      quantity: 0.5,
      marginUsed: 3192.5,
      leverage: 10,
      riskPercent: 1.5,
      rewardPercent: 3.0,
      stopLoss: 63250.0,
      takeProfit: 65800.0,
      grossPnL: 675.0,
      tradingFee: 32.26,
      fundingFee: 3.19,
      tax: 0.0,
      netPnL: 639.55,
      durationSeconds: 3600,
      executionLatencyMs: 14.2,
      decisionConfidence: 94.5,
      decisionExplanation: 'Confirmed SMC demand zone retest with PAT liquidity sweep.',
      resultStatus: 'WIN',
      syncStatus: 'SIMULATED',
      executedAt: new Date(Date.now() - 3600000).toISOString(),
      closedAt: new Date().toISOString(),
    };

    const journalNote = await journalService.getJournalNote(tradeId);
    const aiReview = AiTradeReviewService.generateAiReview(sampleLedgerEntry);
    const chartSnapshot = ChartSnapshotService.getSnapshot(
      sampleLedgerEntry.entryPrice,
      sampleLedgerEntry.exitPrice,
      sampleLedgerEntry.stopLoss,
      sampleLedgerEntry.takeProfit
    );

    return {
      tradeId,
      ledgerEntry: sampleLedgerEntry,
      journalNote,
      aiReview,
      chartSnapshot,
    };
  }

  public async getPerformanceSummary(): Promise<PerformanceReviewSummaryDto> {
    return {
      dailyReviewNetPnL: 639.55,
      weeklyReviewNetPnL: 2840.12,
      monthlyReviewNetPnL: 5120.45,
      bestTradePnL: 1250.0,
      worstTradePnL: -320.0,
      avgHoldTimeMinutes: 180,
      avgWinUsd: 540.0,
      avgLossUsd: -220.0,
      largestWinUsd: 1250.0,
      largestLossUsd: -320.0,
      pairDistribution: {
        'BTCUSD.P': 65,
        'ETHUSD.P': 25,
        'SOLUSD.P': 10,
      },
    };
  }
}
