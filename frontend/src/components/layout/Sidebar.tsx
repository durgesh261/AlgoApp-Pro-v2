import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTerminalStore } from '../../store/useTerminalStore';
import { 
  LayoutDashboard, 
  Wallet, 
  Activity, 
  LineChart, 
  BookOpen, 
  BarChart2, 
  Trophy, 
  Settings,
  RotateCcw,
  BarChart3,
  Server,
  ShieldAlert,
  Radio,
  ShieldCheck,
  Calculator,
  PieChart,
  FlaskConical
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Live Portfolio', path: '/portfolio', icon: PieChart },
  { name: 'Strategy Lab', path: '/laboratory', icon: FlaskConical },
  { name: 'Paper Trading', path: '/paper-trading', icon: Wallet },
  { name: 'Live Trading', path: '/live-trading', icon: Activity },
  { name: 'Trade Accounting', path: '/trade-accounting', icon: Calculator },
  { name: 'TradingView Alert', path: '/tradingview', icon: Radio },
  { name: 'Indicator Validation', path: '/indicator-validation', icon: ShieldCheck },
  { name: 'System Monitor', path: '/system-monitor', icon: Server },
  { name: 'Production', path: '/production-dashboard', icon: ShieldAlert },
  { name: 'Analysis', path: '/analysis', icon: LineChart },
  { name: 'Replay Terminal', path: '/replay', icon: RotateCcw },
  { name: 'Backtesting', path: '/backtest', icon: BarChart3 },
  { name: 'Trade Journal', path: '/journal', icon: BookOpen },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Challenge', path: '/challenge', icon: Trophy },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed } = useTerminalStore();

  return (
    <aside
      className={`bg-[#161D2A] border-r border-[#1E293B] flex flex-col select-none transition-all duration-200 ${
        isSidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* App Branding Header */}
      <div className="h-14 px-3 flex items-center space-x-2.5 border-b border-[#1E293B] shrink-0">
        <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0">
          A
        </div>
        {!isSidebarCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-[#F8FAFC] tracking-wide leading-none truncate">
              AlgoApp <span className="text-[#3B82F6]">Pro</span>
            </span>
            <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5">v2.0.0 Terminal</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto no-scrollbar">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isSidebarCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                isActive
                  ? 'bg-[#3B82F6]/15 text-[#3B82F6] font-semibold border-l-4 border-l-[#3B82F6] border-t border-r border-b border-[#3B82F6]/30'
                  : 'text-[#94A3B8] hover:bg-[#1E2638] hover:text-[#F8FAFC]'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0B0E14] text-[10px] text-[#94A3B8] flex items-center justify-between font-mono shrink-0">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse shrink-0"></span>
          {!isSidebarCollapsed && <span>Engine Online</span>}
        </div>
        {!isSidebarCollapsed && <span className="text-[#3B82F6] font-bold">PAPER</span>}
      </div>
    </aside>
  );
};
