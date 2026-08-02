import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle } from 'lucide-react';

export const LiveTradingPage: React.FC = () => {
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
            <Zap className="w-5 h-5 text-[#F59E0B]" />
            Live Trading Controls
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Production execution boundaries, account limits, and real-time venue connections.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-1.5 rounded-md text-xs font-mono text-[#F59E0B]">
          <AlertTriangle className="w-4 h-4" />
          <span>LIVE EXECUTION GATE</span>
        </div>
      </div>

      <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-6 text-center space-y-3">
        <Zap className="w-12 h-12 text-[#F59E0B] mx-auto opacity-80" />
        <h2 className="text-base font-semibold text-[#F8FAFC]">Live Trading Environment Surface Prepared</h2>
        <p className="text-xs text-[#94A3B8] max-w-xl mx-auto">
          Live execution safeguards, risk policy gates, and venue adapters will be connected in future phases. No live order placement or exchange credentials exist in this baseline.
        </p>
      </div>
    </motion.div>
  );
};
