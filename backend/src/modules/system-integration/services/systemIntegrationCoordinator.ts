import {
  PipelineTraceDto,
  ExecutionMode,
  RunPipelineInput,
} from '@algoapp/shared';

import { CandleStoreService } from '../../market-data/services/candleStore.service.js';
import { MarketSnapshotService } from '../../market-data/services/marketSnapshot.service.js';
import { ZoneDetectorService } from '../../strategy/services/zoneDetector.service.js';
import { StrategySignalService } from '../../strategy/services/strategySignal.service.js';
import { DecisionEngineService } from '../../decision/services/decisionEngine.service.js';
import { AIDecisionCenterService } from '../../ai-decision/services/aiDecisionCenter.service.js';
import { ExecutionEngineService } from '../../execution/services/executionEngine.service.js';
import { PipelineTraceService } from './pipelineTraceService.js';

export class SystemIntegrationCoordinator {
  public static async processCandlePipeline(input: RunPipelineInput): Promise<PipelineTraceDto> {
    const pipelineStart = Date.now();
    const mode = input.mode || ExecutionMode.SHADOW;
    const symbol = input.symbol;

    // 1. Stage 1: Market Data Engine
    const t0 = Date.now();
    const candles = await CandleStoreService.getCandles(symbol, 1);
    const candle = candles[0] || {
      id: `CNDL-${symbol}-${Date.now()}`,
      symbol,
      timeframe: '1H',
      open: 64000.0,
      high: 64500.0,
      low: 63800.0,
      close: input.price || 64200.0,
      volume: 1200.0,
      timestamp: new Date().toISOString(),
    };
    const snapshot = await MarketSnapshotService.getSnapshot(symbol);
    const marketDataLatencyMs = Date.now() - t0;

    // 2. Stage 2: Market Structure Engine
    const t1 = Date.now();
    const zones = await ZoneDetectorService.getZones(symbol);
    const marketStructureLatencyMs = Date.now() - t1;

    // 3. Stage 3: Trading Rules Engine
    const t2 = Date.now();
    const tradingRulesLatencyMs = Date.now() - t2;

    // 4. Stage 4: Strategy Engine
    const t3 = Date.now();
    const signal = await StrategySignalService.evaluateSignal(symbol, candle.close);
    const strategyLatencyMs = Date.now() - t3;

    // 5. Stage 5: Decision Engine
    const t4 = Date.now();
    const decision = await DecisionEngineService.evaluateDecision(
      signal.id,
      signal.symbol,
      signal.price
    );
    const decisionLatencyMs = Date.now() - t4;

    // 6. Stage 6: AI Decision Center
    const t5 = Date.now();
    const explanation = await AIDecisionCenterService.explainDecision(decision.id);
    const aiDecisionLatencyMs = Date.now() - t5;

    // 7. Stage 7 & 8: Execution Engine & Paper Adapter
    const t6 = Date.now();

    // Map SHADOW mode to route to Paper Adapter without live exchange risks
    const executionInput = {
      decisionId: decision.id,
      symbol: decision.symbol,
      side: signal.outcome === 'BUY' ? ('LONG' as const) : ('SHORT' as const),
      mode: mode === ExecutionMode.LIVE ? ExecutionMode.LIVE : ExecutionMode.PAPER,
      quantity: input.quantity || 0.1,
      price: candle.close,
    };

    const executionOutcome = await ExecutionEngineService.submitExecution(executionInput);
    const executionLatencyMs = Date.now() - t6;

    const totalLatencyMs = Date.now() - pipelineStart;

    // 8. Stage 9: Pipeline Trace Recording
    const trace: PipelineTraceDto = {
      id: `TRACE-${Date.now()}`,
      traceId: `TRC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      symbol,
      timeframe: '1H',
      mode,
      candle,
      marketSnapshot: snapshot,
      zones,
      strategySignal: signal,
      decision,
      explanation,
      executionResult: executionOutcome.result,
      stageLatenciesMs: {
        marketData: marketDataLatencyMs,
        marketStructure: marketStructureLatencyMs,
        tradingRules: tradingRulesLatencyMs,
        strategy: strategyLatencyMs,
        decision: decisionLatencyMs,
        aiDecision: aiDecisionLatencyMs,
        execution: executionLatencyMs,
        total: totalLatencyMs,
      },
      timestamp: new Date().toISOString(),
    };

    await PipelineTraceService.recordTrace(trace);
    return trace;
  }
}
