import React from 'react';
import { motion } from 'framer-motion';
import { ChallengeSummaryWidget } from '../../components/widgets/ChallengeSummaryWidget';
import { ChallengeProgressChart } from '../../components/charts/ChallengeProgressChart';
import { Trophy, Award, ShieldCheck } from 'lucide-react';

export const ChallengePage: React.FC = () => {
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
            <Trophy className="w-5 h-5 text-[#F59E0B]" />
            Trader Evaluation Challenge Monitor
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Rules-based challenge rules, daily loss limit tracking, and profit target progression.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-1.5 rounded-md text-xs font-mono text-[#F59E0B]">
          <Award className="w-4 h-4" />
          <span>PHASE 1 EVALUATION ACTIVE</span>
        </div>
      </div>

      <ChallengeSummaryWidget />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChallengeProgressChart />
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
            <ShieldCheck className="w-4 h-4 text-[#00C896]" />
            <h3 className="font-bold text-[#F8FAFC] uppercase tracking-wider">
              Challenge Governance Rules
            </h3>
          </div>

          <div className="space-y-2">
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Profit Target</span>
              <span className="text-[#00C896] font-bold">+$1,400.00 (14.0%)</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Max Daily Drawdown</span>
              <span className="text-[#F6465D] font-bold">-$500.00 (5.0%)</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Max Total Drawdown</span>
              <span className="text-[#F6465D] font-bold">-$1,000.00 (10.0%)</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Minimum Trading Days</span>
              <span className="text-[#00C896] font-bold">5 Days (PASSED)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
