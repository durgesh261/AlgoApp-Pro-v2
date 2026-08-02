import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { executionApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { ExecutionMode } from '@algoapp/shared';
import { CurrentPairWidget } from '../../components/widgets/CurrentPairWidget';
import { TradingViewConnectionPanel } from '../tradingview/TradingViewConnectionPanel';
import { DeltaConnectionPanel } from './DeltaConnectionPanel';
import { 
  Activity, 
  Play, 
  ShieldCheck, 
  Cpu, 
  List,
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
      decisionId: `DEC-MAN-${Date.now().toString().slice(-4)}`,
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
  const stateMachineSteps = ['QUEUED', 'VALIDATED', 'SUBMITTED', 'FILLED'];

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
            Execution Engine & Delta Exchange Specification
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Realtime TradingView data ingestion & Delta Exchange Adapter specifications.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs text-[#3B82F6] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>SESSION ID: {activeSession?.id ?? 'NO_ACTIVE_SESSION'}</span>
        </div>
      </div>

      <CurrentPairWidget />

      {/* TradingView Webhook Connection Panel */}
      <TradingViewConnectionPanel />

      {/* Delta Exchange Adapter Connection Panel */}
      <DeltaConnectionPanel />

      {/* State Machine Transition Diagram */}
      <div className="bg-[#161D2A] border border-[#1E293B] card-accent-live rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Execution State Machine Pipeline
            </h3>
          </div>
          <span className="text-[10px] text-[#94A3B8]">DETERMINISTIC TRANSITION VALIDATOR</span>
        </div>

        <div className="flex items-center justify-around bg-[#0B0E14] border border-[#1E293B] p-3 rounded-xl text-xs font-bold">
          {stateMachineSteps.map((step, idx) => (
            <React.Fragment key={step}>
              <div className="px-3 py-1 bg-[#1E293B] text-[#F8FAFC] rounded border border-[#3B82F6]/30 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse"></span>
                <span>{step}</span>
              </div>
              {idx < stateMachineSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-[#334155]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Execution Control Form */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Execution Session Dispatcher — {activeSymbol}
            </h3>
          </div>
          <div className="flex items-center space-x-2 font-bold">
            <button
              onClick={() => setMode(ExecutionMode.PAPER)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                mode === ExecutionMode.PAPER
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              PAPER MODE
            </button>
            <button
              onClick={() => setMode(ExecutionMode.LIVE)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                mode === ExecutionMode.LIVE
                  ? 'bg-[#EF4444] text-white'
                  : 'bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              LIVE STUB MODE
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">Order Side</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide('LONG')}
                className={`py-2 font-bold rounded border text-xs transition-all ${
                  side === 'LONG'
                    ? 'bg-[#00C896] text-[#0B0E14] border-[#00C896] glow-buy'
                    : 'bg-[#0B0E14] border-[#1E293B] text-[#94A3B8]'
                }`}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setSide('SHORT')}
                className={`py-2 font-bold rounded border text-xs transition-all ${
                  side === 'SHORT'
                    ? 'bg-[#F6465D] text-white border-[#F6465D] glow-sell'
                    : 'bg-[#0B0E14] border-[#1E293B] text-[#94A3B8]'
                }`}
              >
                SELL / SHORT
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">Quantity (Units)</label>
            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded p-2 focus:border-[#3B82F6] focus:outline-none font-mono-tabular"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitExecutionMutation.isPending}
              className="w-full py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{submitExecutionMutation.isPending ? 'DISPATCHING...' : 'DISPATCH EXECUTION SESSION'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Execution Results & Audit Log Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Results Stream */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <List className="w-4 h-4 text-[#3B82F6]" />
              Execution Results Stream ({results.length})
            </h3>
            <span className="text-[10px] text-[#94A3B8]">ADAPTER LATENCY TELEMETRY</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {results.map((res) => (
              <div key={res.id} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC]">{res.id}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      res.status === 'FILLED'
                        ? 'bg-[#00C896]/15 text-[#00C896]'
                        : res.status === 'SUBMITTED'
                        ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                        : 'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
                <div className="text-[10px] text-[#94A3B8] flex items-center justify-between">
                  <span>Adapter: {res.adapter}</span>
                  <span className="font-mono-tabular">Total Latency: {res.observability.totalLifecycleTimeMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Journal */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#3B82F6]" />
              Execution Audit Log ({journal.length})
            </h3>
            <span className="text-[10px] text-[#94A3B8]">IMMUTABLE AUDIT TRAIL</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {journal.map((j) => (
              <div key={j.id} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between text-[#F8FAFC] font-bold">
                  <span>{j.action}</span>
                  <span className="text-[10px] text-[#94A3B8] font-mono-tabular">{j.timestamp.slice(11, 19)}</span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">{j.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
