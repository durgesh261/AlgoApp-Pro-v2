import { DecisionReasonCode } from '@algoapp/shared';

const REASON_EXPLANATION_MAP: Record<DecisionReasonCode, string> = {
  [DecisionReasonCode.FRESH_ZONE_CONFIRMED]:
    'Fresh 1H Supply/Demand zone confirmed with high liquidity accumulation and un-exhausted orders.',
  [DecisionReasonCode.FIRST_TOUCH_VALIDATED]:
    'Price action entered the key market zone boundary for the first time, offering maximum structural edge.',
  [DecisionReasonCode.MOMENTUM_ALIGNED]:
    'Price action momentum is strongly aligned with the proposed structural direction.',
  [DecisionReasonCode.CONFIDENCE_THRESHOLD_MET]:
    'Overall decision confidence score exceeded the strict 80.0% execution threshold.',
  [DecisionReasonCode.OPPOSING_ZONE_BLOCKED]:
    'An immediate opposing 1H zone was detected blocking price movement, invalidating risk/reward.',
  [DecisionReasonCode.ZONE_WIDTH_EXCEEDED]:
    'Zone width exceeds maximum allowable risk boundary parameters for this asset class.',
  [DecisionReasonCode.ZONE_FRESHNESS_DECAYED]:
    'Zone freshness score has degraded below 50.0% due to elapsed time or previous touches.',
  [DecisionReasonCode.ZONE_BROKEN_INVALIDATED]:
    'Zone was invalidated because price closed past the structural boundary limit.',
  [DecisionReasonCode.REPEATED_TOUCH_EXHAUSTED]:
    'Multiple repeated touches have exhausted available liquidity inside this zone.',
};

export class ReasonBuilder {
  public static buildHumanExplanation(reasonCode: DecisionReasonCode): string {
    return REASON_EXPLANATION_MAP[reasonCode] || `Rule ${reasonCode} evaluated against market structure.`;
  }
}
