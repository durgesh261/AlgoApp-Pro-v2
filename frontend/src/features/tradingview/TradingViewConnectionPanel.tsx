import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tradingViewApi } from '../../services/api';
import { Radio, Activity, CheckCircle2, AlertOctagon, Copy } from 'lucide-react';

export const TradingViewConnectionPanel: React.FC = () => {
  const { data: healthData } = useQuery({
    queryKey: ['tradingViewHealth'],
    queryFn: tradingViewApi.getHealth,
    refetchInterval: 3000,
  });

  const { data: eventsData } = useQuery({
    queryKey: ['tradingViewEvents'],
    queryFn: tradingViewApi.getEvents,
    refetchInterval: 3000,
  });

  const { data: errorsData } = useQuery({
    queryKey: ['tradingViewErrors'],
    queryFn: tradingViewApi.getErrors,
    refetchInterval: 3000,
  });

  const health = healthData?.data;
  const events = eventsData?.data || [];
  const errors = errorsData?.data || [];

  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 font-mono select-none shadow-sm">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center space-x-2">
          <Radio className="w-5 h-5 text-[#00C896] animate-pulse" />
          <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
            TradingView Webhook Connection Panel
          </h2>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold ${
            health?.status === 'CONNECTED'
              ? 'bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/40'
              : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>STATUS: {health?.status ?? 'CONNECTED'}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Total Webhooks</span>
          <div className="text-base font-bold text-[#F8FAFC] mt-0.5">{health?.totalWebhooks ?? 0}</div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Avg Latency</span>
          <div className="text-base font-bold text-[#3B82F6] mt-0.5">{health?.averageLatencyMs ?? 0}ms</div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Duplicates Ignored</span>
          <div className="text-base font-bold text-[#F59E0B] mt-0.5">{health?.duplicateCount ?? 0}</div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Dropped Events</span>
          <div className="text-base font-bold text-[#F6465D] mt-0.5">{health?.droppedCount ?? 0}</div>
        </div>

        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Malformed Payloads</span>
          <div className="text-base font-bold text-[#EF4444] mt-0.5">{health?.malformedCount ?? 0}</div>
        </div>
      </div>

      {/* Webhook Endpoint Info */}
      <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#94A3B8] flex items-center gap-1.5">
            <Copy className="w-3.5 h-3.5 text-[#3B82F6]" />
            WEBHOOK ENDPOINT URL
          </span>
          <span className="text-[10px] text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded">POST /api/v1/tradingview/webhook</span>
        </div>
        <div className="text-[11px] text-[#64748B]">
          Supports 1H canonical candles for BTCUSD.P, ETHUSD.P, SOLUSD.P, XRPUSD.P. Automatically normalizes & deduplicates payloads.
        </div>
      </div>

      {/* Events & Errors Split Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Events Log */}
        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
            <span className="font-bold text-[#F8FAFC] text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00C896]" />
              RECEIVER EVENT STREAM ({events.length})
            </span>
            <span className="text-[10px] text-[#64748B]">REALTIME</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="text-[11px] text-[#64748B]">No webhook events logged yet.</div>
            ) : (
              events.map((e) => (
                <div key={e.id} className="bg-[#161D2A] border border-[#1E293B] p-2 rounded text-[11px] flex items-center justify-between">
                  <span className="font-bold text-[#3B82F6]">{e.symbol}</span>
                  <span className="text-[10px] bg-[#00C896]/20 text-[#00C896] px-1.5 py-0.5 rounded">{e.status}</span>
                  <span className="text-[10px] text-[#64748B]">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Errors Log */}
        <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5">
            <span className="font-bold text-[#F8FAFC] text-[11px] flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-[#F6465D]" />
              MALFORMED & REJECTED LOGS ({errors.length})
            </span>
            <span className="text-[10px] text-[#64748B]">ERRORS</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {errors.length === 0 ? (
              <div className="text-[11px] text-[#64748B]">No webhook errors logged. Clean operational state.</div>
            ) : (
              errors.map((err) => (
                <div key={err.id} className="bg-[#161D2A] border border-[#F6465D]/30 p-2 rounded text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F6465D]">{err.errorType}</span>
                    <span className="text-[10px] text-[#64748B]">{new Date(err.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8]">{err.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
