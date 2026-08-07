import { DecisionReasonCode, RiskValidationResultDto } from '@algoapp/shared';

export interface RiskValidatorInput {
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  accountBalance: number;
  availableMargin: number;
  estimatedMarginRequired: number;
  dailyLossUsed?: number | undefined;
  maxDailyLoss?: number | undefined;
  currentDrawdownPct?: number | undefined;
  maxDrawdownPct?: number | undefined;
  openPositionCount?: number | undefined;
  maxOpenPositions?: number | undefined;
  minRiskRewardRatio?: number | undefined;
}

export class RiskValidator {
  /**
   * Deterministically validates trade setup against account risk rules & challenge limits.
   */
  public static validate(input: RiskValidatorInput): RiskValidationResultDto {
    const reasonCodes: DecisionReasonCode[] = [];
    let passed = true;

    // 1. Calculate Risk to Reward
    const riskDistance = Math.abs(input.entryPrice - input.stopLossPrice);
    const rewardDistance = Math.abs(input.takeProfitPrice - input.entryPrice);
    const riskRewardRatio =
      riskDistance > 0 ? Number((rewardDistance / riskDistance).toFixed(2)) : 0;

    const minRR = input.minRiskRewardRatio ?? 2.0;
    if (riskRewardRatio < minRR) {
      passed = false;
      reasonCodes.push(DecisionReasonCode.RR_BELOW_MINIMUM);
    }

    // 2. Check Daily Loss Limit
    const dailyLossUsed = input.dailyLossUsed ?? 0;
    const maxDailyLoss = input.maxDailyLoss ?? 1000.0;
    if (dailyLossUsed >= maxDailyLoss) {
      passed = false;
      reasonCodes.push(DecisionReasonCode.DAILY_LOSS_LIMIT_REACHED);
    }

    // 3. Check Max Drawdown Limit
    const currentDrawdownPct = input.currentDrawdownPct ?? 0;
    const maxDrawdownPct = input.maxDrawdownPct ?? 5.0;
    if (currentDrawdownPct >= maxDrawdownPct) {
      passed = false;
      reasonCodes.push(DecisionReasonCode.MAX_DRAWDOWN_EXCEEDED);
    }

    // 4. Check Max Open Positions Limit
    const openPositionCount = input.openPositionCount ?? 0;
    const maxOpenPositions = input.maxOpenPositions ?? 5;
    if (openPositionCount >= maxOpenPositions) {
      passed = false;
      reasonCodes.push(DecisionReasonCode.MAX_POSITIONS_REACHED);
    }

    // 5. Check Available Margin
    if (input.estimatedMarginRequired > input.availableMargin) {
      passed = false;
      reasonCodes.push(DecisionReasonCode.INSUFFICIENT_MARGIN);
    }

    return {
      passed,
      riskRewardRatio,
      dailyLossUsed,
      maxDailyLoss,
      currentDrawdownPct,
      maxDrawdownPct,
      openPositionCount,
      maxOpenPositions,
      availableMargin: input.availableMargin,
      reasonCodes,
    };
  }
}
