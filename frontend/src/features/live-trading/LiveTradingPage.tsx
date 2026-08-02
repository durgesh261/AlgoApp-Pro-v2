import React from 'react';
import { motion } from 'framer-motion';
import { OpenTradesTable } from '../../components/tables/OpenTradesTable';
import { ActivityLogTable } from '../../components/tables/ActivityLogTable';
import { Zap, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';

export const LiveTradingPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6"
    >
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F59E0B]" />
            Live Trading Controls & Safety Boundary
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Production account safeguards, fail-closed policy gates, and real-time execution bounds.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-1.5 rounded-md text-xs font-mono text-[#F59E0B]">
          <AlertTriangle className="w-4 h-4" />
          <span>LIVE RISK GATE ARMED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block">Max Account Loss Ceiling</span>
          <div className="text-2xl font-bold text-[#F6465D] mt-1">-$1,000.00</div>
          <span className="text-[10px] text-[#94A3B8]">Automatic Halt Trigger</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block">Max Position Exposure</span>
          <div className="text-2xl font-bold text-[#F8FAFC] mt-1">$50,000.00</div>
          <span className="text-[10px] text-[#00C896]">34.5% Currently Utilized</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block">Kill Switch Readiness</span>
          <div className="text-2xl font-bold text-[#00C896] mt-1 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#00C896]" />
            <span>ARMED</span>
          </div>
          <span className="text-[10px] text-[#00C896] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Fail-Closed Active
          </span>
        </div>
      </div>

      <OpenTradesTable />
      <ActivityLogTable />
    </motion.div>
  );
};
