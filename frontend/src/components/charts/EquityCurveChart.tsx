import React from 'react';
import { mockEquityCurveData } from '../../mock/chartData';
import { TrendingUp } from 'lucide-react';

export const EquityCurveChart: React.FC = () => {
  const points = mockEquityCurveData;
  const maxEquity = Math.max(...points.map((p) => p.equity));
  const minEquity = Math.min(...points.map((p) => p.equity));
  const range = maxEquity - minEquity || 1;

  // SVG coordinate transformation
  const width = 600;
  const height = 180;
  const padding = 20;

  const pathCoordinates = points.map((p, idx) => {
    const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((p.equity - minEquity) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const dPath = `M ${pathCoordinates.join(' L ')}`;
  const areaPath = `${dPath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Equity Curve Real-Time Trajectory
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#00C896] font-semibold">
          High: ${maxEquity.toLocaleString()}
        </span>
      </div>

      <div className="w-full overflow-hidden relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line x1={padding} y1={height / 4} x2={width - padding} y2={height / 4} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1={padding} y1={(3 * height) / 4} x2={width - padding} y2={(3 * height) / 4} stroke="#1E293B" strokeDasharray="3 3" />

          {/* Area Fill */}
          <path d={areaPath} fill="url(#equityGradient)" />

          {/* Equity Line */}
          <path d={dPath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, idx) => {
            const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((p.equity - minEquity) / range) * (height - 2 * padding);
            return (
              <circle
                key={p.time}
                cx={x}
                cy={y}
                r="3"
                className="fill-[#00C896] stroke-[#0B0E14] stroke-2 hover:r-5 transition-all"
              >
                <title>{`${p.time} - $${p.equity.toLocaleString()}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] pt-1 border-t border-[#1E293B]">
        {points.map((p) => (
          <span key={p.time}>{p.time}</span>
        ))}
      </div>
    </div>
  );
};
