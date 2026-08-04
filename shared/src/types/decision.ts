export enum DecisionState {
  EXECUTE = 'EXECUTE',
  WAIT = 'WAIT',
  SKIP = 'SKIP',
  INVALID = 'INVALID',
}

export enum DecisionReasonCode {
  FRESH_ZONE_CONFIRMED = 'FRESH_ZONE_CONFIRMED',
  FIRST_TOUCH_VALIDATED = 'FIRST_TOUCH_VALIDATED',
  MOMENTUM_ALIGNED = 'MOMENTUM_ALIGNED',
  CONFIDENCE_THRESHOLD_MET = 'CONFIDENCE_THRESHOLD_MET',
  OPPOSING_ZONE_BLOCKED = 'OPPOSING_ZONE_BLOCKED',
  ZONE_WIDTH_EXCEEDED = 'ZONE_WIDTH_EXCEEDED',
  ZONE_FRESHNESS_DECAYED = 'ZONE_FRESHNESS_DECAYED',
  ZONE_BROKEN_INVALIDATED = 'ZONE_BROKEN_INVALIDATED',
  REPEATED_TOUCH_EXHAUSTED = 'REPEATED_TOUCH_EXHAUSTED',
}

export interface DecisionDto {
  id: string;
  signalId: string;
  symbol: string;
  timeframe: '1H';
  decisionState: DecisionState;
  confidenceScore: number; // 0 to 100
  reasonCodes: DecisionReasonCode[];
  inputSnapshotHash: string;
  timestamp: string;
}
