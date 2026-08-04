import React from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useMarketPairs } from '../../hooks/useMarketPairs';
import { WidgetSkeleton } from '../ui/SkeletonLoader';
import {
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Clock,
  Zap,
  BarChart3,
} from 'lucide-react';

export const CurrentPairWidget: React.FC = () => {
  const { activeSymbol } = useTerminalStore();
  const { pairs, isLoading } = useMarketPairs();
  const pair = pairs[activeSymbol];

  if (isLoading && !pair) {
    return <WidgetSkeleton />;
  }

  if (!pair) {
    return (
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 text-xs text-[#94A3B8] font-mono">
        No live data available for {activeSymbol}.
      </div>
    );
  }

  const confidence = pair.signalConfidence ?? pair.topZone?.strength ?? null;
  const status = pair.signalOutcome ?? (pair.topZone ? pair.topZone.status : 'NO SIGNAL');

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#1E2638] border border-[#334155] flex items-center justify-center font-bold text-[#F8FAFC]">
            {pair.symbol.substring(0, 3)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-[#F8FAFC] font-mono">{pair.symbol}</h2>
              <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-0.5 rounded font-mono font-semibold">
                PERPETUAL
              </span>
            </div>
            <span className="text-xs text-[#94A3B8]">{pair.name}</span>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-xl font-bold text-[#F8FAFC]">{pair.priceLabel}</div>
          <div
            className={`text-xs font-semibold flex items-center justify-end ${
              pair.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'
            }`}
          >
            {pair.isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
            {pair.changeLabel}
          </div>
        </div>
      </div>

      {/* Widget Key Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Trend</span>
          <div className="font-bold text-[#00C896] text-xs truncate">{pair.trend.replace(/_/g, ' ')}</div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Active Zone</span>
          <div className="font-bold text-[#3B82F6] text-xs truncate">
            {pair.topZone ? pair.topZone.type.replace(/_/g, ' ') : 'NONE'}
          </div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Confidence</span>
          <div className="font-bold text-[#F8FAFC] text-xs flex items-center gap-1">
            <Target className="w-3 h-3 text-[#00C896]" />
            <span>{confidence !== null ? `${confidence}%` : '—'}</span>
          </div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Volatility</span>
          <div className="font-bold text-[#00C896] text-xs flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#00C896]" />
            <span>{pair.volatility}</span>
          </div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Session</span>
          <div className="font-bold text-[#F8FAFC] text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="truncate">{pair.session}</span>
          </div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Signal / Zone Status</span>
          <div className="font-bold text-[#00C896] text-xs flex items-center gap-1 truncate">
            <Zap className="w-3 h-3" />
            <span className="truncate">{status.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Support & Resistance Bar (derived from strongest active zone bounds) */}
      {pair.topZone && (
        <div className="flex items-center justify-between bg-[#1E2638] px-3 py-2 rounded-lg text-xs font-mono border border-[#334155]">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-[#94A3B8]">Zone Bounds:</span>
            <span className="text-[#00C896]">Lower: <strong>{pair.topZone.lowerPrice}</strong></span>
            <span className="text-[#F6465D]">Upper: <strong>{pair.topZone.upperPrice}</strong></span>
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            Touches: <strong className="text-[#F8FAFC]">{pair.topZone.touchCount}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
