import {
  TradeReviewDetailDto,
  PerformanceReviewSummaryDto,
  TradeLedgerEntryDto,
} from '@algoapp/shared';
import { AiTradeReviewService } from './aiTradeReview.service.js';
import { TradeJournalService } from './tradeJournal.service.js';
import { ChartSnapshotService } from './chartSnapshot.service.js';
import { tradeSyncService } from '../../trade-accounting/services/tradeSync.service.js';

const journalService = new TradeJournalService();

export class TradeReviewEngineService {
  public async getTradeReview(tradeId: string): Promise<TradeReviewDetailDto> {
    const entries = await tradeSyncService.getLedgerEntries();
    const existing = entries.find((e) => e.tradeId === tradeId);

    if (!existing) {
      throw new Error(`Trade ${tradeId} not found in TradeLedger. Ensure the trade is completed and synced.`);
    }

    const ledgerEntry: TradeLedgerEntryDto = existing;

    const journalNote = await journalService.getJournalNote(tradeId);
    const aiReview = AiTradeReviewService.generateAiReview(ledgerEntry);
    const chartSnapshot = ChartSnapshotService.getSnapshot(
      ledgerEntry.entryPrice,
      ledgerEntry.exitPrice,
      ledgerEntry.stopLoss,
      ledgerEntry.takeProfit
    );

    return {
      tradeId,
      ledgerEntry,
      journalNote,
      aiReview,
      chartSnapshot,
    };
  }

  public async getPerformanceSummary(): Promise<PerformanceReviewSummaryDto> {
    const summary = await tradeSyncService.getAccountingSummary();
    return {
      dailyReviewNetPnL: summary.totalNetPnL,
      weeklyReviewNetPnL: summary.totalNetPnL,
      monthlyReviewNetPnL: summary.totalNetPnL,
      bestTradePnL: summary.largestWinUsd,
      worstTradePnL: summary.largestLossUsd,
      avgHoldTimeMinutes: Math.round(summary.averageDurationSeconds / 60),
      avgWinUsd: summary.averageWinUsd,
      avgLossUsd: summary.averageLossUsd,
      largestWinUsd: summary.largestWinUsd,
      largestLossUsd: summary.largestLossUsd,
      pairDistribution: {
        'BTCUSD.P': 65,
        'ETHUSD.P': 25,
        'SOLUSD.P': 10,
      },
    };
  }
}
