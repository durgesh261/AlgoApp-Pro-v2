import { TradingTimeframe } from './strategyProfile.js';

export enum ZoneType {
  SUPPLY = 'SUPPLY',
  DEMAND = 'DEMAND',
}

export enum ZoneStatus {
  FRESH = 'FRESH',
  TOUCHED = 'TOUCHED',
  CONSUMED = 'CONSUMED',
  BROKEN = 'BROKEN',
  EXPIRED = 'EXPIRED',
}

export enum ZoneSource {
  PIT_LITE = 'PIT_LITE',
  LUXALGO = 'LUXALGO',
  MERGED = 'MERGED',
}

export enum StrategySignalOutcome {
  BUY = 'BUY',
  SELL = 'SELL',
  WAIT = 'WAIT',
  INVALID = 'INVALID',
}

export interface ZoneDto {
  id: string;
  symbol: string;
  type: ZoneType;
  timeframe: TradingTimeframe;
  upperPrice: number;
  lowerPrice: number;
  source: ZoneSource;
  strength: number; // 0 to 100
  width: number;
  freshness: number; // 0 to 100
  touchCount: number;
  status: ZoneStatus;
  createdAt: string;
  updatedAt: string;
}

export type { StrategySignalDto } from './decision.js';
