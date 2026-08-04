import { DecisionDto, DecisionTimelineStep } from '@algoapp/shared';

export class TimelineBuilder {
  public static buildTimeline(decision: DecisionDto): DecisionTimelineStep[] {
    const timestamp = decision.timestamp;

    return [
      {
        stepIndex: 1,
        stage: 'Zone Created & Merged',
        status: 'PASS',
        description: `1H Supply/Demand zone boundaries identified for ${decision.symbol}.`,
        timestamp,
      },
      {
        stepIndex: 2,
        stage: 'Zone Validated',
        status: decision.reasonCodes.includes('ZONE_BROKEN_INVALIDATED' as any) ? 'FAIL' : 'PASS',
        description: 'Checked zone structural integrity and price boundary closes.',
        timestamp,
      },
      {
        stepIndex: 3,
        stage: 'Freshness Checked',
        status: decision.reasonCodes.includes('ZONE_FRESHNESS_DECAYED' as any) ? 'FAIL' : 'PASS',
        description: 'Evaluated touch counts and time decay factor.',
        timestamp,
      },
      {
        stepIndex: 4,
        stage: 'Momentum Checked',
        status: decision.reasonCodes.includes('MOMENTUM_ALIGNED' as any) ? 'PASS' : 'INFO',
        description: 'Verified trend and price action momentum alignment.',
        timestamp,
      },
      {
        stepIndex: 5,
        stage: 'Confidence Calculated',
        status: decision.confidenceScore >= 80 ? 'PASS' : 'INFO',
        description: `Weighted confidence score computed: ${decision.confidenceScore}%.`,
        timestamp,
      },
      {
        stepIndex: 6,
        stage: 'Decision Generated',
        status: 'PASS',
        description: `Final decision state: ${decision.decisionState}.`,
        timestamp,
      },
    ];
  }
}
