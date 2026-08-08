import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Command, Bell, Activity, 
  Wifi, WifiOff, Bot, Terminal, ChevronDown 
} from 'lucide-react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useDeltaStore } from '../../store/useDeltaStore';

export const Header: React.FC = () => {
  const { 
    activeSymbol, 
    setActiveSymbol, 
    isAlgoRunning, 
    toggleAlgo, 
    activeTimeframe, 
    setActiveTimeframe,
    isDeveloperMode,
    toggleDeveloperMode 
  } = useTerminalStore();
  
  const { isConnected } = useDeltaStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Available symbols
  const SYMBOLS = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredSymbols = SYMBOLS.filter(s => 
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-12 bg-[#0B0E14] border-b border-[#1E293B] flex items-center justify-between px-3 shrink-0 select-none">
      
      {/* ═══════════════════════════════════════════════
          LEFT SECTION: Logo + Algo Toggle + Timeframe
          ═══════════════════════════════════════════════ */}
      <div className="flex items-center space-x-2">
        
        {/* Logo / Home */}
        <button 
          className="w-8 h-8 rounded-lg bg-[#1E293B] hover:bg-[#334155] flex items-center justify-center transition-colors"
          title="QuantEdge AI"
        >
          <Terminal className="w-4 h-4 text-[#3B82F6]" />
        </button>

        {/* ALGO TRADING Toggle — PRIMARY CONTROL (kept on left only) */}
        <button
          onClick={toggleAlgo}
          className={`flex items-center space-x-2 px-3 h-8 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all ${
            isAlgoRunning
              ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30 hover:bg-[#00C896]/20'
              : 'bg-[#F6465D]/10 text-[#F6465D] border-[#F6465D]/30 hover:bg-[#F6465D]/20'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isAlgoRunning ? 'bg-[#00C896]' : 'bg-[#F6465D]'} animate-pulse`} />
          <span>ALGO TRADING: {isAlgoRunning ? 'ON' : 'OFF'}</span>
          <Bot className="w-3 h-3" />
        </button>

        {/* Timeframe Selector */}
        <div className="relative">
          <button
            onClick={() => setActiveTimeframe(activeTimeframe === '1H' ? '15M' : '1H')} // or open dropdown
            className="h-8 px-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-colors"
          >
            <span>{activeTimeframe}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════
          CENTER: Search Bar
          ═══════════════════════════════════════════════ */}
      <div className="flex-1 max-w-xl mx-4" ref={searchRef}>
        <div className="relative">
          <div 
            onClick={() => setSearchOpen(true)}
            className={`flex items-center space-x-2 w-full h-8 rounded-lg border px-3 cursor-text transition-colors ${
              searchOpen 
                ? 'bg-[#0B0E14] border-[#3B82F6] ring-1 ring-[#3B82F6]/30' 
                : 'bg-[#161D2A] border-[#1E293B] hover:border-[#334155]'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-[11px] text-[#64748B] flex-1">
              {searchOpen ? '' : 'Search symbol, profile...'}
            </span>
            {!searchOpen && (
              <kbd className="hidden sm:flex items-center space-x-0.5 px-1.5 py-0.5 bg-[#0B0E14] border border-[#334155] rounded text-[9px] text-[#64748B] font-mono">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </kbd>
            )}
          </div>

          {/* Search Dropdown */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#161D2A] border border-[#334155] rounded-lg shadow-2xl z-50 overflow-hidden">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type symbol (e.g. BTC, ETH)..."
                className="w-full bg-transparent border-0 border-b border-[#1E293B] px-3 py-2.5 text-[11px] text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
              />
              <div className="max-h-48 overflow-y-auto py-1">
                {filteredSymbols.length === 0 ? (
                  <div className="px-3 py-2 text-[10px] text-[#64748B]">No symbols found</div>
                ) : (
                  filteredSymbols.map(sym => (
                    <button
                      key={sym}
                      onClick={() => {
                        setActiveSymbol(sym);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-3 py-2 text-[11px] hover:bg-[#3B82F6]/10 flex items-center justify-between transition-colors ${
                        activeSymbol === sym ? 'text-[#3B82F6] bg-[#3B82F6]/5' : 'text-[#94A3B8]'
                      }`}
                    >
                      <span className="font-mono font-bold">{sym}</span>
                      {activeSymbol === sym && <Activity className="w-3 h-3 text-[#3B82F6]" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT SECTION: Dev Mode + Delta Status + Notifs
          ═══════════════════════════════════════════════ */}
      <div className="flex items-center space-x-2">
        
        {/* Dev Mode Toggle */}
        <button
          onClick={toggleDeveloperMode}
          className={`h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all ${
            isDeveloperMode
              ? 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30'
              : 'bg-[#1E293B] text-[#64748B] border-[#334155] hover:text-[#94A3B8]'
          }`}
        >
          DEV MODE
        </button>

        {/* Delta Exchange Connection Status */}
        <div className={`flex items-center space-x-1.5 h-8 px-3 rounded-lg border text-[10px] font-bold uppercase ${
          isConnected
            ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30'
            : 'bg-[#1E293B] text-[#64748B] border-[#334155]'
        }`}>
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>DELTA {isConnected ? 'ON' : 'OFF'}</span>
        </div>

        {/* Notifications */}
        <button className="w-8 h-8 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] flex items-center justify-center transition-colors relative">
          <Bell className="w-4 h-4 text-[#94A3B8]" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F6465D]" />
        </button>

      </div>
    </header>
  );
};
