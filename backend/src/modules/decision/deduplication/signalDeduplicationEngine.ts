import { DecisionReasonCode } from '@algoapp/shared';

export interface DeduplicationCheckInput {
  symbol: string;
  timeframe: string;
  candleTimestamp: string;
  zoneId?: string | undefined;
  hasOpenPosition?: boolean | undefined;
  cooldownMs?: number | undefined;
}

export interface DeduplicationResult {
  allowed: boolean;
  reasonCode?: DecisionReasonCode | undefined;
  message?: string | undefined;
}

interface LastTradeRecord {
  symbol: string;
  timeframe: string;
  candleTimestamp: string;
  zoneId?: string | undefined;
  executedAt: number;
}

export class SignalDeduplicationEngine {
  private static executedTrades: LastTradeRecord[] = [];

  /**
   * Resets deduplication history (used for unit tests and replay runs).
   */
  public static resetHistory(): void {
    this.executedTrades = [];
  }

  /**
   * Evaluates whether a new trade setup passes anti-duplication and cooldown checks.
   */
  public static checkDuplication(input: DeduplicationCheckInput): DeduplicationResult {
    const cooldownMs = input.cooldownMs ?? 15 * 60 * 1000; // Default 15 min cooldown
    const now = Date.now();

    // 1. Check existing open position
    if (input.hasOpenPosition) {
      return {
        allowed: false,
        reasonCode: DecisionReasonCode.EXISTING_POSITION_OPEN,
        message: `An open position or pending order already exists for ${input.symbol}. Duplicate trade rejected.`,
      };
    }

    const previousTrades = this.executedTrades.filter(
      (t) => t.symbol === input.symbol && t.timeframe === input.timeframe
    );

    for (const prev of previousTrades) {
      // 2. Check same candle timestamp
      if (prev.candleTimestamp === input.candleTimestamp) {
        return {
          allowed: false,
          reasonCode: DecisionReasonCode.DUPLICATE_CANDLE_ENTRY_BLOCKED,
          message: `A trade has already been triggered on candle ${input.candleTimestamp} for ${input.symbol}.`,
        };
      }

      // 3. Check same zone reuse
      if (input.zoneId && prev.zoneId && prev.zoneId === input.zoneId) {
        return {
          allowed: false,
          reasonCode: DecisionReasonCode.DUPLICATE_ZONE_ENTRY_BLOCKED,
          message: `Zone ${input.zoneId} has already been traded. Re-entry blocked to prevent multi-fill risk.`,
        };
      }

      // 4. Check cooldown timer
      const elapsed = now - prev.executedAt;
      if (elapsed < cooldownMs) {
        return {
          allowed: false,
          reasonCode: DecisionReasonCode.COOLDOWN_ACTIVE,
          message: `Cooldown active for ${input.symbol}. Remaining: ${Math.ceil((cooldownMs - elapsed) / 1000)}s.`,
        };
      }
    }

    return {
      allowed: true,
    };
  }

  /**
   * Registers a successfully executed decision into the deduplication ledger.
   */
  public static recordExecution(
    symbol: string,
    timeframe: string,
    candleTimestamp: string,
    zoneId?: string
  ): void {
    this.executedTrades.unshift({
      symbol,
      timeframe,
      candleTimestamp,
      zoneId,
      executedAt: Date.now(),
    });

    if (this.executedTrades.length > 200) {
      this.executedTrades = this.executedTrades.slice(0, 200);
    }
  }
}
