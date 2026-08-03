import { FeeScheduleDto, TradeAccountingCalculation } from '@algoapp/shared';

const defaultFeeSchedule: FeeScheduleDto = {
  makerFeeRate: 0.0002, // 0.02%
  takerFeeRate: 0.0005, // 0.05%
  fundingRate: 0.0001,  // 0.01%
  taxRate: 0.0,         // Configurable
};

export class TradeAccountingService {
  public static calculateAccounting(
    tradeId: string,
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    leverage: number,
    side: 'LONG' | 'SHORT',
    isMaker: boolean = false,
    feeScheduleInput?: Partial<FeeScheduleDto>
  ): TradeAccountingCalculation {
    const feeSchedule: FeeScheduleDto = { ...defaultFeeSchedule, ...feeScheduleInput };
    const notionalValue = quantity * entryPrice;

    const grossPnL =
      side === 'LONG'
        ? (exitPrice - entryPrice) * quantity
        : (entryPrice - exitPrice) * quantity;

    const feeRate = isMaker ? feeSchedule.makerFeeRate : feeSchedule.takerFeeRate;
    const entryFee = entryPrice * quantity * feeRate;
    const exitFee = exitPrice * quantity * feeRate;
    const tradingFee = Number((entryFee + exitFee).toFixed(2));

    const fundingFee = Number((notionalValue * feeSchedule.fundingRate).toFixed(2));
    const taxablePnL = Math.max(0, grossPnL - tradingFee - fundingFee);
    const tax = Number((taxablePnL * feeSchedule.taxRate).toFixed(2));

    const netPnL = Number((grossPnL - tradingFee - fundingFee - tax).toFixed(2));

    const marginUsed = leverage > 0 ? Number((notionalValue / leverage).toFixed(2)) : notionalValue;
    const roiPercent = marginUsed > 0 ? Number(((netPnL / marginUsed) * 100).toFixed(2)) : 0;
    const effectiveLeverage = leverage;
    const capitalUtilizationPercent = marginUsed > 0 ? Number(((marginUsed / 50000.0) * 100).toFixed(1)) : 0;

    return {
      tradeId,
      grossPnL: Number(grossPnL.toFixed(2)),
      tradingFee,
      fundingFee,
      tax,
      netPnL,
      roiPercent,
      marginUsed,
      effectiveLeverage,
      capitalUtilizationPercent,
    };
  }
}
