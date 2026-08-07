import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { strategyApi } from '../../services/api';
import { Radio } from 'lucide-react';
import { StrategySignalDto } from '@algoapp/shared';
import { toISTTime } from '../../utils/time';

export const SignalsTable: React.FC = () => {
  const { data: signalsData, isLoading } = useQuery({
    queryKey: ['strategySignals'],
    queryFn: () => strategyApi.getSignals(),
    refetchInterval: 5000,
  });

  const signals: StrategySignalDto[] = signalsData?.data || [];

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B] bg-[#0E121A]">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-[#F59E0B]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Inbound Strategy Signals & Alerts ({signals.length})
          </h3>
        </div>
        <span className="text-[10px] text-[#94A3B8] font-mono font-semibold">SIGNAL STREAM ACTIVE</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono select-none">
          <thead>
            <tr className="bg-[#1E2638] text-[#94A3B8] uppercase text-[10px] tracking-wider border-b border-[#1E293B] h-9">
              <th className="px-3 text-left">Signal ID</th>
              <th className="px-3 text-left">Symbol</th>
              <th className="px-3 text-center">Timeframe</th>
              <th className="px-3 text-left">Outcome</th>
              <th className="px-3 text-right">Observed Price</th>
              <th className="px-3 text-center">Confidence</th>
              <th className="px-3 text-left">Rationale</th>
              <th className="px-3 text-right">Received At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-[#94A3B8]">Loading signals…</td>
              </tr>
            ) : signals.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-[#94A3B8]">No data available.</td>
              </tr>
            ) : signals.map((sig) => (
              <tr key={sig.id} className="hover:bg-[#28334A] transition-colors h-10">
                <td className="px-3 font-bold text-[#F8FAFC]">{sig.id}</td>
                <td className="px-3 font-semibold text-[#F8FAFC]">{sig.symbol}</td>
                <td className="px-3 text-center">
                  <span className="bg-[#1E293B] text-[#3B82F6] px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {sig.timeframe}
                  </span>
                </td>
                <td className="px-3 text-[#00C896] font-semibold">{sig.outcome}</td>
                <td className="px-3 text-right text-[#F8FAFC]">${sig.price.toFixed(2)}</td>
                <td className="px-3 text-center font-bold text-[#00C896]">{sig.confidenceScore.toFixed(1)}%</td>
                <td className="px-3 text-[#94A3B8] max-w-xs truncate">{sig.rationale}</td>
                <td className="px-3 text-right text-[#64748B] text-[11px]">
                  {toISTTime(sig.timestamp)} IST
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
