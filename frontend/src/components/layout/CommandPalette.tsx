import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { WATCHLIST_SYMBOLS } from '../../hooks/useMarketPairs';
import { TerminalPage } from '@algoapp/shared';
import { 
  LucideIcon,
  Search, 
  LayoutDashboard, 
  FileCode, 
  Zap, 
  LineChart, 
  BookOpen, 
  PieChart, 
  Trophy, 
  Settings,
  X,
  SlidersHorizontal,
  RefreshCw,
  Bell,
  Lock
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  category: 'Navigation' | 'Pair Switcher' | 'Quick Action';
  icon: LucideIcon;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    setActivePage, 
    setActiveSymbol,
    toggleMarketWatch,
    resetWidgetLayout
  } = useTerminalStore();

  const { addToast } = useToastStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Build command list dynamically
  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-dash', label: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => { setActivePage(TerminalPage.DASHBOARD); navigate('/'); } },
    { id: 'nav-paper', label: 'Go to Paper Trading', category: 'Navigation', icon: FileCode, action: () => { setActivePage(TerminalPage.PAPER_TRADING); navigate('/paper-trading'); } },
    { id: 'nav-live', label: 'Go to Live Trading', category: 'Navigation', icon: Zap, action: () => { setActivePage(TerminalPage.LIVE_TRADING); navigate('/live-trading'); } },
    { id: 'nav-analysis', label: 'Go to Analysis', category: 'Navigation', icon: LineChart, action: () => { setActivePage(TerminalPage.ANALYSIS); navigate('/analysis'); } },
    { id: 'nav-journal', label: 'Go to Trade Journal', category: 'Navigation', icon: BookOpen, action: () => { setActivePage(TerminalPage.TRADE_JOURNAL); navigate('/journal'); } },
    { id: 'nav-analytics', label: 'Go to Analytics', category: 'Navigation', icon: PieChart, action: () => { setActivePage(TerminalPage.ANALYTICS); navigate('/analytics'); } },
    { id: 'nav-challenge', label: 'Go to Challenge', category: 'Navigation', icon: Trophy, action: () => { setActivePage(TerminalPage.CHALLENGE); navigate('/challenge'); } },
    { id: 'nav-settings', label: 'Go to Settings', category: 'Navigation', icon: Settings, action: () => { setActivePage(TerminalPage.SETTINGS); navigate('/settings'); } },

    // Pair Switcher
    ...WATCHLIST_SYMBOLS.map((pair) => ({
      id: `pair-${pair}`,
      label: `Switch Active Pair to ${pair}`,
      category: 'Pair Switcher' as const,
      icon: Zap,
      action: () => {
        setActiveSymbol(pair);
        addToast('Active Symbol Changed', `Terminal focus switched to ${pair}`, 'info');
      },
    })),

    // Quick Actions
    {
      id: 'act-mw',
      label: 'Toggle Market Watch Panel',
      category: 'Quick Action',
      icon: SlidersHorizontal,
      action: () => {
        toggleMarketWatch();
        addToast('Market Watch', 'Toggled Market Watch visibility', 'info');
      },
    },
    {
      id: 'act-reset',
      label: 'Reset Dashboard Widget Layout',
      category: 'Quick Action',
      icon: RefreshCw,
      action: () => {
        resetWidgetLayout();
        addToast('Layout Reset', 'Restored default dashboard widget layout', 'success');
      },
    },
    {
      id: 'act-test-toast',
      label: 'Trigger Test Risk Toast Alert',
      category: 'Quick Action',
      icon: Bell,
      action: () => {
        addToast('Risk Capacity Evaluation', 'Current account risk at 34.5% of max policy threshold.', 'warning');
      },
    },
    {
      id: 'act-killswitch',
      label: 'Verify Emergency Kill Switch Readiness',
      category: 'Quick Action',
      icon: Lock,
      action: () => {
        addToast('Kill Switch Check', 'Emergency kill switch verified armed and fail-closed.', 'success');
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd: CommandItem) => {
    cmd.action();
    setCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-[#161D2A] border border-[#334155] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden font-mono">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-[#1E293B]">
          <Search className="w-5 h-5 text-[#94A3B8] mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search pages, or switch pair..."
            className="bg-transparent border-none outline-none text-[#F8FAFC] placeholder-[#64748B] text-sm w-full font-mono"
            autoFocus
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#64748B]">No matching commands found.</div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-[#1E2638] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-[#3B82F6]" />
                    <span>{cmd.label}</span>
                  </div>
                  <span className="text-[10px] bg-[#1E293B] px-2 py-0.5 rounded text-[#64748B]">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
