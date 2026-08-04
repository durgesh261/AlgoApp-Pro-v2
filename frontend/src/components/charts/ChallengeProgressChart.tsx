import React, { useEffect, useState } from 'react';
import { tradeAccountingApi } from '../../services/api';
import { ChallengeStateDto } from '@algoapp/shared';
import { WidgetSkeleton } from '../ui/SkeletonLoader';
import { Trophy } from 'lucide-react';

export const ChallengeProgressChart: React.FC = () => {
  const [challenge, setChallenge] = useState<ChallengeStateDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    tradeAccountingApi
      .getChallenge()
      .then((res) => { if (active) setChallenge(res.data); })
      .catch(() => { if (active) setChallenge(null); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  if (isLoading) return <WidgetSkeleton />;
  if (!challenge) {
    return (
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 text-xs text-[#94A3B8] font-mono">
        Challenge state unavailable.
      </div>
    );
  }

  const targetBalance = challenge.initialBalance * (1 + challenge.totalTargetPercent / 100);
  const drawdownFloor = challenge.initialBalance * (1 - challenge.maxOverallDrawdownPercent / 100);
  const range = targetBalance - drawdownFloor || 1;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((challenge.currentBalance - drawdownFloor) / range) * 100)
  );

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-[#F59E0B]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Challenge Progress — Day {challenge.currentDay} of {challenge.currentDay + challenge.remainingDays}
          </h3>
        </div>
        <span className="text-[10px] text-[#94A3B8] font-mono uppercase">{challenge.status}</span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        <div className="flex justify-between text-[#94A3B8]">
          <span>Drawdown Floor: ${drawdownFloor.toFixed(2)}</span>
          <span>Target: ${targetBalance.toFixed(2)}</span>
        </div>
        <div className="relative h-3 rounded-full bg-[#0B0E14] border border-[#1E293B] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F6465D] via-[#F59E0B] to-[#00C896] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-center text-[#F8FAFC] font-bold text-sm">
          ${challenge.currentBalance.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1 border-t border-[#1E293B]">
        <div className="bg-[#0B0E14] border border-[#1E293B] p-2 rounded space-y-0.5">
          <div className="text-[#94A3B8]">Net Profit</div>
          <div className={`font-bold ${challenge.netProfit >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
            ${challenge.netProfit.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#0B0E14] border border-[#1E293B] p-2 rounded space-y-0.5">
          <div className="text-[#94A3B8]">Winning Days</div>
          <div className="font-bold text-[#00C896]">{challenge.winningDays}</div>
        </div>
        <div className="bg-[#0B0E14] border border-[#1E293B] p-2 rounded space-y-0.5">
          <div className="text-[#94A3B8]">Losing Days</div>
          <div className="font-bold text-[#F6465D]">{challenge.losingDays}</div>
        </div>
      </div>
    </div>
  );
};
