import React from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { mockMarketPairs } from '../../mock/marketData';
import { SystemStatus } from '@algoapp/shared';
import { 
  Search, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  PanelLeftClose, 
  PanelLeft,
  ChevronDown
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeSymbol,
    setActiveSymbol,
    isSidebarCollapsed, 
    toggleSidebar, 
    toggleCommandPalette, 
    systemStatus 
  } = useTerminalStore();

  const currentPair = mockMarketPairs[activeSymbol] ?? mockMarketPairs['BTCUSD.P']!;
  const pairOptions = Object.keys(mockMarketPairs);

  return (
    <header className="h-14 glass-header flex items-center justify-between px-4 z-20">
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
          <div className="w-7 h-7 rounded-md bg-[#3B82F6] flex items-center justify-center text-[#0B0E14] font-bold">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-sm text-[#F8FAFC]">
            AlgoApp <span className="text-[#3B82F6]">Pro</span> v2
          </span>
        </div>

        <div className="h-4 w-px bg-[#1E293B]" />

        {/* Interactive Trading Pair Selector Dropdown */}
        <div className="relative flex items-center">
          <label htmlFor="pair-selector-dropdown" className="sr-only">Select Active Trading Pair</label>
          <select
            id="pair-selector-dropdown"
            aria-label="Select Active Trading Pair"
            value={activeSymbol}
            onChange={(e) => setActiveSymbol(e.target.value)}
            className="appearance-none bg-[#1E2638] hover:bg-[#28334A] border border-[#334155] rounded-md pl-3 pr-8 py-1.5 text-xs font-mono font-bold text-[#F8FAFC] cursor-pointer outline-none transition-colors"
          >
            {pairOptions.map((symbol) => (
              <option key={symbol} value={symbol} className="bg-[#161D2A] text-[#F8FAFC]">
                {symbol} ({mockMarketPairs[symbol]?.price})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 pointer-events-none" />
        </div>

        {/* Current Pair Stats Summary */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono">
          <span className="text-[#94A3B8]">Price: <strong className="text-[#F8FAFC]">{currentPair.price}</strong></span>
          <span className={currentPair.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'}>
            {currentPair.change24h}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Command Palette Trigger */}
        <button
          onClick={toggleCommandPalette}
          className="flex items-center space-x-3 bg-[#121722] hover:bg-[#1E2638] border border-[#334155] px-3 py-1.5 rounded-md text-xs text-[#94A3B8] transition-colors w-64 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search or command...</span>
          </div>
          <kbd className="bg-[#1E2638] border border-[#334155] text-[#94A3B8] text-[10px] px-1.5 py-0.5 rounded font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* System Health Badge */}
        <div className="flex items-center space-x-2 bg-[#161D2A] border border-[#1E293B] px-2.5 py-1 rounded-md text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              systemStatus === SystemStatus.HEALTHY ? 'bg-[#00C896] animate-pulse' : 'bg-[#F59E0B]'
            }`}
          />
          <Activity className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-[#94A3B8] text-[11px] font-medium uppercase font-mono">
            {systemStatus}
          </span>
        </div>

        {/* Single-User Environment Badge */}
        <div className="flex items-center space-x-1.5 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-2.5 py-1 rounded-md text-xs text-[#3B82F6] font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[11px] font-semibold">DESKTOP TERMINAL</span>
        </div>
      </div>
    </header>
  );
};
