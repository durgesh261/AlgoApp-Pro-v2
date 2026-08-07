import { AppEventBus } from '../../realtime-operations/services/appEventBus.service.js';
import { TradeLedgerEntryDto } from '@algoapp/shared';
import { prisma } from '../../../db.js';

export class JournalAutomationService {
  public static initialize(): void {
    AppEventBus.subscribe('TRADE_ACCOUNTING_RECORDED', async (ledgerEntry: TradeLedgerEntryDto) => {
      try {
        await this.createAutomatedJournalEntry(ledgerEntry);
      } catch (err) {
        console.error('[JournalAutomationService] Failed to auto-generate journal:', err);
      }
    });
  }

  private static async createAutomatedJournalEntry(trade: TradeLedgerEntryDto): Promise<void> {
    if (!prisma.tradeJournalNote) return;

    await prisma.tradeJournalNote.upsert({
      where: { tradeId: trade.tradeId },
      create: {
        tradeId: trade.tradeId,
        idea: `Automated journal entry for ${trade.symbol} ${trade.side} trade.`,
        whyEntered: trade.decisionExplanation || 'Signal criteria met.',
        whyExited: trade.resultStatus === 'WIN' ? 'Take profit hit or trend exhausted.' : 'Stop loss triggered.',
        mistakes: '',
        lessons: '',
        emotion: 'CALM',
        confidenceBefore: trade.decisionConfidence ? Math.round(trade.decisionConfidence / 10) : 8,
        confidenceAfter: 8,
        improvementNotes: '',
        tagsJson: JSON.stringify([trade.symbol, trade.timeframe, trade.resultStatus]),
      },
      update: {
        // Do not overwrite user modifications if it already exists, just update tags perhaps
        tagsJson: JSON.stringify([trade.symbol, trade.timeframe, trade.resultStatus]),
      },
    });

    console.log(`[JournalAutomationService] Auto-generated journal note for ${trade.tradeId}`);
  }
}
