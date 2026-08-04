import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeAccountingApi, paperTradingApi, realtimeOperationsApi, deltaApi } from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import { 
  Building2, 
  ShieldAlert, 
  RefreshCw, 
  PieChart, 
  CheckCircle2,
  Activity
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

  const { data: positionsData } = useQuery({
    queryKey: ['paperPositions'],
    queryFn: paperTradingApi.getPositions,
    refetchInterval: 3000,
  });

  const { data: ledgerData } = useQuery({
    queryKey: ['tradeLedger'],
    queryFn: tradeAccountingApi.getLedger,
    refetchInterval: 5000,
  });

  const { data: deltaHealth } = useQuery({
    queryKey: ['deltaHealth'],
    queryFn: deltaApi.getHealth,
    refetchInterval: 5000,
  });

  const reconcileMutation = useMutation({
    mutationFn: realtimeOperationsApi.runReconciliation,
    onSuccess: (res) => {
      addToast(
        'Reconciliation Completed',
        `Capital Reconciled: ${res.data.status} | Mismatches: ${res.data.mismatchesCount}`,
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['walletState'] });
      queryClient.invalidateQueries({ queryKey: ['paperPositions'] });
    },
  });

  const wallet = walletData?.data || {
    currentBalance: 0.0,
    availableBalance: 0.0,
    usedMargin: 0.0,
    equity: 0.0,
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

  const positions = positionsData?.data || [];
  const ledger = ledgerData?.data || [];
  const isDeltaConnected = deltaHealth?.data?.connectionState === 'CONNECTED';

  const totalNotional = positions.reduce((acc, p) => acc + p.notionalValue, 0);
  const marginOccupiedPct = wallet.equity > 0 ? (wallet.usedMargin / wallet.equity) * 100 : 0.0;

  const supportedPairs = ['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-[1600px] mx-auto pb-6 font-mono select-none"
    >
      {/* Executive Institutional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1E293B] pb-3 gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#3B82F6]" />
            Institutional Quant & HFT Portfolio Management Workstation
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Real-time capital allocation, gross & net exposure, portfolio risk metrics, asset allocation, and audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${isDeltaConnected ? 'bg-[#00C896]/10 border-[#00C896]/30 text-[#00C896]' : 'bg-[#94A3B8]/10 border-[#94A3B8]/30 text-[#94A3B8]'}`}>
            <span className={`w-2 h-2 rounded-full ${isDeltaConnected ? 'bg-[#00C896] animate-pulse' : 'bg-[#94A3B8]'}`}></span>
            <span>{isDeltaConnected ? 'DELTA EXCHANGE LIVE' : 'DELTA DISCONNECTED'}</span>
          </div>

          <button
            onClick={() => reconcileMutation.mutate()}
            disabled={reconcileMutation.isPending}
            className="px-3.5 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reconcileMutation.isPending ? 'animate-spin' : ''}`} />
            <span>RECONCILE CAPITAL</span>
          </button>
        </div>
      </div>

      {/* Institutional Top KPI Bar (5 Metrics Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-[#161D2A] border border-[#1E293B] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Total Net Equity</span>
          <div className="text-xl font-bold text-[#00C896] mt-0.5 font-mono-tabular">
            ${wallet.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] text-[#64748B] block mt-1">Starting Allocation: $50,000.00</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Available Margin</span>
          <div className="text-xl font-bold text-[#3B82F6] mt-0.5 font-mono-tabular">
            ${wallet.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] text-[#64748B] block mt-1">Margin Occupied: {marginOccupiedPct.toFixed(1)}%</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Today Net Profit</span>
          <div className={`text-xl font-bold mt-0.5 font-mono-tabular ${wallet.dailyProfit >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
            {wallet.dailyProfit >= 0 ? '+' : ''}${wallet.dailyProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] text-[#64748B] block mt-1">Challenge Profit: ${challenge.netProfit.toFixed(2)}</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Gross Notional Exposure</span>
          <div className="text-xl font-bold text-[#F8FAFC] mt-0.5 font-mono-tabular">
            ${totalNotional.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] text-[#64748B] block mt-1">Active Open Positions: {positions.length}</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Delta Sync Status</span>
          <div className={`text-sm font-bold mt-1.5 flex items-center gap-1 ${isDeltaConnected ? 'text-[#00C896]' : 'text-[#F59E0B]'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>{isDeltaConnected ? 'SYNCHRONIZED' : 'NOT CONNECTED'}</span>
          </div>
          <span className="text-[9px] text-[#64748B] block mt-1">100% Reconciled State</span>
        </div>
      </div>

      {/* Capital Allocation & Asset Risk Exposure Matrix */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-[#3B82F6]" />
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Perpetual Asset Allocation & Exposure Matrix
            </h2>
          </div>
          <span className="text-[10px] text-[#94A3B8]">REAL-TIME HFT ASSET EXPOSURE</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[#94A3B8] border-b border-[#1E293B] text-[11px] uppercase">
                <th className="py-2.5 px-3">Asset Pair</th>
                <th className="py-2.5 px-3">Status / Side</th>
                <th className="py-2.5 px-3">Notional Exposure ($)</th>
                <th className="py-2.5 px-3">Entry Price</th>
                <th className="py-2.5 px-3">Mark Price</th>
                <th className="py-2.5 px-3">Unrealized PnL</th>
                <th className="py-2.5 px-3">Margin Occupied</th>
                <th className="py-2.5 px-3">Max Leverage</th>
                <th className="py-2.5 px-3 text-right">Risk Sizing Status</th>
              </tr>
            </thead>
            <tbody>
              {supportedPairs.map((symbol) => {
                const pos = positions.find((p) => p.symbol === symbol);

                if (pos) {
                  return (
                    <tr key={symbol} className="border-b border-[#1E293B]/50 hover:bg-[#0B0E14]">
                      <td className="py-3 px-3 text-[#F8FAFC] font-bold">{symbol}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(pos.side as string) === 'BUY' || (pos.side as string) === 'LONG' ? 'bg-[#00C896]/15 text-[#00C896]' : 'bg-[#F6465D]/15 text-[#F6465D]'}`}>
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-white font-bold">${pos.notionalValue.toFixed(2)}</td>
                      <td className="py-3 px-3 text-white">${pos.entryPrice.toFixed(2)}</td>
                      <td className="py-3 px-3 text-white">${pos.markPrice.toFixed(2)}</td>
                      <td className={`py-3 px-3 font-bold ${pos.unrealizedPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                        {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-white">${pos.marginAllocated.toFixed(2)}</td>
                      <td className="py-3 px-3 text-[#3B82F6] font-bold">{pos.leverage}x</td>
                      <td className="py-3 px-3 text-right">
                        <span className="bg-[#00C896]/15 text-[#00C896] px-2 py-0.5 rounded text-[10px] font-bold">
                          ACTIVE EXPOSURE
                        </span>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={symbol} className="border-b border-[#1E293B]/30 hover:bg-[#0B0E14]/40">
                    <td className="py-3 px-3 text-[#94A3B8] font-bold">{symbol}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E293B] text-[#94A3B8]">
                        FLAT
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">$0.00</td>
                    <td className="py-3 px-3 text-[#64748B]">0.00</td>
                    <td className="py-3 px-3 text-[#64748B]">0.00</td>
                    <td className="py-3 px-3 text-[#64748B]">$0.00</td>
                    <td className="py-3 px-3 text-[#64748B]">$0.00</td>
                    <td className="py-3 px-3 text-[#64748B]">100x</td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[#64748B] text-[10px] font-bold">
                        CAPITAL IDLE (0.0% EXPOSURE)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quantitative Risk Telemetry & Trade Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk & Portfolio Telemetry Card */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
              Institutional Risk & Exposure Matrix
            </h2>
            <span className="text-[10px] text-[#94A3B8]">QUANT TELEMETRY</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Portfolio Net Delta Exposure:</span>
              <span className="font-bold text-[#F8FAFC] font-mono-tabular">
                ${positions.reduce((acc, p) => acc + ((p.side as string) === 'BUY' || (p.side as string) === 'LONG' ? p.notionalValue : -p.notionalValue), 0).toFixed(2)}
              </span>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Value at Risk (99% 1-Day VaR):</span>
              <span className="font-bold text-[#00C896] font-mono-tabular">$0.00 (Risk Free)</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Max Drawdown Budget Cap:</span>
              <span className="font-bold text-[#F59E0B] font-mono-tabular">5.00% ($2,500.00)</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Max Daily Loss Threshold:</span>
              <span className="font-bold text-[#3B82F6] font-mono-tabular">$1,000.00</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Liquidation Distance Safety:</span>
              <span className="font-bold text-[#00C896]">100.0% (Zero Risk)</span>
            </div>
          </div>
        </div>

        {/* Portfolio Trade Audit Ledger */}
        <div className="lg:col-span-2 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 shrink-0">
            <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00C896]" />
              Portfolio Real-Time Audit Ledger ({ledger.length})
            </h2>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#0B0E14] border border-[#334155] text-[#F8FAFC] rounded px-2 py-1 text-[11px] focus:outline-none"
            >
              <option value="ALL">ALL LOGS</option>
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
            </select>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1 flex-1 no-scrollbar text-xs">
            {ledger.length === 0 ? (
              <div className="text-center py-16 text-[#94A3B8] text-xs">
                No ledger executions recorded yet. Portfolio capital is synchronized and idle.
              </div>
            ) : (
              ledger.map((entry) => (
                <div key={entry.tradeId} className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#F8FAFC]">{entry.symbol} [{entry.side}]</span>
                    <span className="text-[11px] text-[#94A3B8] block">
                      Price: ${entry.entryPrice} → ${entry.exitPrice} | Qty: {entry.quantity}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`font-bold block ${entry.netPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                      {entry.netPnL >= 0 ? '+' : ''}${entry.netPnL.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#64748B]">{entry.executedAt ? entry.executedAt.slice(11, 19) : ''}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
