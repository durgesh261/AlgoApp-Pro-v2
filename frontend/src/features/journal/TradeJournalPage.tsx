import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar } from 'lucide-react';

export const TradeJournalPage: React.FC = () => {
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
            <BookOpen className="w-5 h-5 text-[#3B82F6]" />
            Trade Journal
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Execution logging, decision rationale tracking, and post-trade performance notes.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#161D2A] border border-[#1E293B] px-3 py-1.5 rounded-md text-xs font-mono text-[#94A3B8]">
          <Calendar className="w-4 h-4 text-[#3B82F6]" />
          <span>JOURNAL SYSTEM</span>
        </div>
      </div>

      <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-6 text-center space-y-3">
        <BookOpen className="w-12 h-12 text-[#3B82F6] mx-auto opacity-80" />
        <h2 className="text-base font-semibold text-[#F8FAFC]">Trade Journal Interface Ready</h2>
        <p className="text-xs text-[#94A3B8] max-w-xl mx-auto">
          Audit history, manual trade tagging, and execution log reviews will populate as trade executions are recorded in future phases.
        </p>
      </div>
    </motion.div>
  );
};
