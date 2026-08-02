import { CandleDto, MarketSnapshotDto } from './marketData.js';
import { StrategySignalDto, ZoneDto } from './strategy.js';
import { DecisionDto } from './decision.js';
import { DecisionExplanationDto } from './aiDecision.js';
import { ExecutionResultDto, ExecutionMode } from './execution.js';

export interface PipelineStageLatencyDto {
  marketData: number;
  marketStructure: number;
  tradingRules: number;
  strategy: number;
  decision: number;
  aiDecision: number;
  execution: number;
  total: number;
}

export interface PipelineTraceDto {
  id: string;
  traceId: string;
  symbol: string;
  timeframe: '1H';
  mode: ExecutionMode;
  candle: CandleDto;
  marketSnapshot: MarketSnapshotDto;
  zones: ZoneDto[];
  strategySignal: StrategySignalDto;
  decision: DecisionDto;
  explanation: DecisionExplanationDto;
  executionResult: ExecutionResultDto;
  stageLatenciesMs: PipelineStageLatencyDto;
  timestamp: string;
}

export interface ModuleHealthDto {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  latencyMs: number;
  lastActive: string;
  message?: string | undefined;
}

export interface SystemMonitorOverviewDto {
  mode: ExecutionMode;
  isShadowModeActive: boolean;
  modulesHealth: ModuleHealthDto[];
  totalTraces: number;
  averagePipelineLatencyMs: number;
  successfulExecutions: number;
  rejectedExecutions: number;
  updatedAt: string;
}

export interface RunPipelineInput {
  symbol: string;
  timeframe?: '1H' | undefined;
  mode?: ExecutionMode | undefined;
  price?: number | undefined;
  quantity?: number | undefined;
}
