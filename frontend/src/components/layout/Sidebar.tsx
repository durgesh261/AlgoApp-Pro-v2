import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTerminalStore } from '../../store/useTerminalStore';
import { TerminalPage } from '@algoapp/shared';
import {
  LucideIcon,
  LayoutDashboard,
  FileCode,
  Zap,
  LineChart,
  BookOpen,
  PieChart,
  Trophy,
  Settings,
  Shield
} from 'lucide-react';

interface NavItem {
  page: TerminalPage;
  label: string;
  route: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { page: TerminalPage.DASHBOARD, label: 'Dashboard', route: '/', icon: LayoutDashboard },
  { page: TerminalPage.PAPER_TRADING, label: 'Paper Trading', route: '/paper-trading', icon: FileCode },
  { page: TerminalPage.LIVE_TRADING, label: 'Live Trading', route: '/live-trading', icon: Zap },
  { page: TerminalPage.ANALYSIS, label: 'Analysis', route: '/analysis', icon: LineChart },
  { page: TerminalPage.TRADE_JOURNAL, label: 'Trade Journal', route: '/journal', icon: BookOpen },
  { page: TerminalPage.ANALYTICS, label: 'Analytics', route: '/analytics', icon: PieChart },
  { page: TerminalPage.CHALLENGE, label: 'Challenge', route: '/challenge', icon: Trophy },
  { page: TerminalPage.SETTINGS, label: 'Settings', route: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, setActivePage } = useTerminalStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (item: NavItem) => {
    setActivePage(item.page);
    navigate(item.route);
  };

  return (
    <aside
      className={`bg-[#161D2A] border-r border-[#1E293B] flex flex-col transition-all duration-200 z-10 ${
        isSidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex-1 py-3 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.route;

          return (
            <button
              key={item.page}
              onClick={() => handleNavigate(item)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#3B82F6]/15 text-[#3B82F6] border-l-2 border-[#3B82F6]'
                  : 'text-[#94A3B8] hover:bg-[#1E2638] hover:text-[#F8FAFC]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#3B82F6]' : 'text-[#94A3B8]'}`} />
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#1E293B] bg-[#0E121A]">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-[#00C896] shrink-0" />
          {!isSidebarCollapsed && (
            <div className="text-[11px] font-mono leading-tight truncate">
              <div className="text-[#F8FAFC] font-semibold">AlgoApp Core</div>
              <div className="text-[#64748B]">v2.0.0 Stable</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
