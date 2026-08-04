import React from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useMarketPairs } from '../../hooks/useMarketPairs';
import { Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const OpportunityRadarWidget: React.FC = () => {
  const { activeSymbol, setActiveSymbol } = useTerminalStore();
  const { pairList, isLoading } = useMarketPairs();

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#F59E0B]" />
          Market Opportunity Radar
        </h3>
        <span className="text-[10px] text-[#94A3B8] font-mono">{pairList.length} ACTIVE PAIRS</span>
      </div>

      <div className="space-y-2">
        {isLoading && pairList.length === 0 ? (
          <div className="text-xs text-[#64748B] font-mono py-4 text-center">Loading live pairs...</div>
        ) : (
          pairList.map((p) => {
            const isSelected = activeSymbol === p.symbol;

            return (
              <button
                key={p.symbol}
                onClick={() => setActiveSymbol(p.symbol)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-[#1E2638] border-[#3B82F6] shadow-sm'
                    : 'bg-[#0B0E14] border-[#1E293B] hover:bg-[#161D2A]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-[#F8FAFC]">{p.symbol}</span>
                  <span className="text-[#94A3B8]">{p.priceLabel}</span>
                  <span
                    className={`flex items-center font-semibold text-[11px] ${
                      p.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'
                    }`}
                  >
                    {p.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {p.changeLabel}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-0.5 rounded font-semibold border border-[#3B82F6]/20">
                    {p.topZone ? `Strength: ${p.topZone.strength}/100` : 'No zone'}
                  </span>
                  <span className="text-[10px] bg-[#1E293B] text-[#94A3B8] px-2 py-0.5 rounded font-semibold">
                    {p.topZone ? p.topZone.type.replace(/_/g, ' ') : '—'}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
