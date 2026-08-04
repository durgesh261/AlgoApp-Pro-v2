import React from 'react';
import { motion } from 'framer-motion';
import { TradeHistoryTable } from '../../components/tables/TradeHistoryTable';
import { ActivityLogTable } from '../../components/tables/ActivityLogTable';
import { BookOpen, Calendar, Tag } from 'lucide-react';

export const TradeJournalPage: React.FC = () => {
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
            <BookOpen className="w-5 h-5 text-[#3B82F6]" />
            Trade Execution Journal & Audit Log
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Post-trade execution audit, decision tagging, and strategy rationale performance logs.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#161D2A] border border-[#1E293B] px-3 py-1.5 rounded-md text-xs font-mono text-[#94A3B8]">
          <Calendar className="w-4 h-4 text-[#3B82F6]" />
          <span>JOURNAL AUDIT STREAM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block">Total Trades Journaled</span>
          <div className="text-2xl font-bold text-[#F8FAFC] mt-1">75 Fills</div>
          <span className="text-[10px] text-[#00C896]">100% Provenance Recorded</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block">Average Hold Duration</span>
          <div className="text-2xl font-bold text-[#3B82F6] mt-1">2h 45m</div>
          <span className="text-[10px] text-[#94A3B8]">Intraday Scalp & Swing</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block">Top Tagged Rationale</span>
          <div className="text-xl font-bold text-[#00C896] mt-1 flex items-center gap-1">
            <Tag className="w-4 h-4 text-[#00C896]" />
            <span>BREAKOUT_MOMENTUM</span>
          </div>
          <span className="text-[10px] text-[#94A3B8]">64.2% Win Rate</span>
        </div>
      </div>

      <TradeHistoryTable />
      <ActivityLogTable />
    </motion.div>
  );
};
