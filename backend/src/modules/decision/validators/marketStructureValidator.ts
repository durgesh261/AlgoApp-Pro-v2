import {
  DecisionReasonCode,
  MarketStructureEventDto,
  StrategySignalOutcome,
} from '@algoapp/shared';

export interface MarketStructureValidationResult {
  passed: boolean;
  reasonCode?: DecisionReasonCode | undefined;
  lastEventType?: 'BOS' | 'CHOCH' | undefined;
  eventCount: number;
}

export class MarketStructureValidator {
  /**
   * Deterministically validates that recent market structure events (BOS/CHOCH) support the trade setup.
   */
  public static validate(
    outcome: StrategySignalOutcome,
    structureEvents: MarketStructureEventDto[]
  ): MarketStructureValidationResult {
    if (structureEvents.length === 0) {
      return {
        passed: true, // If early series without structure breaks yet, fallback to trend validator
        eventCount: 0,
      };
    }

    const targetDirection = outcome === StrategySignalOutcome.BUY ? 'BULLISH' : 'BEARISH';
    const recentAlignedEvents = structureEvents.filter((e) => e.direction === targetDirection);

    if (recentAlignedEvents.length > 0) {
      const latest = recentAlignedEvents[recentAlignedEvents.length - 1]!;
      const reasonCode =
        latest.type === 'BOS'
          ? DecisionReasonCode.BOS_CONFIRMED
          : DecisionReasonCode.CHOCH_CONFIRMED;

      return {
        passed: true,
        reasonCode,
        lastEventType: latest.type,
        eventCount: recentAlignedEvents.length,
      };
    }

    return {
      passed: false,
      eventCount: 0,
    };
  }
}
