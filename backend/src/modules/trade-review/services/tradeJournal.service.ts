import { TradeJournalNoteDto } from '@algoapp/shared';

let journalNotesStore: Record<string, TradeJournalNoteDto> = {};

export class TradeJournalService {
  public async getJournalNote(tradeId: string): Promise<TradeJournalNoteDto | undefined> {
    if (!journalNotesStore[tradeId]) {
      // Return sample default note if none exists
      return {
        id: `JRN-${tradeId}`,
        tradeId,
        idea: '1H Demand Zone Retest with Liquidity Sweep',
        whyEntered: 'Strong bullish engulfing candle following PAT Order Block mitigation.',
        whyExited: 'Take Profit hit at supply zone boundary target.',
        mistakes: 'None observed. Followed trade plan strictly.',
        lessons: 'Patience at demand zone boundaries improves win rate.',
        emotion: 'CALM',
        confidenceBefore: 9,
        confidenceAfter: 10,
        improvementNotes: 'Continue using strict stop-loss rules.',
        tags: ['DEMAND_ZONE', 'SMC_SWEEP', 'WINNER'],
        isFavorite: true,
        updatedAt: new Date().toISOString(),
      };
    }
    return journalNotesStore[tradeId];
  }

  public async saveJournalNote(tradeId: string, input: Partial<TradeJournalNoteDto>): Promise<TradeJournalNoteDto> {
    const existing = await this.getJournalNote(tradeId);

    const updated: TradeJournalNoteDto = {
      id: existing?.id || `JRN-${tradeId}`,
      tradeId,
      idea: input.idea ?? existing?.idea ?? '',
      whyEntered: input.whyEntered ?? existing?.whyEntered ?? '',
      whyExited: input.whyExited ?? existing?.whyExited ?? '',
      mistakes: input.mistakes ?? existing?.mistakes ?? '',
      lessons: input.lessons ?? existing?.lessons ?? '',
      emotion: input.emotion ?? existing?.emotion ?? 'CALM',
      confidenceBefore: input.confidenceBefore ?? existing?.confidenceBefore ?? 8,
      confidenceAfter: input.confidenceAfter ?? existing?.confidenceAfter ?? 8,
      improvementNotes: input.improvementNotes ?? existing?.improvementNotes ?? '',
      tags: input.tags ?? existing?.tags ?? ['TRADE_REVIEW'],
      isFavorite: input.isFavorite ?? existing?.isFavorite ?? false,
      updatedAt: new Date().toISOString(),
    };

    journalNotesStore[tradeId] = updated;
    return updated;
  }
}
