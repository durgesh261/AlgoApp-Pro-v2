import React from 'react';
import { Trophy, Target, AlertCircle } from 'lucide-react';

export const ChallengeSummaryWidget: React.FC = () => {
  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#F59E0B]" />
          Trader Evaluation Challenge
        </h3>
        <span className="text-[10px] bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-0.5 rounded font-mono font-semibold border border-[#F59E0B]/20">
          DAY 7 OF 30
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[11px] text-[#94A3B8] block">Current Progress</span>
          <div className="text-xl font-bold text-[#00C896] mt-0.5">+$1,250.00</div>
          <span className="text-[10px] text-[#00C896]">89.2% of Profit Target</span>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[11px] text-[#94A3B8] block">Profit Target Line</span>
          <div className="text-xl font-bold text-[#F8FAFC] mt-0.5">$1,400.00</div>
          <span className="text-[10px] text-[#94A3B8] flex items-center gap-0.5">
            <Target className="w-3 h-3 text-[#3B82F6]" /> $150 Remaining
          </span>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[11px] text-[#94A3B8] block">Daily Drawdown Ceiling</span>
          <div className="text-xl font-bold text-[#F6465D] mt-0.5">-$500.00</div>
          <span className="text-[10px] text-[#94A3B8] flex items-center gap-0.5">
            <AlertCircle className="w-3 h-3 text-[#00C896]" /> $500 Buffer Available
          </span>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="space-y-1.5 font-mono">
        <div className="flex justify-between text-xs">
          <span className="text-[#94A3B8]">Challenge Completion Progress</span>
          <span className="text-[#00C896] font-bold">89.2% Completed</span>
        </div>
        <div className="h-2 w-full bg-[#0B0E14] rounded-full overflow-hidden border border-[#1E293B]">
          <div
            className="h-full bg-gradient-to-r from-[#F59E0B] to-[#00C896] rounded-full"
            style={{ width: '89.2%' }}
          />
        </div>
      </div>
    </div>
  );
};
