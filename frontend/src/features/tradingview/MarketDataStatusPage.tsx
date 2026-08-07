import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../../services/api';
import { useDeltaStore } from '../../store/useDeltaStore';
import { Activity, Wifi, WifiOff, Database } from 'lucide-react';

const SYMBOLS = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];

export const MarketDataStatusPage: React.FC = () => {
  const { isConnected } = useDeltaStore();

  const { data: healthData } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: systemApi.getReadiness,
    refetchInterval: 2000,
  });

  const health = healthData?.data;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-6 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00C896]" />
            Market Data & System Health
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Live connection status to Delta Exchange India. Backend is the single source of truth.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold border ${
          isConnected 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
            : 'bg-red-500/10 text-red-400 border-red-500/30'
        }`}>
          {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span>{isConnected ? 'DELTA LIVE' : 'DISCONNECTED'}</span>
        </div>
      </div>

      {/* Scanner State */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Scanner</span>
          <div className="text-lg font-bold text-[#F8FAFC] mt-0.5 font-mono-tabular">
            ACTIVE
          </div>
        </div>
        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Backend</span>
          <div className="text-lg font-bold text-[#3B82F6] mt-0.5 font-mono-tabular">
            {health?.status || 'UNKNOWN'}
          </div>
        </div>
        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Database</span>
          <div className="text-lg font-bold text-[#00C896] mt-0.5 font-mono-tabular">
            <Database className="w-4 h-4 inline mr-1" />
            {health?.database || 'SQLITE'}
          </div>
        </div>
        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Version</span>
          <div className="text-sm font-bold text-[#F8FAFC] mt-0.5 truncate">
            {health?.version || 'N/A'}
          </div>
        </div>
      </div>

      {/* Symbol Ticker Table */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[#0E121A] text-[#94A3B8]">
            <tr>
              <th className="px-4 py-2 text-left">Symbol</th>
              <th className="px-4 py-2 text-right">Mark Price</th>
              <th className="px-4 py-2 text-right">24h Change</th>
              <th className="px-4 py-2 text-center">WebSocket</th>
            </tr>
          </thead>
          <tbody>
            {SYMBOLS.map((sym) => (
              <tr key={sym} className="border-t border-[#1E293B]">
                <td className="px-4 py-2 font-bold text-[#F8FAFC]">{sym}</td>
                <td className="px-4 py-2 text-right font-mono-tabular text-[#F8FAFC]">
                  {(health as any)?.prices?.[sym] ? `$${(health as any).prices[sym].toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-2 text-right font-mono-tabular">
                  {(health as any)?.changes?.[sym] !== undefined ? (
                    <span className={(health as any).changes[sym] >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {(health as any).changes[sym] >= 0 ? '+' : ''}{(health as any).changes[sym].toFixed(2)}%
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Strategy Rules Reminder */}
      <div className="bg-[#0E121A] border border-[#1E293B] rounded-xl p-4">
        <h3 className="text-xs font-bold text-[#F8FAFC] mb-2">Strategy Rules Active</h3>
        <ul className="text-[10px] text-[#94A3B8] space-y-1">
          <li>• TradingView is visualization ONLY — signals generated by native backend indicator engine</li>
          <li>• No TradingView alerts, webhooks, or Pine Script execution</li>
          <li>• Delta Exchange India is the single source of market and account data</li>
          <li>• 1H timeframe only — no 15M or other timeframe decisions</li>
          <li>• Only BTCUSD.P, ETHUSD.P, SOLUSD.P, XRPUSD.P</li>
        </ul>
      </div>
    </div>
  );
};
