export class MarketRuleEvaluator {
  private static readonly SUPPORTED_PAIRS = new Set(['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P']);

  public static isSupportedPair(symbol: string): boolean {
    return this.SUPPORTED_PAIRS.has(symbol);
  }

  public static isSupportedTimeframe(timeframe: string): boolean {
    return timeframe === '1H';
  }

  public static validateMarketContext(symbol: string, timeframe: string): { valid: boolean; reason?: string } {
    if (!this.isSupportedPair(symbol)) {
      return { valid: false, reason: `UNSUPPORTED_PAIR: Pair ${symbol} is not in trading allow-list.` };
    }
    if (!this.isSupportedTimeframe(timeframe)) {
      return { valid: false, reason: `UNSUPPORTED_TIMEFRAME: Timeframe ${timeframe} rejected. Only 1H supported.` };
    }
    return { valid: true };
  }
}
