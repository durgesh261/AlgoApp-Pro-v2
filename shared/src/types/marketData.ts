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
  timeframe: '1H';
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
  session: string; // e.g. "NEW_YORK", "LONDON", "ASIAN"
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
}

export interface MarketEventDto {
  id: string;
  symbol: string;
  eventType: MarketEventType;
  payloadJson: string;
  timestamp: string;
}
