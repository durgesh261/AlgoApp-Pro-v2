import { CandleDto, MarketSnapshotDto, MarketEventDto } from './marketData.js';

export interface TradingViewWebhookPayload {
  symbol: string;
  timeframe: '1H';
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
  passphrase?: string | undefined;
}

export interface WebhookEventDto {
  id: string;
  symbol: string;
  timeframe: string;
  payloadJson: string;
  signature?: string | undefined;
  status: 'PROCESSED' | 'DUPLICATE' | 'DROPPED' | 'MALFORMED';
  timestamp: string;
}

export interface WebhookErrorDto {
  id: string;
  symbol?: string | undefined;
  errorType: string;
  message: string;
  rawPayload: string;
  timestamp: string;
}

export interface TradingViewHealthDto {
  id: string;
  status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
  lastWebhookAt: string;
  totalWebhooks: number;
  duplicateCount: number;
  droppedCount: number;
  malformedCount: number;
  averageLatencyMs: number;
  updatedAt: string;
}

export interface NormalizedMarketData {
  candle: CandleDto;
  snapshot: MarketSnapshotDto;
  event: MarketEventDto;
}

export interface TradingViewWebhookResult {
  success: boolean;
  status: 'PROCESSED' | 'DUPLICATE' | 'DROPPED' | 'MALFORMED';
  data?: NormalizedMarketData | undefined;
  error?: string | undefined;
  latencyMs: number;
  timestamp: string;
}
