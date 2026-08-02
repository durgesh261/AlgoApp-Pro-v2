import React from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { mockMarketPairs } from '../../mock/marketData';
import { 
  Search, 
  Terminal, 
  PanelLeftClose, 
  PanelLeft,
  ChevronDown,
  ShieldAlert,
  Radio
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeSymbol, 
    setActiveSymbol, 
    isSidebarCollapsed, 
    toggleSidebar, 
    toggleCommandPalette 
  } = useTerminalStore();

  const currentPair = mockMarketPairs[activeSymbol] ?? mockMarketPairs['BTCUSD.P']!;
  const pairOptions = Object.keys(mockMarketPairs);

  return (
    <header className="h-14 glass-header flex items-center justify-between px-4 z-20 select-none">
      {/* Left Symbol Selector */}
      <div className="flex items-center space-x-4">
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
          
          <div className="relative group">
            <select
              value={activeSymbol}
              onChange={(e) => setActiveSymbol(e.target.value)}
              className="appearance-none bg-[#161D2A] border border-[#1E293B] hover:border-[#3B82F6] text-[#F8FAFC] font-bold text-sm rounded-lg pl-3 pr-8 py-1.5 cursor-pointer font-mono focus:outline-none transition-colors"
            >
              {pairOptions.map((sym) => (
                <option key={sym} value={sym} className="bg-[#161D2A] text-white">
                  {sym}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 bg-[#161D2A] border border-[#1E293B] rounded-lg text-xs font-mono">
            <span className="text-[#94A3B8]">1H</span>
            <span className="text-[#334155]">|</span>
            <span className="text-[#F8FAFC] font-bold font-mono-tabular">{currentPair.price}</span>
            <span className={`font-semibold font-mono-tabular ${currentPair.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
              {currentPair.change24h}
            </span>
          </div>
        </div>
      </div>

      {/* Center Search / Command Palette Shortcut */}
      <button
        onClick={toggleCommandPalette}
        className="hidden md:flex items-center space-x-2 bg-[#161D2A] hover:bg-[#1E2638] border border-[#1E293B] hover:border-[#334155] text-[#94A3B8] px-3 py-1.5 rounded-lg text-xs font-mono transition-colors w-72 justify-between"
      >
        <div className="flex items-center space-x-2">
          <Search className="w-3.5 h-3.5" />
          <span>Search symbol, rule, or action...</span>
        </div>
        <kbd className="bg-[#0B0E14] border border-[#334155] px-1.5 py-0.5 rounded text-[10px] text-[#F8FAFC]">
          Ctrl K
        </kbd>
      </button>

      {/* Right Telemetry & Kill Switch Actions */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 bg-[#00C896]/10 border border-[#00C896]/30 px-2.5 py-1 rounded-md text-[11px] font-mono text-[#00C896] font-bold">
          <Radio className="w-3 h-3 animate-pulse text-[#00C896]" />
          <span>PAPER SIMULATION</span>
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
