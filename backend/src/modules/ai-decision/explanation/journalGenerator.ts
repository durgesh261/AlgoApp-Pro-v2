import { DecisionDto, JournalEntryDto } from '@algoapp/shared';
import { ReasonBuilder } from './reasonBuilder.js';

export class JournalGenerator {
  public static generateJournalEntry(decision: DecisionDto): JournalEntryDto {
    const title = `[1H Market Decision] ${decision.symbol} — State: ${decision.decisionState}`;
    const summary = `Decision Engine emitted state '${decision.decisionState}' with ${decision.confidenceScore}% confidence score.`;
    
    const details = decision.reasonCodes
      .map((rc) => `- ${rc}: ${ReasonBuilder.buildHumanExplanation(rc)}`)
      .join('\n');

    const timelineSummary = `Evaluated 6-stage pipeline for ${decision.symbol} on 1H timeframe. Input snapshot hash: ${decision.inputSnapshotHash.substring(0, 12)}...`;

    return {
      title,
      summary,
      details,
      reasonCodes: decision.reasonCodes,
      timelineSummary,
    };
  }
}
