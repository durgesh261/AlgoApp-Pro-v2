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
        timestamp: timestamp as string,
      },
      {
        stepIndex: 2,
        stage: 'Zones Evaluated',
        status: decision.reasonCodes.includes('FRESH_ZONE_CONFIRMED' as any) ? 'PASS' : 'INFO',
        description: 'Checked current price against Order Blocks.',
        timestamp: timestamp as string,
      },
      {
        stepIndex: 3,
        stage: 'Entry Triggered',
        status: decision.reasonCodes.includes('FIRST_TOUCH_VALIDATED' as any) ? 'PASS' : 'INFO',
        description: 'First touch entry mechanics and FVGs checked.',
        timestamp: timestamp as string,
      },
      {
        stepIndex: 4,
        stage: 'Momentum Checked',
        status: decision.reasonCodes.includes('MOMENTUM_ALIGNED' as any) ? 'PASS' : 'INFO',
        description: 'Verified trend and price action momentum alignment.',
        timestamp: timestamp as string,
      },
      {
        stepIndex: 5,
        stage: 'Confidence Calculated',
        status: decision.confidenceScore >= 80 ? 'PASS' : 'INFO',
        description: `Weighted confidence score computed: ${decision.confidenceScore}%.`,
        timestamp: timestamp as string,
      },
      {
        stepIndex: 6,
        stage: 'Decision Generated',
        status: 'PASS',
        description: `Final decision state: ${decision.decisionState}.`,
        timestamp: timestamp as string,
      },
    ];
  }
}
