import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { strategyApi, decisionApi, aiDecisionApi, marketDataApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { CurrentPairWidget } from '../../components/widgets/CurrentPairWidget';
import { DecisionState } from '@algoapp/shared';
import { 
  LineChart, 
  Layers, 
  Radio, 
  Compass, 
  ShieldCheck,
  Zap,
  Cpu,
  CheckCircle2,
  AlertOctagon,
  Clock,
  BookOpen,
  Search,
  Database
} from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSymbol } = useTerminalStore();
  const { addToast } = useToastStore();

  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  const { data: snapshotData } = useQuery({
    queryKey: ['marketSnapshot', activeSymbol],
    queryFn: () => marketDataApi.getSnapshot(activeSymbol),
  });

  const { data: candlesData } = useQuery({
    queryKey: ['marketCandles', activeSymbol],
    queryFn: () => marketDataApi.getCandles(activeSymbol, 20),
  });

  const { data: zonesData } = useQuery({
    queryKey: ['strategyZones', activeSymbol],
    queryFn: () => strategyApi.getZones(activeSymbol),
  });

  const { data: signalsData } = useQuery({
    queryKey: ['strategySignals'],
    queryFn: strategyApi.getSignals,
  });

  const { data: decisionsData } = useQuery({
    queryKey: ['decisionLogs'],
    queryFn: decisionApi.getLogs,
  });

  const { data: explanationData } = useQuery({
    queryKey: ['aiExplanation', selectedDecisionId],
    queryFn: () => aiDecisionApi.explainDecision({ decisionId: selectedDecisionId! }),
    enabled: !!selectedDecisionId,
  });

  const evalSignalMutation = useMutation({
    mutationFn: strategyApi.evaluateSignal,
    onSuccess: (res) => {
      addToast('Strategy Signal Evaluated', `Outcome: ${res.data.outcome} (${res.data.confidenceScore}%)`, 'info');
      queryClient.invalidateQueries({ queryKey: ['strategySignals'] });
    },
  });

  const evalDecisionMutation = useMutation({
    mutationFn: decisionApi.evaluateDecision,
    onSuccess: (res) => {
      addToast('Decision Evaluated', `State: ${res.data.decisionState} (${res.data.confidenceScore}%)`, 'success');
      setSelectedDecisionId(res.data.id);
      queryClient.invalidateQueries({ queryKey: ['decisionLogs'] });
    },
  });

  const snapshot = snapshotData?.data;
  const candles = candlesData?.data || [];
  const zones = zonesData?.data || [];
  const signals = signalsData?.data || [];
  const decisions = decisionsData?.data || [];
  const explanation = explanationData?.data;

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
            <LineChart className="w-5 h-5 text-[#3B82F6]" />
            Market Data & Decision Inspector Terminal
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Normalized Market Data (1H) → 1H Market Structure → Strategy Signals → Decision Engine → AI Inspector.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs text-[#3B82F6]">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>CANONICAL 1H MARKET DATA ONLINE</span>
        </div>
      </div>

      <CurrentPairWidget />

      {/* Market Data Inspector Banner */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Market Data Snapshot — {activeSymbol}
            </h3>
          </div>
          <span className="text-[10px] bg-[#1E293B] text-[#3B82F6] px-2 py-0.5 rounded font-bold">
            SESSION: {snapshot?.session ?? 'NEW_YORK'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg">
            <span className="text-[10px] text-[#94A3B8] block">Current Mark Price</span>
            <span className="text-sm font-bold text-[#F8FAFC]">${snapshot?.currentPrice.toLocaleString() ?? '64,250.00'}</span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg">
            <span className="text-[10px] text-[#94A3B8] block">Spread</span>
            <span className="text-sm font-bold text-[#00C896]">${snapshot?.spread ?? 0.5}</span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg">
            <span className="text-[10px] text-[#94A3B8] block">Trend Bias</span>
            <span className="text-sm font-bold text-[#3B82F6]">{snapshot?.trend ?? 'BULLISH'}</span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg">
            <span className="text-[10px] text-[#94A3B8] block">Volatility</span>
            <span className="text-sm font-bold text-[#F59E0B]">{snapshot?.volatility ?? 'MEDIUM'}</span>
          </div>
        </div>

        {/* Historical Candle Table */}
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-xs select-none">
            <thead>
              <tr className="bg-[#1E2638] text-[#94A3B8] uppercase text-[10px] border-b border-[#1E293B] h-8">
                <th className="px-3 text-left">Timestamp</th>
                <th className="px-3 text-right">Open</th>
                <th className="px-3 text-right">High</th>
                <th className="px-3 text-right">Low</th>
                <th className="px-3 text-right">Close</th>
                <th className="px-3 text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {candles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-[#64748B]">No 1H candles loaded.</td>
                </tr>
              ) : (
                candles.map((c) => (
                  <tr key={c.id} className="hover:bg-[#28334A] h-8 transition-colors text-[11px]">
                    <td className="px-3 text-[#94A3B8]">{c.timestamp}</td>
                    <td className="px-3 text-right text-[#F8FAFC]">${c.open.toLocaleString()}</td>
                    <td className="px-3 text-right text-[#00C896]">${c.high.toLocaleString()}</td>
                    <td className="px-3 text-right text-[#F6465D]">${c.low.toLocaleString()}</td>
                    <td className="px-3 text-right font-bold text-[#F8FAFC]">${c.close.toLocaleString()}</td>
                    <td className="px-3 text-right text-[#94A3B8]">{c.volume.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Inspector Panel (If selected) */}
      {explanation && (
        <div className="bg-[#161D2A] border border-[#3B82F6]/40 rounded-xl p-4 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#3B82F6]" />
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                Decision Inspector Panel — {explanation.symbol}
              </h3>
            </div>
            <span className="text-[10px] bg-[#00C896]/20 text-[#00C896] px-2.5 py-0.5 rounded font-bold">
              STATE: {explanation.decisionState} ({explanation.confidenceScore}%)
            </span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg text-xs space-y-1">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Detailed Explanation Summary</span>
            <p className="text-[#F8FAFC] leading-relaxed">{explanation.detailedSummary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timeline Viewer */}
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3.5 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
                <Clock className="w-4 h-4 text-[#3B82F6]" />
                <h4 className="text-xs font-bold text-[#F8FAFC] uppercase">Chronological Decision Timeline</h4>
              </div>
              <div className="space-y-2 text-xs">
                {explanation.timeline.map((step) => (
                  <div key={step.stepIndex} className="flex items-start space-x-2.5">
                    <span className="text-[10px] bg-[#1E293B] text-[#3B82F6] px-1.5 py-0.5 rounded font-bold mt-0.5">
                      #{step.stepIndex}
                    </span>
                    <div>
                      <span className="font-bold text-[#F8FAFC] block">{step.stage}</span>
                      <span className="text-[#94A3B8] text-[11px] block">{step.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Human Reason Cards */}
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3.5 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
                <BookOpen className="w-4 h-4 text-[#00C896]" />
                <h4 className="text-xs font-bold text-[#F8FAFC] uppercase">Human Reason Cards</h4>
              </div>
              <div className="space-y-2 text-xs">
                {explanation.reasonExplanations.map((r) => (
                  <div key={r.code} className="bg-[#161D2A] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#3B82F6]">{r.code}</span>
                      <span className="text-[9px] bg-[#00C896]/15 text-[#00C896] px-1.5 py-0.5 rounded font-bold">
                        {r.isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8]">{r.humanExplanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Replay Metadata Footer */}
          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#94A3B8]">Replay Snapshot Hash: <strong className="text-[#F8FAFC]">{explanation.replayMetadata.snapshotHash}</strong></span>
            <span className="text-[#00C896]">REPLAY METADATA PERSISTED</span>
          </div>
        </div>
      )}

      {/* Decision Engine Master Banner */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Deterministic Decision Engine Pipeline
            </h3>
          </div>
          <span className="text-[10px] bg-[#3B82F6]/15 text-[#3B82F6] px-2.5 py-0.5 rounded font-bold">
            REPRODUCIBLE EVALUATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase block">Latest Decision</span>
              <span className="text-sm font-bold text-[#00C896]">
                {decisions[0]?.decisionState ?? 'EXECUTE'}
              </span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#00C896]" />
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase block">Confidence Score</span>
              <span className="text-sm font-bold text-[#3B82F6]">
                {decisions[0]?.confidenceScore ?? 92.5}%
              </span>
            </div>
            <Zap className="w-5 h-5 text-[#3B82F6]" />
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase block">Reason Codes</span>
              <span className="text-xs font-bold text-[#F59E0B]">
                {decisions[0]?.reasonCodes.length ?? 4} Active Rules
              </span>
            </div>
            <Compass className="w-5 h-5 text-[#F59E0B]" />
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase block">Execution Status</span>
              <span className="text-xs font-bold text-[#94A3B8]">NO AUTO EXECUTION</span>
            </div>
            <AlertOctagon className="w-5 h-5 text-[#64748B]" />
          </div>
        </div>
      </div>

      {/* 1H Supply & Demand Zone Monitor */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              1H Supply & Demand Zones — {activeSymbol} ({zones.length})
            </h3>
          </div>
          <span className="text-[10px] bg-[#1E293B] text-[#3B82F6] px-2 py-0.5 rounded font-bold">
            TIMEFRAME: 1H
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {zones.length === 0 ? (
            <div className="col-span-2 p-6 text-center text-xs text-[#64748B]">No active 1H zones detected.</div>
          ) : (
            zones.map((z) => (
              <div
                key={z.id}
                className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                  z.type === 'SUPPLY'
                    ? 'bg-[#F6465D]/5 border-[#F6465D]/30'
                    : 'bg-[#00C896]/5 border-[#00C896]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        z.type === 'SUPPLY' ? 'bg-[#F6465D]/20 text-[#F6465D]' : 'bg-[#00C896]/20 text-[#00C896]'
                      }`}
                    >
                      1H {z.type}
                    </span>
                    <span className="text-xs font-bold text-[#F8FAFC]">{z.symbol}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-[#1E293B] text-[#3B82F6] px-2 py-0.5 rounded font-bold">
                      {z.source}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        z.status === 'FRESH'
                          ? 'bg-[#00C896]/15 text-[#00C896]'
                          : z.status === 'TOUCHED'
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                          : 'bg-[#F6465D]/15 text-[#F6465D]'
                      }`}
                    >
                      {z.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#94A3B8]">Price Range:</span>
                  <span className="text-[#F8FAFC]">
                    ${z.lowerPrice.toLocaleString()} — ${z.upperPrice.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] pt-2 border-t border-[#1E293B]/50 text-[#94A3B8]">
                  <div>Strength: <strong className="text-[#00C896]">{z.strength}/100</strong></div>
                  <div>Width: <strong className="text-[#F8FAFC]">${z.width}</strong></div>
                  <div>Touches: <strong className="text-[#F59E0B]">{z.touchCount}</strong></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Decision Engine Logs Stream & Evaluator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Action Controls */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
            <Compass className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Decision Generator
            </h3>
          </div>

          <p className="text-xs text-[#94A3B8]">
            Evaluates Strategy Signals through the Decision Validator Pipeline to produce structured reason codes and decision state (`EXECUTE`, `WAIT`, `SKIP`, `INVALID`).
          </p>

          <button
            onClick={() => evalSignalMutation.mutate({ symbol: activeSymbol, currentPrice: 64250.0, timeframe: '1H' })}
            disabled={evalSignalMutation.isPending}
            className="w-full py-2 bg-[#1E293B] hover:bg-[#28334A] text-[#F8FAFC] rounded-lg font-bold text-xs transition-colors flex items-center justify-center space-x-2 border border-[#334155]"
          >
            <Radio className="w-4 h-4 text-[#3B82F6]" />
            <span>{evalSignalMutation.isPending ? 'EVALUATING...' : `EVALUATE SIGNAL (${activeSymbol})`}</span>
          </button>

          <button
            onClick={() => evalDecisionMutation.mutate({ signalId: signals[0]?.id || 'SIG-LOG-101', symbol: activeSymbol, currentPrice: 64250.0, timeframe: '1H' })}
            disabled={evalDecisionMutation.isPending}
            className="w-full py-2.5 bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] rounded-lg font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md"
          >
            <Cpu className="w-4 h-4" />
            <span>{evalDecisionMutation.isPending ? 'RUNNING DECISION ENGINE...' : `RUN DECISION ENGINE (${activeSymbol})`}</span>
          </button>
        </div>

        {/* Decision Stream */}
        <div className="lg:col-span-2 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#00C896]" />
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                Decision Audit Logs Stream ({decisions.length})
              </h3>
            </div>
            <span className="text-[10px] text-[#94A3B8]">CLICK TO INSPECT EXPLANATION</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                onClick={() => setSelectedDecisionId(dec.id)}
                className={`bg-[#0B0E14] border p-3 rounded-lg space-y-2 text-xs cursor-pointer transition-all ${
                  selectedDecisionId === dec.id ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]' : 'border-[#1E293B] hover:border-[#334155]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        dec.decisionState === DecisionState.EXECUTE
                          ? 'bg-[#00C896]/20 text-[#00C896]'
                          : dec.decisionState === DecisionState.WAIT
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                          : dec.decisionState === DecisionState.SKIP
                          ? 'bg-[#3B82F6]/20 text-[#3B82F6]'
                          : 'bg-[#F6465D]/20 text-[#F6465D]'
                      }`}
                    >
                      {dec.decisionState}
                    </span>
                    <span className="font-bold text-[#F8FAFC]">{dec.symbol}</span>
                    <span className="text-[10px] text-[#94A3B8]">Signal ID: {dec.signalId}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="text-[#3B82F6] font-bold">{dec.confidenceScore}% Score</span>
                    <Search className="w-3.5 h-3.5 text-[#3B82F6]" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dec.reasonCodes.map((code) => (
                    <span
                      key={code}
                      className="text-[9px] bg-[#1E293B] border border-[#334155] text-[#94A3B8] px-2 py-0.5 rounded font-mono"
                    >
                      {code}
                    </span>
                  ))}
                </div>

                <div className="text-[9px] text-[#64748B] font-mono truncate">
                  Hash: {dec.inputSnapshotHash}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
