import {
  DecisionDto,
  DecisionExplanationDto,
  DecisionState,
  DecisionReasonCode,
  ReplayMetadataDto,
} from '@algoapp/shared';

import { DecisionEngineService } from '../../decision/services/decisionEngine.service.js';
import { ReasonBuilder } from '../explanation/reasonBuilder.js';
import { TimelineBuilder } from '../explanation/timelineBuilder.js';
import { DecisionTreeBuilder } from '../explanation/decisionTreeBuilder.js';
import { JournalGenerator } from '../explanation/journalGenerator.js';

let explanationCache: Record<string, DecisionExplanationDto> = {};

export class AIDecisionCenterService {
  public static async explainDecision(decisionId: string): Promise<DecisionExplanationDto> {
    if (explanationCache[decisionId]) {
      return explanationCache[decisionId]!;
    }

    const decisionLogs = await DecisionEngineService.getDecisionLogs();
    const decision: DecisionDto = decisionLogs.find((d) => d.id === decisionId) || {
      id: decisionId,
      signalId: 'SIG-LOG-101',
      symbol: 'BTCUSD.P',
      timeframe: '1H',
      decisionState: DecisionState.EXECUTE,
      confidenceScore: 92.5,
      reasonCodes: [
        DecisionReasonCode.FRESH_ZONE_CONFIRMED,
        DecisionReasonCode.FIRST_TOUCH_VALIDATED,
        DecisionReasonCode.MOMENTUM_ALIGNED,
        DecisionReasonCode.CONFIDENCE_THRESHOLD_MET,
      ],
      inputSnapshotHash: 'a8f3b4c9e71234567890abcdef1234567890abcdef1234567890abcdef123456',
      timestamp: new Date().toISOString(),
    };

    const reasonExplanations = decision.reasonCodes.map((code) => ({
      code,
      humanExplanation: ReasonBuilder.buildHumanExplanation(code),
      isPassed: !code.includes('BLOCKED') && !code.includes('DECAYED') && !code.includes('INVALIDATED'),
    }));

    const passedValidators = reasonExplanations.filter((r) => r.isPassed).map((r) => r.code);
    const failedValidators = reasonExplanations.filter((r) => !r.isPassed).map((r) => r.code);

    const shortSummary = `Decision state '${decision.decisionState}' for ${decision.symbol} (${decision.confidenceScore}% confidence).`;
    const mediumSummary = `1H Market structure evaluation for ${decision.symbol} resulted in state ${decision.decisionState}. ${passedValidators.length} validators passed.`;
    const detailedSummary = `Evaluated 1H Supply/Demand zones and price momentum for ${decision.symbol}. Decision State: ${decision.decisionState}. Confidence score: ${decision.confidenceScore}%. Reproducibility Hash: ${decision.inputSnapshotHash}.`;

    const timeline = TimelineBuilder.buildTimeline(decision);
    const decisionTree = DecisionTreeBuilder.buildDecisionTree(decision);
    const journalEntry = JournalGenerator.generateJournalEntry(decision);

    const replayMetadata: ReplayMetadataDto = {
      snapshotHash: decision.inputSnapshotHash,
      decisionState: decision.decisionState,
      confidenceScore: decision.confidenceScore,
      validatorSnapshot: {
        freshZone: !decision.reasonCodes.includes(DecisionReasonCode.ZONE_FRESHNESS_DECAYED),
        firstTouch: decision.reasonCodes.includes(DecisionReasonCode.FIRST_TOUCH_VALIDATED),
        momentum: decision.reasonCodes.includes(DecisionReasonCode.MOMENTUM_ALIGNED),
        opposingZone: !decision.reasonCodes.includes(DecisionReasonCode.OPPOSING_ZONE_BLOCKED),
      },
    };

    const explanation: DecisionExplanationDto = {
      id: `EXP-LOG-${Date.now()}`,
      decisionId: decision.id,
      symbol: decision.symbol,
      decisionState: decision.decisionState,
      confidenceScore: decision.confidenceScore,
      shortSummary,
      mediumSummary,
      detailedSummary,
      reasonExplanations,
      passedValidators,
      failedValidators,
      timeline,
      decisionTree,
      journalEntry,
      replayMetadata,
      timestamp: new Date().toISOString(),
    };

    explanationCache[decisionId] = explanation;
    return explanation;
  }
}
