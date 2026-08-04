import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemIntegrationApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { ExecutionMode, PipelineTraceDto } from '@algoapp/shared';
import { 
  Activity, 
  Play, 
  ShieldCheck, 
  CheckCircle2, 
  List, 
  ArrowRight,
  Eye,
  Server,
  X
} from 'lucide-react';

export const SystemMonitorPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSymbol } = useTerminalStore();
  const { addToast } = useToastStore();

  const [selectedTrace, setSelectedTrace] = useState<PipelineTraceDto | null>(null);

  const { data: overviewData } = useQuery({
    queryKey: ['systemHealthOverview'],
    queryFn: systemIntegrationApi.getHealthOverview,
    refetchInterval: 3000,
  });

  const { data: tracesData } = useQuery({
    queryKey: ['pipelineTraces'],
    queryFn: systemIntegrationApi.getTraces,
    refetchInterval: 3000,
  });

  const runPipelineMutation = useMutation({
    mutationFn: systemIntegrationApi.runPipeline,
    onSuccess: (res) => {
      addToast(
        'Pipeline Processing Complete',
        `Trace: ${res.data.traceId} | Decision: ${res.data.decision.decisionState} (${res.data.stageLatenciesMs.total}ms)`,
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['systemHealthOverview'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineTraces'] });
    },
  });

  const handleRunPipeline = () => {
    runPipelineMutation.mutate({
      symbol: activeSymbol,
      timeframe: '1H',
      mode: ExecutionMode.SHADOW,
    });
  };

  const overview = overviewData?.data;
  const traces = tracesData?.data || [];

  const pipelineStages = [
    'TradingView Adapter',
    'Market Data',
    'Market Structure',
    'Trading Rules',
    'Strategy Engine',
    'Decision Engine',
    'AI Center',
    'Execution Engine',
    'Paper Adapter',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6 font-mono select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3B82F6]" />
            System Integration & Shadow Mode Monitor
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Single coordinator orchestrating end-to-end pipeline execution from TradingView webhook to Paper Adapter.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs text-[#3B82F6]">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>SHADOW MODE ACTIVE</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Active Execution Mode</span>
          <div className="text-sm font-bold text-[#00C896] mt-0.5">{overview?.mode ?? 'SHADOW'}</div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Total Pipeline Traces</span>
          <div className="text-sm font-bold text-[#F8FAFC] mt-0.5">{overview?.totalTraces ?? 0}</div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Avg Pipeline Latency</span>
          <div className="text-sm font-bold text-[#3B82F6] mt-0.5">{overview?.averagePipelineLatencyMs ?? 0}ms</div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Paper Order Fills</span>
          <div className="text-sm font-bold text-[#00C896] mt-0.5">{overview?.successfulExecutions ?? 0}</div>
        </div>
      </div>

      {/* 9-Stage Pipeline Visualization */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              9-Stage System Integration Pipeline — {activeSymbol}
            </h3>
          </div>
          <button
            onClick={handleRunPipeline}
            disabled={runPipelineMutation.isPending}
            className="px-3 py-1 bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] font-bold rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{runPipelineMutation.isPending ? 'RUNNING...' : 'TRIGGER PIPELINE'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1.5 bg-[#0B0E14] border border-[#1E293B] p-3 rounded-xl text-[11px] font-bold">
          {pipelineStages.map((stage, idx) => (
            <React.Fragment key={stage}>
              <div className="px-2.5 py-1 bg-[#1E293B] text-[#F8FAFC] rounded border border-[#3B82F6]/30 flex flex-col items-center">
                <span className="text-[9px] text-[#3B82F6]">STAGE {idx + 1}</span>
                <span>{stage}</span>
              </div>
              {idx < pipelineStages.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-[#334155]" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 9-Module System Health Grid */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              9-Module System Health Status Grid
            </h3>
          </div>
          <span className="text-[10px] text-[#94A3B8]">DETERMINISTIC MODULE STATUS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {overview?.modulesHealth.map((mod) => (
            <div key={mod.name} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F8FAFC]">{mod.name}</span>
                <span className="text-[9px] bg-[#00C896]/20 text-[#00C896] font-bold px-1.5 py-0.5 rounded">
                  {mod.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                <span>Latency: {mod.latencyMs}ms</span>
                <span>{mod.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traces Audit Stream */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <List className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Pipeline Trace History Stream ({traces.length})
            </h3>
          </div>
          <span className="text-[10px] text-[#94A3B8]">FULL LIFE-CYCLE TRACES</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {traces.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#64748B]">No pipeline traces generated yet. Trigger pipeline above.</div>
          ) : (
            traces.map((tr) => (
              <div key={tr.id} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3B82F6]">{tr.traceId} — {tr.symbol}</span>
                  <span className="text-[10px] bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded font-bold">
                    DECISION: {tr.decision.decisionState} ({tr.decision.confidenceScore}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                  <span>Signal: {tr.strategySignal.outcome}</span>
                  <span>Total Latency: {tr.stageLatenciesMs.total}ms</span>
                  <button
                    onClick={() => setSelectedTrace(tr)}
                    className="text-[#00C896] hover:underline font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> Inspect Trace
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trace Inspector Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl max-w-2xl w-full p-5 space-y-4 font-mono shadow-2xl text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="font-bold text-[#F8FAFC] text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00C896]" />
                Trace Inspector — {selectedTrace.traceId} ({selectedTrace.symbol})
              </h3>
              <button onClick={() => setSelectedTrace(null)} className="text-[#94A3B8] hover:text-[#F8FAFC]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[11px]">
              <div className="bg-[#0B0E14] p-3 rounded-lg border border-[#1E293B] space-y-1">
                <span className="text-[#3B82F6] font-bold">1. CANNONICAL CANDLE</span>
                <div>Price: ${selectedTrace.candle.close} | Vol: {selectedTrace.candle.volume}</div>
              </div>

              <div className="bg-[#0B0E14] p-3 rounded-lg border border-[#1E293B] space-y-1">
                <span className="text-[#3B82F6] font-bold">2. STRATEGY SIGNAL & DECISION</span>
                <div>Signal: {selectedTrace.strategySignal.outcome} | Decision: {selectedTrace.decision.decisionState} ({selectedTrace.decision.confidenceScore}%)</div>
                <div className="text-[#94A3B8] text-[10px]">Reason Codes: {selectedTrace.decision.reasonCodes.join(', ')}</div>
              </div>

              <div className="bg-[#0B0E14] p-3 rounded-lg border border-[#1E293B] space-y-1">
                <span className="text-[#3B82F6] font-bold">3. DETERMINISTIC AI EXPLANATION</span>
                <p className="text-[#F8FAFC]">{selectedTrace.explanation.shortSummary}</p>
              </div>

              <div className="bg-[#0B0E14] p-3 rounded-lg border border-[#1E293B] space-y-1">
                <span className="text-[#3B82F6] font-bold">4. EXECUTION RESULT (PAPER ADAPTER)</span>
                <div>Adapter: {selectedTrace.executionResult.adapter} | Status: {selectedTrace.executionResult.status}</div>
                <div>Message: {selectedTrace.executionResult.message}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1E293B]">
              <button
                onClick={() => setSelectedTrace(null)}
                className="px-4 py-1.5 bg-[#1E293B] text-[#F8FAFC] rounded font-bold hover:bg-[#334155]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
