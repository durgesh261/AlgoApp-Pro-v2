import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Activity, ShieldCheck, Cpu } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[#3B82F6]" />
            Trading Terminal Overview
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Single-user execution baseline, risk status, and module health monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#161D2A] border border-[#1E293B] px-3 py-1.5 rounded-md text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>SINGLE-USER ENGINE ONLINE</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-4 space-y-2">
          <span className="text-xs text-[#94A3B8] font-medium">System Health</span>
          <div className="text-2xl font-bold text-[#00C896] font-mono flex items-center justify-between">
            <span>HEALTHY</span>
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-[11px] text-[#64748B]">All core platform modules initialized</p>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-4 space-y-2">
          <span className="text-xs text-[#94A3B8] font-medium">Architecture Mode</span>
          <div className="text-xl font-bold text-[#F8FAFC] font-mono">SINGLE-USER</div>
          <p className="text-[11px] text-[#64748B]">Zero multi-tenant overhead</p>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-4 space-y-2">
          <span className="text-xs text-[#94A3B8] font-medium">Risk Gate Status</span>
          <div className="text-xl font-bold text-[#3B82F6] font-mono flex items-center justify-between">
            <span>ARMED</span>
            <Cpu className="w-5 h-5" />
          </div>
          <p className="text-[11px] text-[#64748B]">Fail-closed policy enforced</p>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-4 space-y-2">
          <span className="text-xs text-[#94A3B8] font-medium">API Latency</span>
          <div className="text-2xl font-bold text-[#00C896] font-mono">12 ms</div>
          <p className="text-[11px] text-[#64748B]">Direct local connection</p>
        </div>
      </div>

      {/* Module Overview Panel */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-5 space-y-3">
        <h2 className="text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider font-mono">
          Platform Feature Architecture Baseline
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            'Paper Trading Module',
            'Live Trading Module',
            'Analysis Engine',
            'Trade Journal',
            'Analytics Pipeline',
            'Challenge System',
            'Settings & Config',
            'Database Service',
          ].map((item) => (
            <div key={item} className="bg-[#1E2638] border border-[#334155] p-3 rounded-md flex items-center justify-between">
              <span className="text-[#94A3B8] font-medium">{item}</span>
              <span className="w-2 h-2 rounded-full bg-[#00C896]" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
