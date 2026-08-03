import { TradingTimeframe } from './strategyProfile.js';

export enum MarketEventType {
  NEW_CANDLE = 'NEW_CANDLE',
  PRICE_UPDATED = 'PRICE_UPDATED',
  MARKET_OPEN = 'MARKET_OPEN',
  MARKET_CLOSE = 'MARKET_CLOSE',
  TRADINGVIEW_CANDLE_RECEIVED = 'TRADINGVIEW_CANDLE_RECEIVED',
}

export interface CandleDto {
  id: string;
  symbol: string;
  timeframe: TradingTimeframe;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface MarketSnapshotDto {
  id: string;
  symbol: string;
  currentPrice: number;
  spread: number;
  bid?: number | undefined;
  ask?: number | undefined;
  session?: string | undefined;
  trend?: string | undefined;
  volatility?: string | undefined;
  timestamp: string;
}

export interface MarketEventDto {
  id: string;
  symbol: string;
  type?: MarketEventType | undefined;
  eventType?: MarketEventType | string | undefined;
  payloadJson: string;
  timestamp: string;
}
