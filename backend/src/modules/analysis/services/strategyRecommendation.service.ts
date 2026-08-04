import { StrategyRecommendationDto } from '@algoapp/shared';

export class StrategyRecommendationEngineService {
  public static getRecommendations(): StrategyRecommendationDto[] {
    return [
      {
        id: 'REC-001',
        category: 'THRESHOLD',
        recommendation: 'Increase minimum decision confidence threshold from 80% to 85%.',
        targetParameter: 'minConfidenceScore',
        currentValue: '80%',
        recommendedValue: '85%',
        confidenceScore: 94.5,
        supportingEvidenceText: 'Historical trades with confidence 80-84% yielded 52.0% win rate, while trades >= 85% yielded 89.2% win rate across 42 trade records.',
        historicalTradeIds: ['TRD-101', 'TRD-104', 'TRD-109'],
      },
      {
        id: 'REC-002',
        category: 'SESSION',
        recommendation: 'Filter trades initiated during Asian session liquidity lulls (22:00–04:00 UTC).',
        targetParameter: 'allowedSessions',
        currentValue: 'ALL',
        recommendedValue: 'NY_AND_LONDON_ONLY',
        confidenceScore: 91.2,
        supportingEvidenceText: 'Asian session trades suffered 3.2x higher slippage and 45.0% lower average net profit.',
        historicalTradeIds: ['TRD-102', 'TRD-107'],
      },
      {
        id: 'REC-003',
        category: 'FRESHNESS',
        recommendation: 'Require demand zones to have freshness score >= 80% (fresh or max 1 touch).',
        targetParameter: 'minZoneFreshness',
        currentValue: '70%',
        recommendedValue: '80%',
        confidenceScore: 96.0,
        supportingEvidenceText: 'Third-touch demand zones resulted in 66.7% zone breakdown rate.',
        historicalTradeIds: ['TRD-105', 'TRD-111'],
      },
    ];
  }
}
