import {
  CandleDto,
  LiquiditySweepDto,
  PivotPointDto,
  TradingTimeframe,
} from '@algoapp/shared';

export class LiquiditySweepEngine {
  /**
   * Deterministic detection of High and Low liquidity sweeps against confirmed pivots.
   */
  public static detectSweeps(
    symbol: string,
    candles: CandleDto[],
    pivotsInternal: PivotPointDto[],
    pivotsSwing: PivotPointDto[],
    timeframe: TradingTimeframe = '1H'
  ): LiquiditySweepDto[] {
    const sweeps: LiquiditySweepDto[] = [];
    if (candles.length < 5) return sweeps;

    const allPivots = [
      ...pivotsSwing.map((p) => ({ ...p, isSwing: true })),
      ...pivotsInternal.map((p) => ({ ...p, isSwing: false })),
    ].sort((a, b) => a.index - b.index);

    for (let i = 0; i < candles.length; i++) {
      const candle = candles[i]!;
      const candleRange = candle.high - candle.low;
      if (candleRange <= 0) continue;

      // Check all pivots confirmed before this bar
      for (const pivot of allPivots) {
        if (pivot.confirmedAtIndex > i || pivot.index >= i) continue;

        if (pivot.type === 'HIGH') {
          // High Sweep: wick breaks high, but candle body closes back below
          if (candle.high > pivot.price && candle.close < pivot.price) {
            const upperWick = candle.high - Math.max(candle.open, candle.close);
            const wickRatio = Number((upperWick / candleRange).toFixed(2));

            sweeps.push({
              id: `SWEEP-HIGH-${symbol}-${i}-${pivot.index}`,
              symbol,
              timeframe,
              sweepType: 'HIGH_SWEEP',
              sweptLevel: pivot.price,
              sweepPrice: candle.high,
              candleIndex: i,
              candleTime: candle.timestamp,
              isSwingSweep: pivot.isSwing,
              wickRatio,
            });
          }
        } else {
          // Low Sweep: wick breaks low, but candle body closes back above
          if (candle.low < pivot.price && candle.close > pivot.price) {
            const lowerWick = Math.min(candle.open, candle.close) - candle.low;
            const wickRatio = Number((lowerWick / candleRange).toFixed(2));

            sweeps.push({
              id: `SWEEP-LOW-${symbol}-${i}-${pivot.index}`,
              symbol,
              timeframe,
              sweepType: 'LOW_SWEEP',
              sweptLevel: pivot.price,
              sweepPrice: candle.low,
              candleIndex: i,
              candleTime: candle.timestamp,
              isSwingSweep: pivot.isSwing,
              wickRatio,
            });
          }
        }
      }
    }

    return sweeps;
  }
}
