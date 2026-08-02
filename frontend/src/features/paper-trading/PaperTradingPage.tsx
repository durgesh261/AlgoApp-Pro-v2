import React from 'react';
import { motion } from 'framer-motion';
import { OpenTradesTable } from '../../components/tables/OpenTradesTable';
import { SignalsTable } from '../../components/tables/SignalsTable';
import { FileCode, Shield, DollarSign } from 'lucide-react';

export const PaperTradingPage: React.FC = () => {
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
            <FileCode className="w-5 h-5 text-[#3B82F6]" />
            Paper Trading Terminal
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Simulated execution engine, zero-risk paper account, and paper position tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs font-mono text-[#3B82F6]">
          <Shield className="w-4 h-4" />
          <span>PAPER SIMULATION ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block">Paper Account Equity</span>
          <div className="text-2xl font-bold text-[#00C896] mt-1">$50,000.00</div>
          <span className="text-[10px] text-[#00C896]">$0 Risk to Live Funds</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block">Simulated Win Rate</span>
          <div className="text-2xl font-bold text-[#3B82F6] mt-1">72.4%</div>
          <span className="text-[10px] text-[#94A3B8]">29 Paper Fills</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block">Virtual Profit Realized</span>
          <div className="text-2xl font-bold text-[#00C896] mt-1">+$3,840.50</div>
          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-[#00C896]" /> Paper Account
          </span>
        </div>
      </div>

      <OpenTradesTable />
      <SignalsTable />
    </motion.div>
  );
};
