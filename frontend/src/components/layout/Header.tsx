import React from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useMarketPairs, WATCHLIST_SYMBOLS } from '../../hooks/useMarketPairs';
import { TradingTimeframe } from '@algoapp/shared';
import { 
  Search, 
  Terminal, 
  PanelLeftClose, 
  PanelLeft,
  ChevronDown,
  ShieldAlert,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { deltaApi } from '../../services/api';

export const Header: React.FC = () => {
  const { data: deltaHealth } = useQuery({
    queryKey: ['deltaHealth'],
    queryFn: deltaApi.getHealth,
    refetchInterval: 5000,
  });

  const isDeltaConnected = deltaHealth?.data?.connectionState === 'CONNECTED';

  const { 
    activeSymbol, 
    setActiveSymbol, 
    activeTimeframe,
    setActiveTimeframe,
    activeProfileId,
    setActiveProfileId,
    isSidebarCollapsed, 
    toggleSidebar, 
    toggleCommandPalette 
  } = useTerminalStore();

  const { pairs } = useMarketPairs();
  const currentPair = pairs[activeSymbol];
  const pairOptions = WATCHLIST_SYMBOLS;

  const profileOptions = [
    { id: 'DEF-1H-PROF', name: 'Default 1H Profile', timeframe: '1H' },
    { id: 'DEF-15M-PROF', name: 'Default 15M Profile', timeframe: '15M' },
  ];

  return (
    <header className="h-14 glass-header flex items-center justify-between px-4 z-20 select-none font-mono">
      {/* Left Selectors (Symbol, Timeframe, Profile) */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E2638] rounded-md transition-colors"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-[#3B82F6] flex items-center justify-center text-white font-bold">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          
          {/* Pair Selector */}
          <div className="relative group">
            <select
              value={activeSymbol}
              onChange={(e) => setActiveSymbol(e.target.value)}
              className="appearance-none bg-[#161D2A] border border-[#1E293B] hover:border-[#3B82F6] text-[#F8FAFC] font-bold text-xs rounded-lg pl-2.5 pr-7 py-1 cursor-pointer focus:outline-none transition-colors"
            >
              {pairOptions.map((sym) => (
                <option key={sym} value={sym} className="bg-[#161D2A] text-white">
                  {sym}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Timeframe Segmented Selector */}
          <div className="flex items-center bg-[#0B0E14] border border-[#1E293B] p-0.5 rounded-lg text-xs">
            {(['15M', '1H'] as TradingTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setActiveTimeframe(tf);
                  if (tf === '15M') setActiveProfileId('DEF-15M-PROF');
                  if (tf === '1H') setActiveProfileId('DEF-1H-PROF');
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  activeTimeframe === tf
                    ? 'bg-[#3B82F6] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Strategy Profile Selector */}
          <div className="hidden lg:flex items-center relative group">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#3B82F6] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={activeProfileId}
              onChange={(e) => setActiveProfileId(e.target.value)}
              className="appearance-none bg-[#161D2A] border border-[#1E293B] hover:border-[#3B82F6] text-[#F8FAFC] font-bold text-xs rounded-lg pl-7 pr-7 py-1 cursor-pointer focus:outline-none transition-colors"
            >
              {profileOptions.map((prof) => (
                <option key={prof.id} value={prof.id} className="bg-[#161D2A] text-white">
                  {prof.name} ({prof.timeframe})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Live Price Ticker */}
          <div className="hidden xl:flex items-center space-x-2 px-2.5 py-1 bg-[#161D2A] border border-[#1E293B] rounded-lg text-xs font-mono">
            <span className="text-[#F8FAFC] font-bold font-mono-tabular">
              {currentPair ? currentPair.priceLabel : '—'}
            </span>
            {currentPair && (
              <span className={`font-semibold font-mono-tabular ${currentPair.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                {currentPair.changeLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Search / Command Palette Shortcut */}
      <button
        onClick={toggleCommandPalette}
        className="hidden md:flex items-center space-x-2 bg-[#161D2A] hover:bg-[#1E2638] border border-[#1E293B] hover:border-[#334155] text-[#94A3B8] px-3 py-1 rounded-lg text-xs transition-colors w-64 justify-between"
      >
        <div className="flex items-center space-x-2">
          <Search className="w-3.5 h-3.5" />
          <span>Search symbol, profile...</span>
        </div>
        <kbd className="bg-[#0B0E14] border border-[#334155] px-1.5 py-0.5 rounded text-[10px] text-[#F8FAFC]">
          Ctrl K
        </kbd>
      </button>

      {/* Right Telemetry & Kill Switch Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => useTerminalStore.getState().toggleDeveloperMode()}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
            useTerminalStore.getState().isDeveloperMode
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
              : 'bg-[#1E293B] text-[#94A3B8] border-[#334155] hover:text-white'
          }`}
        >
          <span>{useTerminalStore.getState().isDeveloperMode ? 'DEV MODE ON' : 'DEV MODE'}</span>
        </button>

        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
            isDeltaConnected
              ? 'bg-[#00C896]/10 border-[#00C896]/30 text-[#00C896]'
              : 'bg-[#94A3B8]/10 border-[#94A3B8]/30 text-[#94A3B8]'
          }`}
        >
          <Radio className={`w-3 h-3 ${isDeltaConnected ? 'animate-pulse text-[#00C896]' : 'text-[#94A3B8]'}`} />
          <span>{isDeltaConnected ? 'DELTA LIVE' : 'DELTA OFF'}</span>
        </div>

        <button
          onClick={toggleCommandPalette}
          className="flex items-center space-x-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1.5 rounded-md text-xs font-bold font-mono glow-kill transition-all shadow-md"
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="hidden sm:inline">KILL SWITCH</span>
        </button>
      </div>
    </header>
  );
};
