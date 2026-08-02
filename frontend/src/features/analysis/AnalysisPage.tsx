import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { strategyApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { CurrentPairWidget } from '../../components/widgets/CurrentPairWidget';
import { StrategySignalOutcome } from '@algoapp/shared';
import { 
  LineChart, 
  Layers, 
  Radio, 
  Compass, 
  ShieldCheck,
  Zap
} from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSymbol } = useTerminalStore();
  const { addToast } = useToastStore();

  const { data: zonesData } = useQuery({
    queryKey: ['strategyZones', activeSymbol],
    queryFn: () => strategyApi.getZones(activeSymbol),
  });

  const { data: signalsData } = useQuery({
    queryKey: ['strategySignals'],
    queryFn: strategyApi.getSignals,
  });

  const evalSignalMutation = useMutation({
    mutationFn: strategyApi.evaluateSignal,
    onSuccess: (res) => {
      addToast('Strategy Signal Evaluated', `Outcome: ${res.data.outcome} (${res.data.confidenceScore}%)`, 'info');
      queryClient.invalidateQueries({ queryKey: ['strategySignals'] });
    },
  });

  const zones = zonesData?.data || [];
  const signals = signalsData?.data || [];

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
            Strategy Engine — 1H Market Structure & Zone Detector
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Supply & Demand zone detection, merged confluence zones, and deterministic Strategy Signals.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs text-[#3B82F6]">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>NO EXECUTION / SIGNALS ONLY</span>
        </div>
      </div>

      <CurrentPairWidget />

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

      {/* Strategy Signal Output Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Signal Evaluator Button */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
            <Compass className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Strategy Signal Generator
            </h3>
          </div>

          <p className="text-xs text-[#94A3B8]">
            Evaluates current price against 1H Supply/Demand zones to emit deterministic Strategy Signals (`BUY`, `SELL`, `WAIT`, `INVALID`).
          </p>

          <button
            onClick={() => evalSignalMutation.mutate({ symbol: activeSymbol, currentPrice: 64250.0, timeframe: '1H' })}
            disabled={evalSignalMutation.isPending}
            className="w-full py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md"
          >
            <Zap className="w-4 h-4" />
            <span>{evalSignalMutation.isPending ? 'EVALUATING ZONES...' : `EVALUATE 1H SIGNAL (${activeSymbol})`}</span>
          </button>
        </div>

        {/* Strategy Signal Output Stream */}
        <div className="lg:col-span-2 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-[#00C896]" />
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                Emitted Strategy Signals Stream ({signals.length})
              </h3>
            </div>
            <span className="text-[10px] text-[#94A3B8]">DETERMINISTIC EVALUATION ONLY</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {signals.map((sig) => (
              <div
                key={sig.id}
                className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      sig.outcome === StrategySignalOutcome.BUY
                        ? 'bg-[#00C896]/20 text-[#00C896]'
                        : sig.outcome === StrategySignalOutcome.SELL
                        ? 'bg-[#F6465D]/20 text-[#F6465D]'
                        : 'bg-[#1E293B] text-[#94A3B8]'
                    }`}
                  >
                    {sig.outcome}
                  </span>
                  <span className="font-bold text-[#F8FAFC]">{sig.symbol}</span>
                  <span className="text-[#94A3B8] text-[11px]">{sig.rationale}</span>
                </div>

                <div className="flex items-center space-x-3 text-[10px]">
                  <span className="text-[#00C896] font-bold">{sig.confidenceScore}%</span>
                  <span className="text-[#64748B]">{sig.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
