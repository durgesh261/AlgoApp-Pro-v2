import { CandleDto } from './marketData.js';
import { TradingTimeframe } from './strategyProfile.js';

export type ZoneLifecycleState = 
  | 'NEW'
  | 'ACTIVE'
  | 'FIRST_TOUCH'
  | 'TRADED'
  | 'BROKEN'
  | 'ARCHIVED';

export type ZoneTypeCategory = 'SUPPLY' | 'DEMAND';

export interface BaseZone {
  id: string;
  symbol: string;
  timeframe: TradingTimeframe;
  type: ZoneTypeCategory;
  upperPrice: number;
  lowerPrice: number;
  patStrength: number;
  smcStrength: number;
  mergedStrength: number;
  width: number;
  freshness: number;
  touchCount: number;
  age: number; // Age in candles
  confidence: number;
  status: ZoneLifecycleState;
  source: 'PAT' | 'SMC' | 'MERGED';
  createdAt: string;
  updatedAt: string;
}

export type SupplyZone = BaseZone;
export type DemandZone = BaseZone;

export interface ZoneScore {
  zoneId: string;
  totalScore: number; // 0 – 100
  freshnessScore: number;
  widthScore: number;
  atrQualityScore: number;
  mergeQualityScore: number;
  patConfirmation: boolean;
  smcConfirmation: boolean;
  touchCountScore: number;
  momentumScore: number;
}

export interface MarketStructure {
  symbol: string;
  timeframe: TradingTimeframe;
  trend: 'BULLISH' | 'BEARISH';
  internalTrend: 'BULLISH' | 'BEARISH';
  swingTrend: 'BULLISH' | 'BEARISH';
  lastPivotType?: 'HIGH' | 'LOW' | undefined;
  lastPivotPrice?: number | undefined;
  lastBosTime?: string | undefined;
  lastChochTime?: string | undefined;
  liquiditySwept: boolean;
}

export interface IndicatorEngineOutput {
  symbol: string;
  timeframe: TradingTimeframe;
  supplyZones: SupplyZone[];
  demandZones: DemandZone[];
  zoneScores: Record<string, ZoneScore>;
  marketStructure: MarketStructure;
  evaluatedAt: string;
}

export interface EvaluateIndicatorInput {
  symbol: string;
  timeframe?: TradingTimeframe | undefined;
  candles?: CandleDto[] | undefined;
}
