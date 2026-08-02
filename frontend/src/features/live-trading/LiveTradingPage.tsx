import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { executionApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { ExecutionMode } from '@algoapp/shared';
import { CurrentPairWidget } from '../../components/widgets/CurrentPairWidget';
import { 
  Activity, 
  Play, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  List,
  AlertTriangle,
  Zap,
  ArrowRight
} from 'lucide-react';

export const LiveTradingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSymbol } = useTerminalStore();
  const { addToast } = useToastStore();

  const [mode, setMode] = useState<ExecutionMode>(ExecutionMode.PAPER);
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [quantity, setQuantity] = useState('0.1');

  const { data: sessionsData } = useQuery({
    queryKey: ['executionSessions'],
    queryFn: executionApi.getSessions,
  });

  const { data: resultsData } = useQuery({
    queryKey: ['executionResults'],
    queryFn: executionApi.getResults,
  });

  const { data: journalData } = useQuery({
    queryKey: ['executionJournal'],
    queryFn: executionApi.getJournal,
  });

  const submitExecutionMutation = useMutation({
    mutationFn: executionApi.submitExecution,
    onSuccess: (res) => {
      addToast(
        'Execution Session Dispatched',
        `Session: ${res.data.session.id} | Status: ${res.data.result.status} (${res.data.result.observability.totalLifecycleTimeMs}ms)`,
        res.data.result.status === 'FILLED' ? 'success' : 'warning'
      );
      queryClient.invalidateQueries({ queryKey: ['executionSessions'] });
      queryClient.invalidateQueries({ queryKey: ['executionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['executionResults'] });
      queryClient.invalidateQueries({ queryKey: ['executionJournal'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitExecutionMutation.mutate({
      decisionId: `DEC-MANUAL-${Date.now()}`,
      symbol: activeSymbol,
      side,
      mode,
      quantity: parseFloat(quantity),
    });
  };

  const sessions = sessionsData?.data || [];
  const results = resultsData?.data || [];
  const journal = journalData?.data || [];
  const activeSession = sessions[0];
  const latestResult = results[0];

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
            Execution Engine & State Machine Coordinator
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Single coordinator responsible for routing approved decisions to execution adapters via deterministic state machine.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs text-[#3B82F6]">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>SESSION ID: {activeSession?.id ?? 'NO_ACTIVE_SESSION'}</span>
        </div>
      </div>

      <CurrentPairWidget />

      {/* State Machine Transition Diagram */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Execution State Machine Pipeline
            </h3>
          </div>
          <span className="text-[10px] text-[#94A3B8]">DETERMINISTIC TRANSITION PIPELINE</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0B0E14] border border-[#1E293B] p-3 rounded-xl text-xs font-bold">
          <span className="px-3 py-1 bg-[#1E293B] text-[#94A3B8] rounded border border-[#334155]">1. QUEUED</span>
          <ArrowRight className="w-4 h-4 text-[#334155]" />
          <span className="px-3 py-1 bg-[#1E293B] text-[#3B82F6] rounded border border-[#3B82F6]/30">2. VALIDATED</span>
          <ArrowRight className="w-4 h-4 text-[#334155]" />
          <span className="px-3 py-1 bg-[#1E293B] text-[#F59E0B] rounded border border-[#F59E0B]/30">3. SUBMITTED</span>
          <ArrowRight className="w-4 h-4 text-[#334155]" />
          <span className="px-3 py-1 bg-[#00C896]/20 text-[#00C896] rounded border border-[#00C896]/40">4. FILLED</span>
        </div>
      </div>

      {/* Execution Dispatcher Form */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Execution Dispatcher & Mode Selector — {activeSymbol}
            </h3>
          </div>
          <span className="text-[10px] bg-[#1E293B] text-[#00C896] px-2 py-0.5 rounded font-bold">
            ADAPTER: {mode === ExecutionMode.LIVE ? 'DELTA_ADAPTER' : 'PAPER_ADAPTER'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs items-end">
          <div className="space-y-1">
            <label className="text-[#94A3B8] text-[11px] block">Execution Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ExecutionMode)}
              className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-1.5 text-[#F8FAFC] font-mono outline-none"
            >
              <option value={ExecutionMode.PAPER}>PAPER (Simulated)</option>
              <option value={ExecutionMode.LIVE}>LIVE (Delta Exchange Adapter)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[#94A3B8] text-[11px] block">Order Side</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as 'LONG' | 'SHORT')}
              className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-1.5 text-[#F8FAFC] font-mono outline-none"
            >
              <option value="LONG">LONG (Buy)</option>
              <option value="SHORT">SHORT (Sell)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[#94A3B8] text-[11px] block">Quantity</label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-1.5 text-[#F8FAFC] font-mono outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitExecutionMutation.isPending}
            className="w-full py-2 bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 shadow-md"
          >
            <Play className="w-4 h-4" />
            <span>{submitExecutionMutation.isPending ? 'DISPATCHING...' : 'DISPATCH EXECUTION'}</span>
          </button>
        </form>

        {mode === ExecutionMode.LIVE && (
          <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-2.5 rounded-lg flex items-center space-x-2 text-xs text-[#F59E0B]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Note: Delta Live Exchange adapter is currently inactive in simulation mode. Live requests will return REJECTED status.</span>
          </div>
        )}
      </div>

      {/* Latency & Observability Cards */}
      {latestResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Validation Latency</span>
            <div className="text-sm font-bold text-[#3B82F6] mt-0.5">{latestResult.observability.validationLatencyMs}ms</div>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Adapter Latency</span>
            <div className="text-sm font-bold text-[#00C896] mt-0.5">{latestResult.observability.adapterLatencyMs}ms</div>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Queue Latency</span>
            <div className="text-sm font-bold text-[#F59E0B] mt-0.5">{latestResult.observability.queueTimeMs}ms</div>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Total Lifecycle Time</span>
            <div className="text-sm font-bold text-[#F8FAFC] mt-0.5">{latestResult.observability.totalLifecycleTimeMs}ms</div>
          </div>
        </div>
      )}

      {/* Execution Results & Journal Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Results Stream */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                Execution Results Stream ({results.length})
              </h3>
            </div>
            <span className="text-[10px] text-[#94A3B8]">ADAPTER RESPONSES</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#64748B]">No execution results yet.</div>
            ) : (
              results.map((res) => (
                <div key={res.id} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3B82F6]">{res.adapter}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        res.status === 'FILLED'
                          ? 'bg-[#00C896]/20 text-[#00C896]'
                          : res.status === 'REJECTED'
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                          : 'bg-[#F6465D]/20 text-[#F6465D]'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#94A3B8]">
                    <span>Fill Price: ${res.fillPrice?.toLocaleString() ?? 'N/A'}</span>
                    <span>Total Latency: {res.observability.totalLifecycleTimeMs}ms</span>
                  </div>
                  {res.message && <div className="text-[10px] text-[#64748B]">{res.message}</div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Execution Journal Log */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center space-x-2">
              <List className="w-4 h-4 text-[#3B82F6]" />
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                Execution Journal Stream ({journal.length})
              </h3>
            </div>
            <span className="text-[10px] text-[#94A3B8]">STATE MACHINE AUDIT</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {journal.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#64748B]">No journal entries logged.</div>
            ) : (
              journal.map((j) => (
                <div key={j.id} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAFC]">{j.action}</span>
                    <span className="text-[10px] text-[#64748B]">{j.latencyMs}ms</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">{j.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
