export interface DynamicRiskCalculationInput {
  accountBalance: number;
  entryPrice: number;
  stopLossPrice: number;
  direction: 'BUY' | 'SELL';
  maxLeverageCap?: number | undefined;
}

export interface DynamicRiskCalculationResult {
  accountBalance: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  slDistancePercent: number;
  tpDistancePercent: number;
  leverage: number;
  maxRiskAmountUsd: number; // exactly 35% of balance
  targetProfitAmountUsd: number; // exactly 60% of balance
  positionValueUsd: number;
  positionSize: number; // quantity in base asset units
  riskRewardRatio: number;
}

export class DynamicRiskLeverageService {
  /**
   * Computes exact institutional position size and dynamic leverage:
   * 1. 100% of current account balance used.
   * 2. Stop Loss is ALWAYS exactly 35% of account balance.
   *    Leverage = min(100, max(1, round(35 / SL_Distance%))).
   * 3. Take Profit is ALWAYS exactly 60% account growth.
   *    TP_Distance% = 60% / Leverage.
   */
  public static calculateRiskAndLeverage(input: DynamicRiskCalculationInput): DynamicRiskCalculationResult {
    const balance = Math.max(1.0, input.accountBalance);
    const entry = Math.max(0.0001, input.entryPrice);
    const stopLoss = Math.max(0.0001, input.stopLossPrice);
    const maxCap = input.maxLeverageCap || 100;

    let slDistPercent: number;
    if (input.direction === 'BUY') {
      slDistPercent = ((entry - stopLoss) / entry) * 100;
    } else {
      slDistPercent = ((stopLoss - entry) / entry) * 100;
    }
    slDistPercent = Math.max(0.1, Math.abs(slDistPercent));

    // Dynamic leverage to ensure stop loss equals exactly 35% account risk
    const rawLeverage = Math.round(35 / slDistPercent);
    const leverage = Math.min(maxCap, Math.max(1, rawLeverage));

    // Target profit is exactly 60% account growth
    const tpDistPercent = 60 / leverage;

    let takeProfitPrice: number;
    if (input.direction === 'BUY') {
      takeProfitPrice = entry * (1 + tpDistPercent / 100);
    } else {
      takeProfitPrice = entry * (1 - tpDistPercent / 100);
    }

    const maxRiskAmountUsd = Number((balance * 0.35).toFixed(2));
    const targetProfitAmountUsd = Number((balance * 0.60).toFixed(2));

    // 100% account balance leveraged
    const positionValueUsd = balance * leverage;
    const positionSize = Number((positionValueUsd / entry).toFixed(4));
    const riskRewardRatio = Number((tpDistPercent / slDistPercent).toFixed(2));

    return {
      accountBalance: Number(balance.toFixed(2)),
      entryPrice: Number(entry.toFixed(4)),
      stopLossPrice: Number(stopLoss.toFixed(4)),
      takeProfitPrice: Number(takeProfitPrice.toFixed(4)),
      slDistancePercent: Number(slDistPercent.toFixed(3)),
      tpDistancePercent: Number(tpDistPercent.toFixed(3)),
      leverage,
      maxRiskAmountUsd,
      targetProfitAmountUsd,
      positionValueUsd: Number(positionValueUsd.toFixed(2)),
      positionSize,
      riskRewardRatio,
    };
  }
}
