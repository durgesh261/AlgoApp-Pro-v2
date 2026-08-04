import { RiskIntelligenceDto } from '@algoapp/shared';

export class RiskIntelligenceService {
  public static getRiskIntelligence(): RiskIntelligenceDto {
    return {
      dailyRiskPercent: 1.5,
      weeklyRiskPercent: 3.5,
      monthlyRiskPercent: 6.0,
      riskConsistencyScore: 98.5,
      riskDriftPercent: 0.2,
      capitalEfficiencyPercent: 88.4,
    };
  }
}
