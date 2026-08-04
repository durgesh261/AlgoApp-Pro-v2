import { describe, it, expect } from 'vitest';
import { DecisionReasonCode, DecisionState } from '@algoapp/shared';
import { ReasonBuilder } from '../../backend/src/modules/ai-decision/explanation/reasonBuilder.js';
import { TimelineBuilder } from '../../backend/src/modules/ai-decision/explanation/timelineBuilder.js';
import { DecisionTreeBuilder } from '../../backend/src/modules/ai-decision/explanation/decisionTreeBuilder.js';
import { JournalGenerator } from '../../backend/src/modules/ai-decision/explanation/journalGenerator.js';

describe('AI Decision Center Unit Tests', () => {
  const sampleDecision = {
    id: 'DEC-TEST-99',
    signalId: 'SIG-TEST-1',
    symbol: 'BTCUSD.P',
    timeframe: '1H' as const,
    decisionState: DecisionState.EXECUTE,
    confidenceScore: 92.5,
    reasonCodes: [
      DecisionReasonCode.FRESH_ZONE_CONFIRMED,
      DecisionReasonCode.FIRST_TOUCH_VALIDATED,
      DecisionReasonCode.MOMENTUM_ALIGNED,
      DecisionReasonCode.CONFIDENCE_THRESHOLD_MET,
    ],
    inputSnapshotHash: 'a8f3b4c9e71234567890abcdef1234567890abcdef1234567890abcdef123456',
    timestamp: '2026-08-02T20:44:02Z',
  };

  it('should map reason codes to human explanations deterministically', () => {
    const exp1 = ReasonBuilder.buildHumanExplanation(DecisionReasonCode.FRESH_ZONE_CONFIRMED);
    const exp2 = ReasonBuilder.buildHumanExplanation(DecisionReasonCode.FRESH_ZONE_CONFIRMED);

    expect(exp1).toContain('Fresh 1H Supply/Demand zone confirmed');
    expect(exp1).toEqual(exp2); // Reproducibility
  });

  it('should build a 6-step chronological timeline', () => {
    const timeline = TimelineBuilder.buildTimeline(sampleDecision);
    expect(timeline.length).toBe(6);
    expect(timeline[0]?.stage).toBe('Zone Created & Merged');
    expect(timeline[5]?.stage).toBe('Decision Generated');
  });

  it('should build a deterministic evaluation decision tree', () => {
    const tree = DecisionTreeBuilder.buildDecisionTree(sampleDecision);
    expect(tree.label).toBe('Fresh Zone Check');
    expect(tree.result).toBe('YES');
  });

  it('should generate structured journal entry', () => {
    const journal = JournalGenerator.generateJournalEntry(sampleDecision);
    expect(journal.title).toContain('[1H Market Decision] BTCUSD.P — State: EXECUTE');
    expect(journal.summary).toContain('92.5% confidence score');
  });
});
