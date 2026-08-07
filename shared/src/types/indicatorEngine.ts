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

export interface PivotPointDto {
  index: number;
  time: string;
  price: number;
  type: 'HIGH' | 'LOW';
  length: number;
  isSwing: boolean;
  confirmedAtIndex: number;
}

export interface ZigZagLegDto {
  startIndex: number;
  endIndex: number;
  startPrice: number;
  endPrice: number;
  direction: 'UP' | 'DOWN';
  priceLength: number;
  barLength: number;
  startTime: string;
  endTime: string;
}

export type StructureBreakType = 'BOS' | 'CHOCH';

export interface MarketStructureEventDto {
  index: number;
  time: string;
  type: StructureBreakType;
  direction: 'BULLISH' | 'BEARISH';
  brokenLevel: number;
  isInternal: boolean;
  confirmationCandleIndex: number;
}

export interface OrderBlockDto {
  id: string;
  symbol: string;
  timeframe: TradingTimeframe;
  type: 'BULLISH' | 'BEARISH';
  upperPrice: number;
  lowerPrice: number;
  widthPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  calculatedLeverage: number;
  baseCandleIndex: number;
  breakCandleIndex: number;
  isMitigated: boolean;
  mitigatedAtIndex?: number | undefined;
  isInvalidated: boolean;
  isUsed: boolean;
  usedAt?: string | undefined;
  touchCount: number;
  source: 'PAT' | 'SMC';
  createdAt: string;
}

export interface LiquiditySweepDto {
  id: string;
  symbol: string;
  timeframe: TradingTimeframe;
  sweepType: 'HIGH_SWEEP' | 'LOW_SWEEP';
  sweptLevel: number;
  sweepPrice: number;
  candleIndex: number;
  candleTime: string;
  isSwingSweep: boolean;
  wickRatio: number;
}

export interface FairValueGapDto {
  id: string;
  symbol: string;
  timeframe: TradingTimeframe;
  type: 'BULLISH' | 'BEARISH';
  upperPrice: number;
  lowerPrice: number;
  gapWidth: number;
  candleIndex: number;
  candleTime: string;
  status: 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED';
  mitigatedAtPrice?: number | undefined;
}

export interface EqualHighLowDto {
  id: string;
  symbol: string;
  timeframe: TradingTimeframe;
  type: 'EQH' | 'EQL';
  priceLevel: number;
  firstPivotIndex: number;
  secondPivotIndex: number;
  tolerance: number;
  isSwept: boolean;
}

export interface PremiumDiscountZonesDto {
  trailingTop: number;
  trailingBottom: number;
  equilibrium: number;
  premiumZone: { top: number; bottom: number };
  equilibriumZone: { top: number; bottom: number };
  discountZone: { top: number; bottom: number };
  currentPrice: number;
  currentZone: 'PREMIUM' | 'EQUILIBRIUM' | 'DISCOUNT';
}

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
  premiumDiscountZones?: PremiumDiscountZonesDto | undefined;
  pivotsInternal?: PivotPointDto[] | undefined;
  pivotsSwing?: PivotPointDto[] | undefined;
  zigzagLegs?: ZigZagLegDto[] | undefined;
  structureEvents?: MarketStructureEventDto[] | undefined;
  orderBlocks?: OrderBlockDto[] | undefined;
  liquiditySweeps?: LiquiditySweepDto[] | undefined;
  fairValueGaps?: FairValueGapDto[] | undefined;
  equalHighLows?: EqualHighLowDto[] | undefined;
  atr14?: number | undefined;
  atr200?: number | undefined;
  evaluatedAt: string;
}

export interface EvaluateIndicatorInput {
  symbol: string;
  timeframe?: TradingTimeframe | undefined;
  candles?: CandleDto[] | undefined;
}

