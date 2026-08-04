export interface BacktestTradeDto {
  id: string;
  sessionId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  status: 'WIN' | 'LOSS';
  timestamp: string;
}

export interface BacktestMetricsDto {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  lossRate: number;
  profitFactor: number;
  averageRR: number;
  netPnL: number;
  maxDrawdown: number;
  bestTradePnL: number;
  worstTradePnL: number;
  skippedTrades: number;
  invalidTrades: number;
}

export interface BacktestSessionDto {
  id: string;
  symbol: string;
  timeframe: '1H';
  ruleVersion: string;
  configVersion: string;
  startDate: string;
  endDate: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  metrics: BacktestMetricsDto;
  trades: BacktestTradeDto[];
  createdAt: string;
}

export interface RunBacktestInput {
  symbol: string;
  timeframe?: '1H' | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  initialBalance?: number | undefined;
}
