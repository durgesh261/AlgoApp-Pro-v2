import React, { useState } from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useMarketPairs } from '../../hooks/useMarketPairs';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Flame,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const MarketWatchPanel: React.FC = () => {
  const { activeSymbol, setActiveSymbol, isMarketWatchOpen, toggleMarketWatch } = useTerminalStore();
  const [search, setSearch] = useState('');
  const { pairList, isLoading } = useMarketPairs();

  const pairs = pairList.filter(
    (p) =>
      p.symbol.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isMarketWatchOpen) {
    return (
      <div className="bg-[#161D2A] border-r border-[#1E293B] flex flex-col items-center py-3 px-1 z-10 shrink-0 select-none">
        <button
          onClick={toggleMarketWatch}
          className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E2638] rounded-md transition-colors"
          title="Expand Market Watch Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider rotate-90 mt-8 whitespace-nowrap">
          MARKET WATCH
        </span>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-[#161D2A] border-r border-[#1E293B] flex flex-col z-10 select-none shrink-0 overflow-hidden">
      {/* Panel Header */}
      <div className="p-3 border-b border-[#1E293B] flex items-center justify-between bg-[#0E121A]">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-[#3B82F6]" />
          <span className="text-xs font-bold text-[#F8FAFC] uppercase font-mono tracking-wider">
            Market Watch
          </span>
        </div>
        <button
          onClick={toggleMarketWatch}
          className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E2638] rounded transition-colors"
          title="Collapse Watchlist"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-[#1E293B] bg-[#121722]">
        <div className="flex items-center bg-[#0B0E14] border border-[#334155] rounded-md px-2.5 py-1">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search perpetual pair..."
            className="bg-transparent border-none outline-none text-xs text-[#F8FAFC] placeholder-[#64748B] font-mono w-full"
          />
        </div>
      </div>

      {/* Watchlist Item List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1E293B]">
        {isLoading && pairs.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#64748B] font-mono">Loading live pairs...</div>
        ) : pairs.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#64748B] font-mono">No matching pairs.</div>
        ) : (
          pairs.map((pair) => {
            const isSelected = activeSymbol === pair.symbol;

            return (
              <button
                key={pair.symbol}
                onClick={() => setActiveSymbol(pair.symbol)}
                className={`w-full text-left p-3 transition-colors ${
                  isSelected
                    ? 'bg-[#1E2638] border-l-4 border-[#3B82F6]'
                    : 'hover:bg-[#1A2232] text-[#94A3B8]'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-[#F8FAFC]">{pair.symbol}</span>
                    {isSelected ? (
                      <span className="text-[9px] bg-[#3B82F6] text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                        OPEN CHART
                      </span>
                    ) : (
                      <span className="text-[10px] bg-[#1E293B] text-[#94A3B8] px-1 py-0.2 rounded">
                        PERP
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#F8FAFC]">{pair.priceLabel}</span>
                </div>

                <div className="flex items-center justify-between font-mono text-[11px] mt-1.5">
                  <span className="text-[#64748B] truncate max-w-[100px]">{pair.name}</span>
                  <span
                    className={`flex items-center font-semibold ${
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
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-1 border-t border-[#1E293B]/50">
                  <span className="text-[#3B82F6] bg-[#3B82F6]/10 px-1.5 py-0.2 rounded truncate">
                    {pair.topZone ? pair.topZone.type.replace('_', ' ') : 'NO ACTIVE ZONE'}
                  </span>
                  {pair.topZone && (
                    <span className="flex items-center text-[#F59E0B] font-semibold">
                      <Flame className="w-2.5 h-2.5 mr-0.5" />
                      {pair.topZone.strength}/100
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
