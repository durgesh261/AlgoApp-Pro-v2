import React from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useMarketPairs } from '../../hooks/useMarketPairs';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

export const TopMarketTicker: React.FC = () => {
  const { activeSymbol, setActiveSymbol, activeTimeframe } = useTerminalStore();
  const { pairList, isLoading, error } = useMarketPairs();

  return (
    <div className="h-8 bg-[#0E121A] border-b border-[#1E293B] flex items-center px-3 overflow-hidden text-xs font-mono select-none z-30">
      <div className="flex items-center space-x-5 whitespace-nowrap overflow-x-auto no-scrollbar w-full">
        <div className="flex items-center space-x-1.5 text-[#3B82F6] font-semibold text-[11px] uppercase tracking-wider font-sans shrink-0">
          <Zap className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
          <span>MARKETS TICKER ({activeTimeframe})</span>
        </div>

        <div className="h-3.5 w-px bg-[#1E293B] shrink-0" />

        {error ? (
          <span className="text-[#F6465D] text-[11px]">{error}</span>
        ) : isLoading && pairList.length === 0 ? (
          <span className="text-[#64748B] text-[11px]">Loading live market data...</span>
        ) : (
          pairList.map((pair) => {
            const isSelected = activeSymbol === pair.symbol;

            return (
              <button
                key={pair.symbol}
                onClick={() => setActiveSymbol(pair.symbol)}
                className={`flex items-center space-x-2.5 px-2.5 py-0.5 rounded transition-colors ${
                  isSelected
                    ? 'bg-[#1E2638] border border-[#3B82F6]/50 shadow-sm'
                    : 'hover:bg-[#161D2A] text-[#94A3B8]'
                }`}
              >
                <span className={`font-bold ${isSelected ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'}`}>
                  {pair.symbol}
                </span>
                <span className="text-[#F8FAFC] font-bold font-mono-tabular min-w-[75px] text-right">
                  {pair.priceLabel}
                </span>

                <span
                  className={`flex items-center text-[11px] font-semibold font-mono-tabular ${
                    pair.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'
                  }`}
                >
                  {pair.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {pair.changeLabel}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
