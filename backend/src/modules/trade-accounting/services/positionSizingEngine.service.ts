import { PositionSizingConfig } from '@algoapp/shared';

export class PositionSizingEngineService {
  public static calculatePositionQuantity(
    availableBalance: number,
    entryPrice: number,
    stopLossPrice?: number,
    leverage: number = 10,
    config: PositionSizingConfig = { mode: 'HUNDRED_PERCENT_AVAILABLE' }
  ): { quantity: number; marginUsed: number; notionalValue: number } {
    let capitalToAllocate = availableBalance;

    switch (config.mode) {
      case 'PERCENTAGE_OF_BALANCE': {
        const pct = config.percentageOfBalance ?? 100.0;
        capitalToAllocate = (availableBalance * (pct / 100.0));
        break;
      }
      case 'FIXED_AMOUNT': {
        capitalToAllocate = Math.min(availableBalance, config.fixedAmountUsd ?? 10000.0);
        break;
      }
      case 'RISK_BASED': {
        if (stopLossPrice && stopLossPrice > 0 && entryPrice !== stopLossPrice) {
          const riskPct = config.riskPerTradePercent ?? 1.5;
          const maxRiskUsd = availableBalance * (riskPct / 100.0);
          const priceDistancePct = Math.abs(entryPrice - stopLossPrice) / entryPrice;
          if (priceDistancePct > 0) {
            const requiredNotional = maxRiskUsd / priceDistancePct;
            capitalToAllocate = Math.min(availableBalance, requiredNotional / leverage);
          }
        }
        break;
      }
      case 'HUNDRED_PERCENT_AVAILABLE':
      default:
        capitalToAllocate = availableBalance;
        break;
    }

    const notionalValue = capitalToAllocate * leverage;
    const rawQuantity = entryPrice > 0 ? notionalValue / entryPrice : 0;
    const quantity = Number(rawQuantity.toFixed(4));
    const marginUsed = Number(capitalToAllocate.toFixed(2));

    return {
      quantity,
      marginUsed,
      notionalValue: Number(notionalValue.toFixed(2)),
    };
  }
}
