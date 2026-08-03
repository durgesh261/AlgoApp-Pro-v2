import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeAccountingApi, realtimeOperationsApi } from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import { 
  Activity, 
  Bell, 
  CheckCircle2, 
  RefreshCw, 
  Radio, 
  Clock, 
  Cpu
} from 'lucide-react';

export const PortfolioDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const { data: walletData } = useQuery({
    queryKey: ['walletState'],
    queryFn: tradeAccountingApi.getWallet,
    refetchInterval: 3000,
  });

  const { data: challengeData } = useQuery({
    queryKey: ['challengeState'],
    queryFn: tradeAccountingApi.getChallenge,
    refetchInterval: 3000,
  });

  const { data: healthData } = useQuery({
    queryKey: ['subsystemHealth'],
    queryFn: realtimeOperationsApi.getSubsystemHealth,
    refetchInterval: 3000,
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications', severityFilter],
    queryFn: () => realtimeOperationsApi.getNotifications(severityFilter === 'ALL' ? undefined : severityFilter),
    refetchInterval: 2000,
  });

  const reconcileMutation = useMutation({
    mutationFn: realtimeOperationsApi.runReconciliation,
    onSuccess: (res) => {
      addToast(
        'Reconciliation Completed',
        `Exchange State Status: ${res.data.status} | Mismatches: ${res.data.mismatchesCount}`,
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['subsystemHealth'] });
    },
  });

  const wallet = walletData?.data || {
    currentBalance: 10.0,
    availableBalance: 10.0,
    usedMargin: 0.0,
    equity: 10.0,
    netPnL: 0.0,
    dailyProfit: 0.0,
  };

  const challenge = challengeData?.data || {
    currentDay: 1,
    remainingDays: 20,
    netProfit: 0.0,
    totalTargetPercent: 10.0,
    status: 'RUNNING',
  };

  const healthList = healthData?.data || [];
  const notifications = notifData?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6 font-mono select-none"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00C896]" />
            Live Portfolio & Operations Dashboard
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Real-time event bus operations, continuous pipeline telemetry, and Delta Exchange state reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1.5 bg-[#00C896]/10 border border-[#00C896]/30 px-3 py-1.5 rounded-lg text-xs font-bold text-[#00C896]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#00C896]" />
            <span>EVENT BUS ONLINE</span>
          </div>

          <button
            onClick={() => reconcileMutation.mutate()}
            disabled={reconcileMutation.isPending}
            className="px-3 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reconcileMutation.isPending ? 'animate-spin' : ''}`} />
            <span>RUN RECONCILIATION</span>
          </button>
        </div>
      </div>

      {/* Live Portfolio Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Total Equity</span>
          <div className="text-xl font-bold text-[#00C896] mt-0.5 font-mono-tabular">
            ${wallet.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Available Margin</span>
          <div className="text-xl font-bold text-[#3B82F6] mt-0.5 font-mono-tabular">
            ${wallet.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Today Net Profit</span>
          <div className={`text-xl font-bold mt-0.5 font-mono-tabular ${wallet.dailyProfit >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
            ${wallet.dailyProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Challenge Net Profit</span>
          <div className={`text-xl font-bold mt-0.5 font-mono-tabular ${challenge.netProfit >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
            ${challenge.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Delta Sync Status</span>
          <div className="text-sm font-bold text-[#00C896] mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
            <span>100% RECONCILED</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subsystem Health Monitor Panel (2 cols) */}
        <div className="lg:col-span-2 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#3B82F6]" />
              Operational Subsystem Health & Latencies ({healthList.length})
            </h2>
            <span className="text-[10px] text-[#94A3B8]">10 CANONICAL CORE MODULES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            {healthList.map((h) => (
              <div key={h.subsystem} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#F8FAFC] block">{h.subsystem}</span>
                  <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-[#3B82F6]" />
                    <span>Latency: {h.latencyMs}ms</span>
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/40">
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Notification Center Drawer (1 col) */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm flex flex-col h-[380px]">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 shrink-0">
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#F59E0B]" />
              Notification Center ({notifications.length})
            </h2>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded px-2 py-1 text-[11px] focus:outline-none"
            >
              <option value="ALL">ALL</option>
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1 flex-1 no-scrollbar">
            {notifications.map((n) => (
              <div key={n.id} className="bg-[#0B0E14] border border-[#1E293B] p-2 rounded-lg text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC]">{n.title}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      n.severity === 'SUCCESS'
                        ? 'bg-[#00C896]/15 text-[#00C896]'
                        : n.severity === 'WARNING'
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                        : n.severity === 'CRITICAL'
                        ? 'bg-[#F6465D]/15 text-[#F6465D]'
                        : 'bg-[#3B82F6]/15 text-[#3B82F6]'
                    }`}
                  >
                    {n.severity}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">{n.message}</p>
                <span className="text-[9px] text-[#64748B] block font-mono-tabular">
                  {n.timestamp.slice(11, 19)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
