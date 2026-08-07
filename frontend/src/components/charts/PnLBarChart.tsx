import React, { useEffect, useState } from 'react';
import { tradeAccountingApi } from '../../services/api';
import { EmptyState } from '../ui/EmptyState';
import { WidgetSkeleton } from '../ui/SkeletonLoader';
import { BarChart2 } from 'lucide-react';

interface DayPnL {
  date: string;
  realized: number;
}

export const PnLBarChart: React.FC = () => {
  const [data, setData] = useState<DayPnL[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    tradeAccountingApi
      .getLedger()
      .then((res) => {
        if (!active) return;
        const closed = res.data ?? [];
        const byDay = new Map<string, number>();
        for (const pos of closed) {
          if (!pos.closedAt) continue;
          const day = new Date(pos.closedAt).toLocaleDateString(undefined, { weekday: 'short' });
          byDay.set(day, (byDay.get(day) ?? 0) + pos.netPnL);
        }
        setData(Array.from(byDay.entries()).map(([date, realized]) => ({ date, realized })));
      })
      .catch(() => { if (active) setData([]); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  if (isLoading) return <WidgetSkeleton />;

  if (data.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="No realized P&L yet"
        description="Daily P&L bars appear here as your paper trades close."
      />
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.abs(d.realized)), 1);

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-[#00C896]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Daily Realized P&L
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-[#00C896]"><span className="w-2 h-2 rounded bg-[#00C896]" /> Profit</span>
          <span className="flex items-center gap-1 text-[#F6465D]"><span className="w-2 h-2 rounded bg-[#F6465D]" /> Loss</span>
        </div>
      </div>

      <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-[#1E293B]">
        {data.map((item) => {
          const barHeight = (Math.abs(item.realized) / maxVal) * 100;

          return (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full flex items-end justify-center gap-1 h-32 relative">
                <div
                  className={`w-4 rounded-t transition-all ${
                    item.realized >= 0 ? 'bg-[#00C896]' : 'bg-[#F6465D]'
                  }`}
                  style={{ height: `${Math.max(barHeight, 6)}%` }}
                  title={`Realized: $${item.realized.toFixed(2)}`}
                />
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8] group-hover:text-[#F8FAFC]">
                {item.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
