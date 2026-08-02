export enum PaperOrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum PaperOrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP_MARKET = 'STOP_MARKET',
  STOP_LIMIT = 'STOP_LIMIT',
  BRACKET = 'BRACKET',
}

export enum PaperOrderStatus {
  PENDING = 'PENDING',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum PaperPositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export enum PaperJournalEventType {
  ORDER_FILL = 'ORDER_FILL',
  ORDER_CANCEL = 'ORDER_CANCEL',
  SKIPPED_OPPORTUNITY = 'SKIPPED_OPPORTUNITY',
  RISK_EVENT = 'RISK_EVENT',
}

export interface PaperWalletDto {
  id: string;
  virtualBalance: number;
  availableMargin: number;
  usedMargin: number;
  realizedPnL: number;
  unrealizedPnL: number;
  equity: number;
  updatedAt: string;
}

export interface PaperOrderDto {
  id: string;
  symbol: string;
  side: PaperOrderSide;
  orderType: PaperOrderType;
  price?: number | undefined;
  stopPrice?: number | undefined;
  quantity: number;
  filledQuantity: number;
  status: PaperOrderStatus;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  bracketParentId?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface PaperPositionDto {
  id: string;
  symbol: string;
  side: PaperPositionSide;
  entryPrice: number;
  markPrice: number;
  quantity: number;
  notionalValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
  leverage: number;
  marginAllocated: number;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  openedAt: string;
  updatedAt: string;
}

export interface PaperRiskConfigDto {
  id: string;
  maxDailyLoss: number;
  maxDrawdownPercent: number;
  maxOpenPositions: number;
  maxRiskPerTradePercent: number;
  isEmergencyStopActive: boolean;
  updatedAt: string;
}

export interface PaperTradeJournalDto {
  id: string;
  eventType: PaperJournalEventType;
  symbol?: string | undefined;
  action: string;
  details: string;
  metadataJson?: string | undefined;
  timestamp: string;
}

export interface PaperAnalyticsDto {
  winRatePercent: number;
  profitFactor: number;
  averageRR: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  maxDrawdownPercent: number;
  equityCurve: Array<{ time: string; equity: number }>;
  pairPerformance: Array<{ symbol: string; winRate: number; totalPnL: number }>;
}
