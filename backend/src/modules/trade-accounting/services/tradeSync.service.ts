import { TradeLedgerEntryDto, ExecutionMode, TradingTimeframe } from '@algoapp/shared';
import { TradeAccountingService } from './tradeAccounting.service.js';
import { WalletEngineService } from './walletEngine.service.js';
import { ChallengeEngineService } from './challengeEngine.service.js';

const walletService = new WalletEngineService();
const challengeService = new ChallengeEngineService();

let tradeLedgerStore: TradeLedgerEntryDto[] = [];

export interface InputTradeToSync {
  tradeId?: string;
  exchangeOrderId?: string;
  exchangeTradeId?: string;
  symbol: string;
  timeframe?: TradingTimeframe;
  strategyProfileId?: string;
  executionMode?: ExecutionMode;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  leverage: number;
  stopLoss: number;
  takeProfit: number;
  isMaker?: boolean;
  decisionConfidence?: number;
  decisionExplanation?: string;
}

export class TradeSyncService {
  public async syncTradeFromExchange(input: InputTradeToSync): Promise<TradeLedgerEntryDto> {
    const tradeId = input.tradeId || `TRD-${Date.now()}`;
    const exchangeOrderId = input.exchangeOrderId || `ORD-${Date.now()}`;
    const timeframe = input.timeframe || '1H';
    const strategyProfileId = input.strategyProfileId || 'DEF-1H-PROF';
    const executionMode = input.executionMode || ExecutionMode.PAPER;

    // 1. Accounting Calculation
    const accounting = TradeAccountingService.calculateAccounting(
      tradeId,
      input.entryPrice,
      input.exitPrice,
      input.quantity,
      input.leverage,
      input.side,
      input.isMaker ?? false
    );

    // 2. Wallet Update
    await walletService.applyTradeResult(accounting.netPnL, accounting.grossPnL, accounting.marginUsed);

    // 3. Challenge Update
    await challengeService.recordTradeResult(accounting.netPnL, accounting.grossPnL);

    const resultStatus =
      accounting.netPnL > 0 ? 'WIN' : accounting.netPnL < 0 ? 'LOSS' : 'BREAKEVEN';

    const ledgerEntry: TradeLedgerEntryDto = {
      id: `LDG-${Date.now()}`,
      tradeId,
      exchangeOrderId,
      exchangeTradeId: input.exchangeTradeId || `EX-TRD-${Date.now()}`,
      symbol: input.symbol,
      timeframe,
      strategyProfileId,
      strategyVersion: '1.0.0',
      indicatorVersion: '1.0.0',
      ruleVersion: '1.0.0',
      decisionVersion: '1.0.0',
      executionMode,
      side: input.side,
      entryPrice: input.entryPrice,
      exitPrice: input.exitPrice,
      quantity: input.quantity,
      marginUsed: accounting.marginUsed,
      leverage: input.leverage,
      riskPercent: 1.5,
      rewardPercent: 3.0,
      stopLoss: input.stopLoss,
      takeProfit: input.takeProfit,
      grossPnL: accounting.grossPnL,
      tradingFee: accounting.tradingFee,
      fundingFee: accounting.fundingFee,
      tax: accounting.tax,
      netPnL: accounting.netPnL,
      durationSeconds: 3600,
      executionLatencyMs: 14,
      decisionConfidence: input.decisionConfidence ?? 94.5,
      decisionExplanation: input.decisionExplanation ?? 'Confirmed demand zone retest with liquidity sweep.',
      resultStatus,
      syncStatus: executionMode === ExecutionMode.PAPER ? 'SIMULATED' : 'SYNCHRONIZED',
      executedAt: new Date(Date.now() - 3600000).toISOString(),
      closedAt: new Date().toISOString(),
    };

    tradeLedgerStore.unshift(ledgerEntry);
    return ledgerEntry;
  }

  public async getLedgerEntries(): Promise<TradeLedgerEntryDto[]> {
    return tradeLedgerStore;
  }

  public async exportLedgerCsv(): Promise<string> {
    const entries = await this.getLedgerEntries();
    const header =
      'TradeID,ExchangeOrderID,Symbol,Timeframe,Mode,Side,Entry,Exit,Quantity,Margin,Leverage,GrossPnL,TradingFee,FundingFee,Tax,NetPnL,Result,ClosedAt\n';

    const rows = entries.map(
      (e) =>
        `${e.tradeId},${e.exchangeOrderId},${e.symbol},${e.timeframe},${e.executionMode},${e.side},${e.entryPrice},${e.exitPrice},${e.quantity},${e.marginUsed},${e.leverage},${e.grossPnL},${e.tradingFee},${e.fundingFee},${e.tax},${e.netPnL},${e.resultStatus},${e.closedAt}`
    );

    return header + rows.join('\n');
  }
}
