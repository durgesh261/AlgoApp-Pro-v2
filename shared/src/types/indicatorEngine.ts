import { CandleDto } from './marketData.js';

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
  timeframe: '1H';
  type: ZoneTypeCategory;
  upperPrice: number;
  lowerPrice: number;
  patStrength: number;
  smcStrength: number;
  mergedStrength: number;
  width: number;
  freshness: number;
  touchCount: number;
  age: number; // Age in 1H candles
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
  timeframe: '1H';
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
  timeframe: '1H';
  supplyZones: SupplyZone[];
  demandZones: DemandZone[];
  zoneScores: Record<string, ZoneScore>;
  marketStructure: MarketStructure;
  evaluatedAt: string;
}

export interface EvaluateIndicatorInput {
  symbol: string;
  timeframe?: '1H';
  candles?: CandleDto[];
}
