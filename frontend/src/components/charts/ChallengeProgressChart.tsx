import React from 'react';
import { mockChallengeProgressData } from '../../mock/chartData';
import { Trophy } from 'lucide-react';

export const ChallengeProgressChart: React.FC = () => {
  const data = mockChallengeProgressData;
  const maxVal = 12000;
  const minVal = 9000;
  const range = maxVal - minVal;

  const width = 600;
  const height = 180;
  const padding = 20;

  const balancePoints = data.map((d, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.balance - minVal) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const targetPoints = data.map((d, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.targetLine - minVal) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const drawdownPoints = data.map((d, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.drawdownLimit - minVal) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-[#F59E0B]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Challenge Target vs Drawdown Threshold
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-[#00C896]"><span className="w-2 h-2 rounded bg-[#00C896]" /> Current Balance</span>
          <span className="flex items-center gap-1 text-[#3B82F6]"><span className="w-2 h-2 rounded bg-[#3B82F6]" /> Target Line</span>
          <span className="flex items-center gap-1 text-[#F6465D]"><span className="w-2 h-2 rounded bg-[#F6465D]" /> Drawdown Floor</span>
        </div>
      </div>

      <div className="w-full overflow-hidden relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          {/* Target Line (Dotted Blue) */}
          <path d={`M ${targetPoints.join(' L ')}`} fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" />

          {/* Drawdown Floor (Solid Red) */}
          <path d={`M ${drawdownPoints.join(' L ')}`} fill="none" stroke="#F6465D" strokeWidth="2" />

          {/* Actual Balance Path (Solid Green) */}
          <path d={`M ${balancePoints.join(' L ')}`} fill="none" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {data.map((d, idx) => {
            const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((d.balance - minVal) / range) * (height - 2 * padding);
            return (
              <circle key={d.day} cx={x} cy={y} r="3.5" className="fill-[#00C896] stroke-[#0B0E14] stroke-2" />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] pt-1 border-t border-[#1E293B]">
        {data.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </div>
  );
};
