import { BaseZone } from './indicatorEngine.js';

export interface TradingViewBenchmarkZone {
  id: string;
  symbol: string;
  timeframe: '1H';
  type: 'SUPPLY' | 'DEMAND';
  upperPrice: number;
  lowerPrice: number;
  source: 'UAlgo' | 'LuxAlgo' | 'Merged';
}

export interface ZoneComparisonItem {
  id: string;
  symbol: string;
  zoneType: 'SUPPLY' | 'DEMAND';
  tvZone?: TradingViewBenchmarkZone | undefined;
  algoAppZone?: BaseZone | undefined;
  overlapPercentage: number;
  upperPriceDiff: number;
  lowerPriceDiff: number;
  isMatched: boolean;
  status: 'MATCH' | 'BOUND_MISMATCH' | 'MISSING_IN_ALGOAPP' | 'MISSING_IN_TV';
}

export interface ValidationReportDto {
  id: string;
  overallAccuracy: number; // 0 - 100%
  pairAccuracy: Record<string, number>;
  zoneAccuracy: number;
  averagePriceDiff: number;
  bestPair: string;
  worstPair: string;
  totalCompared: number;
  matchedCount: number;
  mismatchCount: number;
  comparisons: ZoneComparisonItem[];
  evaluatedAt: string;
}

export interface RunValidationInput {
  symbol?: string | undefined;
  replayCandles?: boolean | undefined;
}
