import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award } from 'lucide-react';

export const ChallengePage: React.FC = () => {
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
            <Trophy className="w-5 h-5 text-[#F59E0B]" />
            Trader Challenges
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Rules-based evaluation challenges, target drawdown monitoring, and scoring leaderboards.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3 py-1.5 rounded-md text-xs font-mono text-[#F59E0B]">
          <Award className="w-4 h-4" />
          <span>CHALLENGE MODULE</span>
        </div>
      </div>

      <div className="bg-[#161D2A] border border-[#1E293B] rounded-lg p-6 text-center space-y-3">
        <Trophy className="w-12 h-12 text-[#F59E0B] mx-auto opacity-80" />
        <h2 className="text-base font-semibold text-[#F8FAFC]">Trader Challenge Interface Base</h2>
        <p className="text-xs text-[#94A3B8] max-w-xl mx-auto">
          Challenge rules definitions, loss limit evaluators, and dispute handling workflows will be integrated when the challenge phase is activated.
        </p>
      </div>
    </motion.div>
  );
};
