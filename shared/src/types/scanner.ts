export type ScannerStatus = 'RUNNING' | 'PAUSED' | 'STOPPED' | 'IN_TRADE';
export type ScannerPairUserStatus = 'RUNNING' | 'PAUSED' | 'STOPPED';

export interface ScannerPairTelemetry {
  symbol: string;
  currentPrice: number;
  lastTickAt: string;
  activeOrderBlocksCount: number;
  latestOBWidthPercent?: number | undefined;
  latestConfidenceScore?: number | undefined;
  scanState: 'SCANNING' | 'EVALUATING' | 'SIGNAL_TRIGGERED' | 'LOCKED_IN_TRADE' | 'PAUSED' | 'STOPPED';
  userStatus?: ScannerPairUserStatus;
  reason?: string | undefined;
}

export interface ScannerStateDto {
  status: ScannerStatus;
  symbols: string[];
  timeframe: '1H';
  activeTradeSymbol: string | null;
  activeTradeId: string | null;
  lastScanTime: string;
  evaluatedTicksCount: number;
  signalsGeneratedCount: number;
  executedTradesCount: number;
  pairs: Record<string, ScannerPairTelemetry>;
  pairStates?: Record<string, ScannerPairUserStatus>;
  latestAiDecision?: any | undefined;
}

export interface ScannerSignalCandidate {
  symbol: string;
  timeframe: '1H';
  direction: 'BUY' | 'SELL';
  orderBlockId: string;
  orderBlockWidthPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  leverage: number;
  confidenceScore: number;
  aiBreakdown: any;
  timestamp: string;
}
