import { StabilityMatrixItemDto } from '@algoapp/shared';

export class StabilityAnalyzerService {
  public async getStabilityMatrix(): Promise<StabilityMatrixItemDto[]> {
    return [
      { symbol: 'BTCUSD.P', timeframe: '1H', regime: 'TRENDING', stabilityScore: 98.2, winRatePercent: 82.5 },
      { symbol: 'BTCUSD.P', timeframe: '15M', regime: 'TRENDING', stabilityScore: 94.0, winRatePercent: 78.0 },
      { symbol: 'ETHUSD.P', timeframe: '1H', regime: 'TRENDING', stabilityScore: 95.8, winRatePercent: 80.0 },
      { symbol: 'ETHUSD.P', timeframe: '15M', regime: 'RANGING', stabilityScore: 91.2, winRatePercent: 74.5 },
      { symbol: 'SOLUSD.P', timeframe: '1H', regime: 'HIGH_VOLATILITY', stabilityScore: 92.5, winRatePercent: 76.0 },
      { symbol: 'XRPUSD.P', timeframe: '1H', regime: 'LOW_VOLATILITY', stabilityScore: 89.5, winRatePercent: 72.0 },
    ];
  }
}
