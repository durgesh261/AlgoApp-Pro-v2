import { CalculateLeverageInput, LeverageOutputDto } from '@algoapp/shared';

export class DynamicLeverageEvaluator {
  public static calculateLeverage(input: CalculateLeverageInput): LeverageOutputDto {
    const { entryPrice, stopLossPrice, riskPercent, maxLeverage = 50 } = input;

    const stopLossDistancePercent = (Math.abs(entryPrice - stopLossPrice) / entryPrice) * 100;
    if (stopLossDistancePercent <= 0) {
      return {
        recommendedLeverage: 1.0,
        stopLossDistancePercent: 0.0,
        riskPercent,
        boundedByMax: false,
      };
    }

    const rawLeverage = riskPercent / stopLossDistancePercent;
    const roundedLeverage = Math.round(rawLeverage * 10) / 10;

    let finalLeverage = Math.max(1.0, roundedLeverage);
    let boundedByMax = false;

    if (finalLeverage > maxLeverage) {
      finalLeverage = maxLeverage;
      boundedByMax = true;
    }

    return {
      recommendedLeverage: finalLeverage,
      stopLossDistancePercent: Math.round(stopLossDistancePercent * 100) / 100,
      riskPercent,
      boundedByMax,
    };
  }
}
