import { eventBus } from './EventBus.js';
import { TradeAccountingService as ModuleTradeAccountingService } from '../modules/trade-accounting/services/tradeAccounting.service.js';

export interface TradeCalculationResult {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  grossPnl: number;
  tradingFee: number;
  fundingFee: number;
  tax: number;
  netPnl: number;
  resultStatus: 'WIN' | 'LOSS' | 'BREAKEVEN';
}

export class TradeAccountingService {
  /**
   * Computes true Net PnL with Delta Exchange India fees, funding rates, and Indian crypto tax (30% STCG).
   */
  public calculateNetPnL(params: {
    symbol: string;
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    fundingFee?: number | undefined;
    leverage?: number | undefined;
    isEntryMaker?: boolean | undefined;
    isExitMaker?: boolean | undefined;
  }): TradeCalculationResult {
    const {
      symbol,
      side,
      entryPrice,
      exitPrice,
      quantity,
      fundingFee,
      leverage = 1,
      isEntryMaker = false,
      isExitMaker = false,
    } = params;

    const calc = ModuleTradeAccountingService.calculateAccounting({
      tradeId: `TRD-${Date.now()}`,
      symbol,
      side,
      entryPrice,
      exitPrice,
      quantity,
      leverage,
      isEntryMaker,
      isExitMaker,
      actualFundingFee: fundingFee,
    });

    const result: TradeCalculationResult = {
      symbol,
      side,
      entryPrice,
      exitPrice,
      quantity,
      grossPnl: calc.grossPnL,
      tradingFee: calc.tradingFee,
      fundingFee: calc.fundingFee,
      tax: calc.tax,
      netPnl: calc.netPnL,
      resultStatus: calc.resultStatus,
    };

    eventBus.emit('trade:accounted', result);
    return result;
  }
}

export const tradeAccountingService = new TradeAccountingService();
