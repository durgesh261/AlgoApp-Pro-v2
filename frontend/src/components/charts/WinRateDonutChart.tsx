import React, { useEffect, useState } from 'react';
import { paperTradingApi } from '../../services/api';
import { PaperAnalyticsDto } from '@algoapp/shared';
import { EmptyState } from '../ui/EmptyState';
import { WidgetSkeleton } from '../ui/SkeletonLoader';
import { PieChart } from 'lucide-react';

export const WinRateDonutChart: React.FC = () => {
  const [data, setData] = useState<PaperAnalyticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    paperTradingApi
      .getAnalytics()
      .then((res) => { if (active) setData(res.data); })
      .catch(() => { if (active) setData(null); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  if (isLoading) return <WidgetSkeleton />;

  const wins = data?.winningTrades ?? 0;
  const losses = data?.losingTrades ?? 0;
  const total = data?.totalTrades ?? 0;
  const breakeven = Math.max(0, total - wins - losses);
  const winRatePercent = data?.winRatePercent ?? 0;
  const profitFactor = data?.profitFactor;

  if (total === 0) {
    return (
      <EmptyState
        icon={PieChart}
        title="No closed trades yet"
        description="Win/loss stats appear here once you close your first paper trade."
      />
    );
  }

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <div className="flex items-center space-x-2">
          <PieChart className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Strategy Win / Loss Ratio
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#00C896] font-semibold">
          Profit Factor: {profitFactor !== undefined ? profitFactor.toFixed(2) : '—'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 font-mono">
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#1E293B"
              strokeWidth="4"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#00C896"
              strokeWidth="4"
              strokeDasharray={`${winRatePercent}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-[#00C896]">{winRatePercent.toFixed(1)}%</span>
            <span className="text-[9px] text-[#94A3B8] uppercase">Win Rate</span>
          </div>
        </div>

        <div className="space-y-2 text-xs w-full">
          <div className="flex items-center justify-between bg-[#0B0E14] px-3 py-1.5 rounded border border-[#1E293B]">
            <span className="flex items-center gap-2 text-[#94A3B8]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C896]" /> Winning Trades
            </span>
            <span className="font-bold text-[#00C896]">{wins} ({((wins / total) * 100).toFixed(1)}%)</span>
          </div>

          <div className="flex items-center justify-between bg-[#0B0E14] px-3 py-1.5 rounded border border-[#1E293B]">
            <span className="flex items-center gap-2 text-[#94A3B8]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F6465D]" /> Losing Trades
            </span>
            <span className="font-bold text-[#F6465D]">{losses} ({((losses / total) * 100).toFixed(1)}%)</span>
          </div>

          <div className="flex items-center justify-between bg-[#0B0E14] px-3 py-1.5 rounded border border-[#1E293B]">
            <span className="flex items-center gap-2 text-[#94A3B8]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" /> Break Even
            </span>
            <span className="font-bold text-[#94A3B8]">{breakeven} ({((breakeven / total) * 100).toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
