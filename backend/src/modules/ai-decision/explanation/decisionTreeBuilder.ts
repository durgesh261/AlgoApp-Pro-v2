import { DecisionDto, DecisionTreeNode, DecisionState } from '@algoapp/shared';

export class DecisionTreeBuilder {
  public static buildDecisionTree(decision: DecisionDto): DecisionTreeNode {
    const isFreshPass = !decision.reasonCodes.includes('ZONE_FRESHNESS_DECAYED' as any);
    const isFirstTouchPass = decision.reasonCodes.includes('FIRST_TOUCH_VALIDATED' as any);
    const isMomentumPass = decision.reasonCodes.includes('MOMENTUM_ALIGNED' as any);
    const isNoOpposingPass = !decision.reasonCodes.includes('OPPOSING_ZONE_BLOCKED' as any);

    return {
      nodeId: 'node-root',
      label: 'Fresh Zone Check',
      condition: 'Freshness >= 50.0%',
      result: isFreshPass ? 'YES' : 'NO',
      children: [
        {
          nodeId: 'node-first-touch',
          label: 'First Touch Check',
          condition: 'Touch Count <= 1',
          result: isFirstTouchPass ? 'YES' : 'NO',
          children: [
            {
              nodeId: 'node-momentum',
              label: 'Momentum Alignment',
              condition: 'Directional Momentum Aligned',
              result: isMomentumPass ? 'PASS' : 'FAIL',
              children: [
                {
                  nodeId: 'node-opposing',
                  label: 'Opposing Zone Check',
                  condition: 'No Immediate Blocking Zone',
                  result: isNoOpposingPass ? 'PASS' : 'FAIL',
                  children: [
                    {
                      nodeId: 'node-confidence',
                      label: 'Confidence Threshold',
                      condition: `Score ${decision.confidenceScore}% >= 80.0%`,
                      result: decision.decisionState === DecisionState.EXECUTE ? 'PASS' : 'FAIL',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }
}
