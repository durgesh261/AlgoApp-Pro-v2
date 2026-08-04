import { JournalIntelligenceDto } from '@algoapp/shared';

export class JournalIntelligenceService {
  public static getJournalIntelligence(): JournalIntelligenceDto {
    return {
      totalJournalEntries: 18,
      dominantEmotion: 'CALM_CONFIDENT',
      emotionWinRateMap: {
        CALM_CONFIDENT: 84.6,
        NEUTRAL: 75.0,
        ANXIOUS_FOMO: 33.3,
      },
      confidenceAccuracyCorrelation: 0.94,
      recurringMistakes: [
        'Moving stop-loss to breakeven prematurely before initial 1:1 RR target touched.',
        'Entering second-touch zone without waiting for 15M CHoCH micro-confirmation.',
      ],
      keyLessonsLearned: [
        'High-confidence NY Open trades produce maximum risk-reward capture.',
        'Restricting daily risk to 1.5% prevents emotional compounding during drawdowns.',
      ],
    };
  }
}
