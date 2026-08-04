import { IngestCandleInput } from '@algoapp/shared';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export class MarketDataValidator {
  private static readonly SUPPORTED_PAIRS = new Set(['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P']);

  public static validateCandle(candle: IngestCandleInput): ValidationResult {
    // 1. Pair check
    if (!this.SUPPORTED_PAIRS.has(candle.symbol)) {
      return { valid: false, reason: `UNSUPPORTED_PAIR: Symbol '${candle.symbol}' is not allowed.` };
    }

    // 2. Timeframe check
    if (candle.timeframe !== '1H') {
      return { valid: false, reason: `UNSUPPORTED_TIMEFRAME: Timeframe '${candle.timeframe}' rejected. Only 1H supported.` };
    }

    // 3. OHLC Math check
    if (candle.high < candle.low) {
      return { valid: false, reason: 'INVALID_OHLC: High price cannot be less than Low price.' };
    }
    if (candle.high < candle.open || candle.high < candle.close) {
      return { valid: false, reason: 'INVALID_OHLC: High price must be >= Open and Close.' };
    }
    if (candle.low > candle.open || candle.low > candle.close) {
      return { valid: false, reason: 'INVALID_OHLC: Low price must be <= Open and Close.' };
    }

    // 4. Volume check
    if (candle.volume < 0) {
      return { valid: false, reason: 'INVALID_VOLUME: Volume cannot be negative.' };
    }

    return { valid: true };
  }
}
