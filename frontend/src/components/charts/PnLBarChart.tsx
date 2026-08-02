import React from 'react';
import { mockPnLBarData } from '../../mock/chartData';
import { BarChart2 } from 'lucide-react';

export const PnLBarChart: React.FC = () => {
  const data = mockPnLBarData;
  const maxVal = 700;

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-[#00C896]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Daily Realized vs Unrealized P&L
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-[#00C896]"><span className="w-2 h-2 rounded bg-[#00C896]" /> Realized Profit</span>
          <span className="flex items-center gap-1 text-[#3B82F6]"><span className="w-2 h-2 rounded bg-[#3B82F6]" /> Unrealized</span>
        </div>
      </div>

      <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-[#1E293B]">
        {data.map((item) => {
          const realizedHeight = (Math.abs(item.realized) / maxVal) * 100;
          const unrealizedHeight = (Math.abs(item.unrealized) / maxVal) * 100;

          return (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full flex items-end justify-center gap-1 h-32 relative">
                {/* Realized Bar */}
                <div
                  className={`w-3.5 rounded-t transition-all ${
                    item.realized >= 0 ? 'bg-[#00C896]' : 'bg-[#F6465D]'
                  }`}
                  style={{ height: `${Math.max(realizedHeight, 10)}%` }}
                  title={`Realized: $${item.realized}`}
                />
                {/* Unrealized Bar */}
                <div
                  className="w-3.5 bg-[#3B82F6] rounded-t transition-all opacity-80"
                  style={{ height: `${Math.max(unrealizedHeight, 8)}%` }}
                  title={`Unrealized: $${item.unrealized}`}
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
