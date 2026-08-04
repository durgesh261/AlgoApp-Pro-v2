import { DecisionState, DecisionReasonCode } from './decision.js';

export interface DecisionTimelineStep {
  stepIndex: number;
  stage: string;
  status: 'PASS' | 'FAIL' | 'INFO';
  description: string;
  timestamp: string;
}

export interface DecisionTreeNode {
  nodeId: string;
  label: string;
  condition: string;
  result: 'YES' | 'NO' | 'PASS' | 'FAIL' | 'PENDING';
  children?: DecisionTreeNode[] | undefined;
}

export interface JournalEntryDto {
  title: string;
  summary: string;
  details: string;
  reasonCodes: DecisionReasonCode[];
  timelineSummary: string;
}

export interface ReplayMetadataDto {
  snapshotHash: string;
  decisionState: DecisionState;
  confidenceScore: number;
  validatorSnapshot: Record<string, boolean>;
}

export interface DecisionExplanationDto {
  id: string;
  decisionId: string;
  symbol: string;
  decisionState: DecisionState;
  confidenceScore: number;
  shortSummary: string;
  mediumSummary: string;
  detailedSummary: string;
  reasonExplanations: Array<{ code: DecisionReasonCode; humanExplanation: string; isPassed: boolean }>;
  passedValidators: string[];
  failedValidators: string[];
  timeline: DecisionTimelineStep[];
  decisionTree: DecisionTreeNode;
  journalEntry: JournalEntryDto;
  replayMetadata: ReplayMetadataDto;
  timestamp: string;
}
