import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTerminalStore } from '../../store/useTerminalStore';
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
  X
} from 'lucide-react';

interface CommandItem {
  page: TerminalPage;
  label: string;
  route: string;
  category: string;
  icon: LucideIcon;
}

const commands: CommandItem[] = [
  { page: TerminalPage.DASHBOARD, label: 'Go to Dashboard', route: '/', category: 'Navigation', icon: LayoutDashboard },
  { page: TerminalPage.PAPER_TRADING, label: 'Go to Paper Trading', route: '/paper-trading', category: 'Navigation', icon: FileCode },
  { page: TerminalPage.LIVE_TRADING, label: 'Go to Live Trading', route: '/live-trading', category: 'Navigation', icon: Zap },
  { page: TerminalPage.ANALYSIS, label: 'Go to Analysis', route: '/analysis', category: 'Navigation', icon: LineChart },
  { page: TerminalPage.TRADE_JOURNAL, label: 'Go to Trade Journal', route: '/journal', category: 'Navigation', icon: BookOpen },
  { page: TerminalPage.ANALYTICS, label: 'Go to Analytics', route: '/analytics', category: 'Navigation', icon: PieChart },
  { page: TerminalPage.CHALLENGE, label: 'Go to Challenge', route: '/challenge', category: 'Navigation', icon: Trophy },
  { page: TerminalPage.SETTINGS, label: 'Go to Settings', route: '/settings', category: 'System', icon: Settings },
];

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, setActivePage } = useTerminalStore();
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

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd: CommandItem) => {
    setActivePage(cmd.page);
    navigate(cmd.route);
    setCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
      <div className="bg-[#161D2A] border border-[#334155] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-[#1E293B]">
          <Search className="w-5 h-5 text-[#94A3B8] mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search page..."
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

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#64748B]">No matching commands found.</div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.page}
                  onClick={() => handleSelect(cmd)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs hover:bg-[#1E2638] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-[#3B82F6]" />
                    <span>{cmd.label}</span>
                  </div>
                  <span className="text-[10px] bg-[#1E293B] px-2 py-0.5 rounded text-[#64748B] font-mono">
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
