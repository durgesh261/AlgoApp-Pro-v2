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

export interface AiScoringFactor {
  name: string;
  maxScore: number;
  score: number;
  passed: boolean;
  explanation: string;
}

export interface AiScoringBreakdownDto {
  trendScore: AiScoringFactor; // 15 pts max
  obFreshnessScore: AiScoringFactor; // 15 pts max
  firstTouchScore: AiScoringFactor; // 15 pts max
  marketStructureScore: AiScoringFactor; // 15 pts max
  liquiditySweepScore: AiScoringFactor; // 10 pts max
  premDiscScore: AiScoringFactor; // 10 pts max
  sessionScore: AiScoringFactor; // 5 pts max
  riskRewardScore: AiScoringFactor; // 10 pts max
  newsScore: AiScoringFactor; // 5 pts max
  totalScore: number; // 0 - 100
  threshold: number; // 85
  isApproved: boolean;
}

export interface AIValidationResultDto {
  approved: boolean;
  confidenceScore: number;
  breakdown: AiScoringBreakdownDto;
  reasonCodes: DecisionReasonCode[];
  rationale: string;
  evaluatedAt: string;
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
  aiBreakdown?: AiScoringBreakdownDto | undefined;
  timestamp: string;
}

