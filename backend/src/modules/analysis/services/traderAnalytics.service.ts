import { TraderAnalyticsDto } from '@algoapp/shared';

export class TraderAnalyticsService {
  public static getTraderAnalytics(): TraderAnalyticsDto {
    return {
      weeklyProgressPercent: 1.28,
      monthlyProgressPercent: 5.85,
      quarterlyProgressPercent: 14.20,
      annualProgressPercent: 42.50,
      consistencyScore: 94.2,
      disciplineScore: 96.0,
      riskManagementScore: 98.5,
      avgMistakeFrequencyPerWeek: 0.2,
    };
  }
}
