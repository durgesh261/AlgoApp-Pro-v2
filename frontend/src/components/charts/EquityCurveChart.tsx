import React, { useEffect, useState } from 'react';
import { paperTradingApi } from '../../services/api';
import { PaperAnalyticsDto } from '@algoapp/shared';
import { EmptyState } from '../ui/EmptyState';
import { WidgetSkeleton } from '../ui/SkeletonLoader';
import { TrendingUp } from 'lucide-react';

interface Point {
  label: string;
  equity: number;
}

export const EquityCurveChart: React.FC = () => {
  const [data, setData] = useState<PaperAnalyticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hovered, setHovered] = useState<Point | null>(null);

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

  const raw = data?.equityCurve ?? [];
  const points: Point[] = raw.map((p) => ({
    label: (p.time ?? p.timestamp ?? '').slice(11, 16) || (p.time ?? p.timestamp ?? ''),
    equity: p.equity,
  }));

  if (points.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No equity history yet"
        description="Your equity curve builds up as paper trades close."
      />
    );
  }

  const maxEquity = Math.max(...points.map((p) => p.equity));
  const minEquity = Math.min(...points.map((p) => p.equity));
  const range = maxEquity - minEquity || 1;

  const width = 600;
  const height = 180;
  const padding = 20;

  const coords = points.map((p, idx) => {
    const x = padding + (idx / Math.max(points.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - ((p.equity - minEquity) / range) * (height - 2 * padding);
    return { x, y };
  });

  const dPath = `M ${coords.map((c) => `${c.x},${c.y}`).join(' L ')}`;
  const areaPath = `${dPath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider font-mono">
            Equity Curve
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          {hovered ? (
            <span className="text-[#00C896] font-bold">
              {hovered.label}: ${hovered.equity.toLocaleString()}
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

          <line x1={padding} y1={height / 4} x2={width - padding} y2={height / 4} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1={padding} y1={(3 * height) / 4} x2={width - padding} y2={(3 * height) / 4} stroke="#1E293B" strokeDasharray="3 3" />

          <path d={areaPath} fill="url(#equityGradient)" />
          <path d={dPath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, idx) => {
            const { x, y } = coords[idx]!;
            const isHovered = hovered?.label === p.label;
            return (
              <circle
                key={`${p.label}-${idx}`}
                cx={x}
                cy={y}
                r={isHovered ? 6 : 3.5}
                onMouseEnter={() => setHovered(p)}
                onMouseLeave={() => setHovered(null)}
                className={`cursor-pointer transition-all ${
                  isHovered ? 'fill-[#00C896] stroke-white stroke-2' : 'fill-[#00C896] stroke-[#0B0E14] stroke-2'
                }`}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between text-[10px] font-mono text-[#94A3B8] pt-1 border-t border-[#1E293B]">
        {points.map((p, idx) => (
          <span key={`${p.label}-${idx}`}>{p.label}</span>
        ))}
      </div>
    </div>
  );
};
