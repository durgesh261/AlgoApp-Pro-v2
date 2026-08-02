import React from 'react';
import { motion } from 'framer-motion';
import { FileCode, Shield } from 'lucide-react';

export const PaperTradingPage: React.FC = () => {
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
            <FileCode className="w-5 h-5 text-[#3B82F6]" />
            Paper Trading Module
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Simulated execution boundary and paper strategy performance evaluation.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs font-mono text-[#3B82F6]">
          <Shield className="w-4 h-4" />
          <span>PAPER SIMULATION MODE</span>
        </div>
      </div>

      <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-6 text-center space-y-3">
        <FileCode className="w-12 h-12 text-[#3B82F6] mx-auto opacity-80" />
        <h2 className="text-base font-semibold text-[#F8FAFC]">Paper Trading Architecture Initialized</h2>
        <p className="text-xs text-[#94A3B8] max-w-xl mx-auto">
          The paper trading environment interface structure is established according to the design system. Trading logic and simulated order matching are intentionally excluded in this foundation phase.
        </p>
      </div>
    </motion.div>
  );
};
