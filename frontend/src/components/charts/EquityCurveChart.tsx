import React, { useState } from 'react';
import { mockEquityCurveData, EquityPoint } from '../../mock/chartData';
import { TrendingUp } from 'lucide-react';

export const EquityCurveChart: React.FC = () => {
  const points = mockEquityCurveData;
  const maxEquity = Math.max(...points.map((p) => p.equity));
  const minEquity = Math.min(...points.map((p) => p.equity));
  const range = maxEquity - minEquity || 1;

  const [hoveredPoint, setHoveredPoint] = useState<EquityPoint | null>(null);

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
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          {hoveredPoint ? (
            <span className="text-[#00C896] font-bold">
              {hoveredPoint.time}: ${hoveredPoint.equity.toLocaleString()}
            </span>
          ) : (
            <span className="text-[#00C896] font-semibold">
              High: ${maxEquity.toLocaleString()}
            </span>
          )}
        </div>
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

          {/* Hover Crosshair Point */}
          {points.map((p, idx) => {
            const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((p.equity - minEquity) / range) * (height - 2 * padding);
            const isHovered = hoveredPoint?.time === p.time;

            return (
              <g key={p.time}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className={`cursor-pointer transition-all ${
                    isHovered ? 'fill-[#00C896] stroke-white stroke-2' : 'fill-[#00C896] stroke-[#0B0E14] stroke-2'
                  }`}
                />
              </g>
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
