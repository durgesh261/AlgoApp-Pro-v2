import {
  FeeScheduleDto,
  RiskRewardDetails,
  SlippageDetails,
  TaxBreakdown,
  TradeAccountingCalculation,
  TradeFeeBreakdown,
} from '@algoapp/shared';

export const DEFAULT_DELTA_FEE_SCHEDULE: FeeScheduleDto = {
  makerFeeRate: 0.0002, // 0.02% (2 bps) - Delta Exchange India Standard Maker Fee
  takerFeeRate: 0.0005, // 0.05% (5 bps) - Delta Exchange India Standard Taker Fee
  gstRate: 0.18,        // 18% GST on exchange fees as per Indian GST regulations for Delta Exchange India
  fundingRate: 0.0001,  // 0.01% (1 bp) per funding interval (cash-settled)
  taxRate: 0.30,        // 30% flat tax on net crypto trading profits (derivatives business income / STCG)
  tdsRate: 0.0,         // 0% TDS for Futures/Options (1% Section 194S TDS applies ONLY to Spot VDA transfers)
  liquidationFeeRate: 0.005, // 0.50% liquidation maintenance penalty
};

export interface CalculateAccountingParams {
  tradeId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  leverage: number;
  isEntryMaker?: boolean | undefined;
  isExitMaker?: boolean | undefined;
  expectedEntryPrice?: number | undefined;
  expectedExitPrice?: number | undefined;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  actualFundingFee?: number | undefined;
  isLiquidated?: boolean | undefined;
  walletEquity?: number | undefined;
  feeSchedule?: Partial<FeeScheduleDto> | undefined;
}

export class TradeAccountingService {
  /**
   * Deterministic institutional accounting calculation compliant with Delta Exchange India Fee and Taxation Guidelines.
   * 
   * Highlights:
   * 1. Multi-leg maker (0.02%) vs taker (0.05%) fee calculation.
   * 2. Mandatory 18% GST applied to all exchange trading and liquidation service charges.
   * 3. 0% TDS for cash-settled Futures and Options (as confirmed by Delta Exchange India regulatory guide).
   * 4. Full deductibility of exchange fees & GST from Gross PnL prior to tax computation.
   * 5. True net take-home PnL after all trading fees, GST, funding rates, and taxes.
   */
  public static calculateAccounting(params: CalculateAccountingParams): TradeAccountingCalculation {
    const {
      tradeId,
      symbol,
      side,
      entryPrice,
      exitPrice,
      quantity,
      leverage,
      isEntryMaker = false,
      isExitMaker = false,
      expectedEntryPrice,
      expectedExitPrice,
      stopLoss,
      takeProfit,
      actualFundingFee,
      isLiquidated = false,
      walletEquity = 10.0,
      feeSchedule: feeScheduleInput,
    } = params;

    const schedule: FeeScheduleDto = { ...DEFAULT_DELTA_FEE_SCHEDULE, ...feeScheduleInput };

    const notionalValue = Number((entryPrice * quantity).toFixed(4));
    const exitNotionalValue = Number((exitPrice * quantity).toFixed(4));

    // 1. Exact Gross PnL Calculation
    const grossPnL = Number(
      (side === 'LONG'
        ? (exitPrice - entryPrice) * quantity
        : (entryPrice - exitPrice) * quantity
      ).toFixed(4)
    );

    // 2. Fee Calculation (Multi-Leg: Maker vs Taker + 18% GST)
    const entryFeeRate = isEntryMaker ? schedule.makerFeeRate : schedule.takerFeeRate;
    const exitFeeRate = isExitMaker ? schedule.makerFeeRate : schedule.takerFeeRate;

    const openingFee = Number((notionalValue * entryFeeRate).toFixed(4));
    const closingFee = Number((exitNotionalValue * exitFeeRate).toFixed(4));
    const baseTradingFee = Number((openingFee + closingFee).toFixed(4));

    // 18% GST on trading fees as per Delta Exchange India
    const gstRate = schedule.gstRate ?? 0.18;
    const gstOnFees = Number((baseTradingFee * gstRate).toFixed(4));
    const tradingFee = Number((baseTradingFee + gstOnFees).toFixed(4));

    // Funding Fee (actual cash flow or proportional to interval)
    const fundingFee =
      actualFundingFee !== undefined
        ? Number(actualFundingFee.toFixed(4))
        : Number((notionalValue * schedule.fundingRate).toFixed(4));

    // Liquidation Fee if triggered (+ 18% GST on liquidation fee)
    const baseLiquidationFee = isLiquidated
      ? Number((notionalValue * (schedule.liquidationFeeRate ?? 0.005)).toFixed(4))
      : 0;
    const gstOnLiquidation = Number((baseLiquidationFee * gstRate).toFixed(4));
    const liquidationFee = Number((baseLiquidationFee + gstOnLiquidation).toFixed(4));

    const totalFees = Number((tradingFee + fundingFee + liquidationFee).toFixed(4));

    const feeBreakdown: TradeFeeBreakdown = {
      openingFee,
      closingFee,
      baseTradingFee,
      tradingFee,
      gstRate,
      gstOnFees,
      fundingFee,
      liquidationFee,
      totalFees,
      isEntryMaker,
      isExitMaker,
    };

    // 3. Indian Tax Engine for Delta Exchange India Futures
    // Note: 1% TDS is NOT applicable on Crypto Futures on Delta Exchange India
    const isTdsApplicable = false; // Always false for Delta India Futures & Options
    const tdsRate = schedule.tdsRate ?? 0.0;
    const tdsAmount = isTdsApplicable && tdsRate > 0
      ? Number((exitNotionalValue * tdsRate).toFixed(4))
      : 0;

    // Expenses & GST are fully deductible from Gross PnL on derivatives contracts
    const grossTaxableGain = Math.max(0, Number((grossPnL - totalFees).toFixed(4)));
    const stcgTax = Number((grossTaxableGain * schedule.taxRate).toFixed(4));
    const totalTax = Number((stcgTax + tdsAmount).toFixed(4));

    const taxBreakdown: TaxBreakdown = {
      grossTaxableGain,
      taxRate: schedule.taxRate,
      stcgTax,
      tdsRate,
      tdsAmount,
      isTdsApplicable,
      lossOffsettingAllowed: true,
      taxRegime: 'DERIVATIVES_FUTURES_SPECULATIVE',
      totalTax,
    };

    // 4. Net PnL (Take-Home Profit/Loss)
    const netPnL = Number((grossPnL - totalFees - totalTax).toFixed(4));

    // 5. Margin and Capital Efficiency
    const safeLeverage = Math.max(1, leverage);
    const marginUsed = Number((notionalValue / safeLeverage).toFixed(4));
    const roiPercent = marginUsed > 0 ? Number(((netPnL / marginUsed) * 100).toFixed(2)) : 0;
    const effectiveLeverage = safeLeverage;
    const safeEquity = Math.max(0.01, walletEquity);
    const capitalUtilizationPercent = Number(((marginUsed / safeEquity) * 100).toFixed(2));

    // 6. Slippage Breakdown
    const entryDiff =
      expectedEntryPrice !== undefined
        ? side === 'LONG'
          ? entryPrice - expectedEntryPrice
          : expectedEntryPrice - entryPrice
        : 0;
    const entrySlippage = Number(entryDiff.toFixed(4));
    const entrySlippagePercent =
      expectedEntryPrice && expectedEntryPrice > 0
        ? Number(((entrySlippage / expectedEntryPrice) * 100).toFixed(4))
        : 0;

    const exitDiff =
      expectedExitPrice !== undefined
        ? side === 'LONG'
          ? expectedExitPrice - exitPrice
          : exitPrice - expectedExitPrice
        : 0;
    const exitSlippage = Number(exitDiff.toFixed(4));
    const exitSlippagePercent =
      expectedExitPrice && expectedExitPrice > 0
        ? Number(((exitSlippage / expectedExitPrice) * 100).toFixed(4))
        : 0;

    const totalSlippage = Number(((entrySlippage + exitSlippage) * quantity).toFixed(4));
    const totalSlippagePercent = Number((entrySlippagePercent + exitSlippagePercent).toFixed(4));

    const slippage: SlippageDetails = {
      expectedEntryPrice,
      actualEntryPrice: entryPrice,
      entrySlippage,
      entrySlippagePercent,
      expectedExitPrice,
      actualExitPrice: exitPrice,
      exitSlippage,
      exitSlippagePercent,
      totalSlippage,
      totalSlippagePercent,
    };

    // 7. Risk-to-Reward Ratio Breakdown
    const defaultRiskSpread = notionalValue * 0.01;
    const initialRiskUsd = stopLoss
      ? Number((Math.abs(entryPrice - stopLoss) * quantity).toFixed(4))
      : Number(defaultRiskSpread.toFixed(4));
    const initialRiskPercent =
      stopLoss && entryPrice > 0
        ? Number(((Math.abs(entryPrice - stopLoss) / entryPrice) * 100).toFixed(2))
        : 1.0;

    const defaultRewardSpread = notionalValue * 0.02;
    const plannedRewardUsd = takeProfit
      ? Number((Math.abs(takeProfit - entryPrice) * quantity).toFixed(4))
      : Number(defaultRewardSpread.toFixed(4));
    const plannedRewardPercent =
      takeProfit && entryPrice > 0
        ? Number(((Math.abs(takeProfit - entryPrice) / entryPrice) * 100).toFixed(2))
        : 2.0;

    const plannedRR =
      initialRiskUsd > 0 ? Number((plannedRewardUsd / initialRiskUsd).toFixed(2)) : 0;
    const actualRewardUsd = grossPnL;
    const actualRR =
      initialRiskUsd > 0 ? Number((actualRewardUsd / initialRiskUsd).toFixed(2)) : 0;

    const riskReward: RiskRewardDetails = {
      initialRiskUsd,
      initialRiskPercent,
      plannedRewardUsd,
      plannedRewardPercent,
      plannedRR,
      actualRewardUsd,
      actualRR,
    };

    // 8. Result Status
    let resultStatus: 'WIN' | 'LOSS' | 'BREAKEVEN' = 'BREAKEVEN';
    if (netPnL > 0.0001) {
      resultStatus = 'WIN';
    } else if (netPnL < -0.0001) {
      resultStatus = 'LOSS';
    }

    return {
      tradeId,
      symbol,
      side,
      quantity,
      entryPrice,
      exitPrice,
      notionalValue,
      exitNotionalValue,
      leverage: safeLeverage,
      marginUsed,
      grossPnL,
      feeBreakdown,
      taxBreakdown,
      tradingFee,
      gstOnFees,
      fundingFee,
      tax: totalTax,
      netPnL,
      roiPercent,
      effectiveLeverage,
      capitalUtilizationPercent,
      slippage,
      riskReward,
      resultStatus,
    };
  }
}
