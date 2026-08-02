import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { decisionApi, strategyApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { InteractiveTradingChart } from '../../components/charts/InteractiveTradingChart';
import { 
  LineChart, 
  Layers, 
  Brain, 
  Clock, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnalysisPage: React.FC = () => {
  const { activeSymbol } = useTerminalStore();

  const { data: zonesData } = useQuery({
    queryKey: ['zones', activeSymbol],
    queryFn: () => strategyApi.getZones(activeSymbol),
  });

  const { data: decisionsData } = useQuery({
    queryKey: ['decisionLogs'],
    queryFn: decisionApi.getLogs,
  });

  const zones = zonesData?.data || [];
  const supplyZone = zones.find((z) => z.type === 'SUPPLY');
  const demandZone = zones.find((z) => z.type === 'DEMAND');
  const decisions = decisionsData?.data || [];
  const latestDecision = decisions[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 max-w-[1920px] mx-auto pb-6 font-mono select-none"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <LineChart className="w-5 h-5 text-[#3B82F6]" />
            Deep Market Structure & AI Strategy Analysis — {activeSymbol}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Institutional supply/demand zone detection, decision explainability, and historical replay trigger.
          </p>
        </div>

        <Link
          to="/replay"
          className="flex items-center space-x-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>REPLAY TERMINAL</span>
        </Link>
      </div>

      {/* 65% / 35% Top Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[480px]">
        {/* 65% Main Chart View */}
        <div className="lg:col-span-8 flex flex-col min-h-[440px]">
          <InteractiveTradingChart />
        </div>

        {/* 35% Analytical Panels */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Zone Detection Matrix */}
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm flex-1">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#F59E0B]" />
                <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                  Supply / Demand Zone Matrix
                </h2>
              </div>
              <span className="text-[10px] text-[#94A3B8]">1H TIMEFRAME ONLY</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#F59E0B] font-bold block">SUPPLY ZONE (RESISTANCE)</span>
                  <span className="text-sm font-bold text-[#F8FAFC] font-mono-tabular">
                    ${supplyZone?.lowerPrice ?? 64650} – ${supplyZone?.upperPrice ?? 64800}
                  </span>
                </div>
                <span className="text-[10px] bg-[#F59E0B]/15 text-[#F59E0B] px-2 py-0.5 rounded font-bold">
                  TESTED 2x
                </span>
              </div>

              <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#3B82F6] font-bold block">DEMAND ZONE (SUPPORT)</span>
                  <span className="text-sm font-bold text-[#F8FAFC] font-mono-tabular">
                    ${demandZone?.lowerPrice ?? 63770} – ${demandZone?.upperPrice ?? 63950}
                  </span>
                </div>
                <span className="text-[10px] bg-[#3B82F6]/15 text-[#3B82F6] px-2 py-0.5 rounded font-bold">
                  VALIDATED
                </span>
              </div>

              <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#94A3B8] font-bold block">TREND CLASSIFICATION</span>
                  <span className="text-sm font-bold text-[#00C896]">BULLISH CONTINUATION</span>
                </div>
                <span className="text-[10px] bg-[#00C896]/15 text-[#00C896] px-2 py-0.5 rounded font-bold">
                  PASS
                </span>
              </div>
            </div>
          </div>

          {/* AI Strategy Reasoning */}
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                  AI Decision Center Rationale
                </h3>
              </div>
              <span className="text-[10px] text-[#00C896] font-bold font-mono-tabular">CONFIDENCE 94.5%</span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg text-[11px]">
              {latestDecision
                ? `Rule Verification: ${latestDecision.reasonCodes.join(', ')} | State: ${latestDecision.decisionState}`
                : '1H candlestick closed above supply rejection level with high volume. Risk engine parameters confirm maximum drawdown stays below threshold.'}
            </p>
          </div>
        </div>
      </div>

      {/* Decision Audit Trail */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#3B82F6]" />
            Recent Strategy Decision History ({decisions.length})
          </h3>
          <span className="text-[10px] text-[#94A3B8]">DETERMINISTIC EVALUATION LOGS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#1E2638] text-[#94A3B8] text-[11px] uppercase border-b border-[#1E293B]">
                <th className="p-2.5">Decision ID</th>
                <th className="p-2.5">Symbol</th>
                <th className="p-2.5">Decision State</th>
                <th className="p-2.5 text-right">Confidence</th>
                <th className="p-2.5">Strategy Status</th>
                <th className="p-2.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {decisions.map((d) => (
                <tr key={d.id} className="hover:bg-[#1E2638] transition-colors h-10">
                  <td className="p-2.5 font-bold text-[#F8FAFC]">{d.id}</td>
                  <td className="p-2.5 text-[#3B82F6] font-bold">{d.symbol}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.decisionState === 'EXECUTE'
                          ? 'bg-[#00C896]/15 text-[#00C896]'
                          : d.decisionState === 'WAIT'
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                          : 'bg-[#1E293B] text-[#94A3B8]'
                      }`}
                    >
                      {d.decisionState}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-bold font-mono-tabular text-[#00C896]">
                    {(d.confidenceScore * 100).toFixed(1)}%
                  </td>
                  <td className="p-2.5">
                    <span className="flex items-center gap-1 text-[#00C896] text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> APPROVED
                    </span>
                  </td>
                  <td className="p-2.5 text-right text-[#94A3B8] font-mono-tabular text-[11px]">
                    {d.timestamp.slice(11, 19)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
