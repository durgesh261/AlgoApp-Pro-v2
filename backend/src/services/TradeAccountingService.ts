import { eventBus } from './EventBus.js';

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
   * Computes true Net PnL with taker fee (0.05%), funding rate fee, and Indian crypto tax (30% STCG).
   */
  public calculateNetPnL(params: {
    symbol: string;
    side: 'LONG' | 'SHORT';
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    fundingFee?: number;
  }): TradeCalculationResult {
    const { symbol, side, entryPrice, exitPrice, quantity, fundingFee = 0 } = params;

    const grossPnl =
      side === 'LONG'
        ? (exitPrice - entryPrice) * quantity
        : (entryPrice - exitPrice) * quantity;

    // Standard 0.05% (5 bps) taker fee on exit notional
    const tradingFee = exitPrice * quantity * 0.0005;
    // 30% STCG on positive profits
    const tax = Math.max(0, grossPnl * 0.3);
    const netPnl = grossPnl - tradingFee - fundingFee - tax;

    let resultStatus: 'WIN' | 'LOSS' | 'BREAKEVEN' = 'BREAKEVEN';
    if (netPnl > 0.0001) resultStatus = 'WIN';
    else if (netPnl < -0.0001) resultStatus = 'LOSS';

    const result: TradeCalculationResult = {
      symbol,
      side,
      entryPrice,
      exitPrice,
      quantity,
      grossPnl,
      tradingFee,
      fundingFee,
      tax,
      netPnl,
      resultStatus,
    };

    eventBus.emit('trade:accounted', result);
    return result;
  }
}

export const tradeAccountingService = new TradeAccountingService();
