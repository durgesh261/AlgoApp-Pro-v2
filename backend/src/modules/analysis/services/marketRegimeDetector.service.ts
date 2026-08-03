import { MarketRegimeInfoDto, MarketRegimeType } from '@algoapp/shared';

export class MarketRegimeDetectorService {
  public static detectRegime(symbol: string = 'BTCUSD.P', timeframe: string = '1H'): MarketRegimeInfoDto {
    let regime: MarketRegimeType = 'TRENDING_BULLISH';
    let atr = 450.0;
    let volatilityPercent = 1.45;
    let trendStrength = 88;

    if (timeframe === '15M') {
      regime = 'EXPANSION';
      atr = 120.0;
      volatilityPercent = 0.85;
      trendStrength = 82;
    }

    return {
      symbol,
      timeframe,
      regime,
      atr,
      volatilityPercent,
      trendStrength,
      session: 'New York Session',
      timestamp: new Date().toISOString(),
    };
  }
}
