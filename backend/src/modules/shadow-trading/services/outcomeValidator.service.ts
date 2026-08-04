import { MarketOutcomeValidationDto } from '@algoapp/shared';

export class OutcomeValidatorService {
  public static validateOutcome(
    decisionId: string,
    entryPrice: number,
    highPrice: number,
    lowPrice: number,
    tpPrice: number,
    slPrice: number
  ): MarketOutcomeValidationDto {
    const tpHit = highPrice >= tpPrice;
    const slHit = lowPrice <= slPrice;

    const mfe = Number((((highPrice - entryPrice) / entryPrice) * 100).toFixed(2));
    const mae = Number((((entryPrice - lowPrice) / entryPrice) * 100).toFixed(2));

    const accuracyPercent = tpHit ? 100.0 : slHit ? 0.0 : 75.0;

    return {
      decisionId,
      tpHit,
      slHit,
      mfe,
      mae,
      holdDurationMinutes: 120,
      accuracyPercent,
    };
  }
}
