import React from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { SystemStatus } from '@algoapp/shared';
import { 
  Search, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  PanelLeftClose, 
  PanelLeft 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    isSidebarCollapsed, 
    toggleSidebar, 
    toggleCommandPalette, 
    systemStatus 
  } = useTerminalStore();

  return (
    <header className="h-14 glass-header flex items-center justify-between px-4 z-20">
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
          <div className="w-7 h-7 rounded-md bg-[#3B82F6] flex items-center justify-center text-[#0B0E14] font-bold">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-sm text-[#F8FAFC]">
            AlgoApp <span className="text-[#3B82F6]">Pro</span> v2
          </span>
          <span className="text-[10px] bg-[#1E2638] text-[#94A3B8] px-1.5 py-0.5 rounded font-mono border border-[#334155]">
            SINGLE-USER
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
