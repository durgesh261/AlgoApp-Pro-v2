import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Server
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Paper Trading', path: '/paper-trading', icon: Wallet },
  { name: 'Live Trading', path: '/live-trading', icon: Activity },
  { name: 'System Monitor', path: '/system-monitor', icon: Server },
  { name: 'Analysis', path: '/analysis', icon: LineChart },
  { name: 'Replay Terminal', path: '/replay', icon: RotateCcw },
  { name: 'Backtesting', path: '/backtest', icon: BarChart3 },
  { name: 'Trade Journal', path: '/journal', icon: BookOpen },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Challenge', path: '/challenge', icon: Trophy },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-56 bg-[#161D2A] border-r border-[#1E293B] flex flex-col select-none">
      {/* App Branding Header */}
      <div className="h-14 px-4 flex items-center space-x-2 border-b border-[#1E293B]">
        <div className="w-7 h-7 bg-[#3B82F6] rounded flex items-center justify-center font-bold text-white text-sm shadow-md">
          A
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#F8FAFC] tracking-wide leading-none">
            AlgoApp <span className="text-[#3B82F6]">Pro</span>
          </span>
          <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5">v2.0.0 Terminal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#3B82F6]/15 text-[#3B82F6] font-semibold border border-[#3B82F6]/30'
                  : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0B0E14] text-[10px] text-[#94A3B8] flex items-center justify-between font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse"></span>
          <span>Engine Online</span>
        </div>
        <span className="text-[#3B82F6]">PAPER</span>
      </div>
    </aside>
  );
};
