import React from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { mockMarketPairs } from '../../mock/marketData';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldAlert, 
  Clock, 
  Zap,
  BarChart3
} from 'lucide-react';

export const CurrentPairWidget: React.FC = () => {
  const { activeSymbol } = useTerminalStore();
  const pair = mockMarketPairs[activeSymbol] ?? mockMarketPairs['BTCUSD.P']!;

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
          <div className="text-xl font-bold text-[#F8FAFC]">{pair.price}</div>
          <div
            className={`text-xs font-semibold flex items-center justify-end ${
              pair.isPositive ? 'text-[#00C896]' : 'text-[#F6465D]'
            }`}
          >
            {pair.isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
            {pair.change24h}
          </div>
        </div>
      </div>

      {/* Widget Key Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs font-mono">
        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Current Trend</span>
          <div className="font-bold text-[#00C896] text-xs truncate">{pair.trend.replace('_', ' ')}</div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Current Zone</span>
          <div className="font-bold text-[#3B82F6] text-xs truncate">{pair.zone.replace('_', ' ')}</div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Confidence</span>
          <div className="font-bold text-[#F8FAFC] text-xs flex items-center gap-1">
            <Target className="w-3 h-3 text-[#00C896]" />
            <span>{pair.confidenceScore}%</span>
          </div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Market Structure</span>
          <div className="font-bold text-[#F8FAFC] text-xs truncate">{pair.marketStructure.replace('_', ' ')}</div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Risk Score</span>
          <div className="font-bold text-[#00C896] text-xs flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#00C896]" />
            <span>{pair.riskRating}</span>
          </div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Expected R:R</span>
          <div className="font-bold text-[#F8FAFC] text-xs">{pair.expectedRR}</div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Waiting Status</span>
          <div className="font-bold text-[#F59E0B] text-xs flex items-center gap-1 truncate">
            <Clock className="w-3 h-3" />
            <span className="truncate">{pair.waitingStatus.replace(/_/g, ' ')}</span>
          </div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg space-y-1">
          <span className="text-[#94A3B8] text-[10px] uppercase font-sans">Trade Status</span>
          <div className="font-bold text-[#00C896] text-xs flex items-center gap-1 truncate">
            <Zap className="w-3 h-3" />
            <span className="truncate">{pair.tradeStatus.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Support & Resistance Bar */}
      <div className="flex items-center justify-between bg-[#1E2638] px-3 py-2 rounded-lg text-xs font-mono border border-[#334155]">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-[#3B82F6]" />
          <span className="text-[#94A3B8]">Key Levels:</span>
          <span className="text-[#00C896]">Support: <strong>{pair.supportLevel}</strong></span>
          <span className="text-[#F6465D]">Resistance: <strong>{pair.resistanceLevel}</strong></span>
        </div>
        <div className="text-[11px] text-[#94A3B8]">24h Volume: <strong className="text-[#F8FAFC]">{pair.volume24h}</strong></div>
      </div>
    </div>
  );
};
