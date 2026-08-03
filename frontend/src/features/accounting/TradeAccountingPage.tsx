import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeAccountingApi } from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import { 
  Wallet, 
  Trophy, 
  BookOpen, 
  RotateCcw, 
  Download
} from 'lucide-react';

export const TradeAccountingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

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

  const { data: ledgerData } = useQuery({
    queryKey: ['tradeLedger'],
    queryFn: tradeAccountingApi.getLedger,
    refetchInterval: 3000,
  });

  const resetChallengeMutation = useMutation({
    mutationFn: tradeAccountingApi.resetChallenge,
    onSuccess: () => {
      addToast('Challenge Reset', '20-Day Challenge and Wallet state have been reset to $50,000', 'info');
      queryClient.invalidateQueries({ queryKey: ['challengeState'] });
      queryClient.invalidateQueries({ queryKey: ['walletState'] });
    },
  });

  const handleExportCsv = () => {
    const downloadUrl = 'http://localhost:4000/api/v1/trade-accounting/export-ledger-csv';
    window.open(downloadUrl, '_blank');
    addToast('Export Started', 'Trade Ledger CSV export initiated', 'info');
  };

  const wallet = walletData?.data || {
    currentBalance: 50000.0,
    availableBalance: 50000.0,
    usedMargin: 0.0,
    equity: 50000.0,
    realizedPnL: 0.0,
    grossPnL: 0.0,
    netPnL: 0.0,
    dailyProfit: 0.0,
    peakEquity: 50000.0,
    maxDrawdownPercent: 0.0,
  };

  const challenge = challengeData?.data || {
    currentDay: 1,
    remainingDays: 20,
    initialBalance: 50000.0,
    currentBalance: 50000.0,
    grossProfit: 0.0,
    netProfit: 0.0,
    totalTargetPercent: 10.0,
    maxDailyDrawdownPercent: 5.0,
    winningDays: 0,
    losingDays: 0,
    winStreak: 0,
    lossStreak: 0,
    status: 'RUNNING',
  };

  const ledger = ledgerData?.data || [];

  const targetProfitUsd = (challenge.totalTargetPercent / 100) * challenge.initialBalance; // $5,000
  const progressPercent = Math.min(100, Math.max(0, (challenge.netProfit / targetProfitUsd) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6 font-mono select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#3B82F6]" />
            Trade Accounting Engine & 20-Day Challenge Manager
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Institutional fee accounting (Maker 0.02%, Taker 0.05%), real-time wallet equity, and 20-day evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => resetChallengeMutation.mutate()}
            disabled={resetChallengeMutation.isPending}
            className="px-3 py-1.5 bg-[#1E2638] hover:bg-[#2D3748] text-[#F8FAFC] font-bold rounded-lg text-xs border border-[#1E293B] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>RESET CHALLENGE</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT LEDGER CSV</span>
          </button>
        </div>
      </div>

      {/* Wallet Financial Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Current Equity</span>
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
          <span className="text-[10px] text-[#94A3B8] uppercase block">Gross Realized PnL</span>
          <div className={`text-xl font-bold mt-0.5 font-mono-tabular ${wallet.grossPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
            ${wallet.grossPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Net Realized PnL (Post-Fees)</span>
          <div className={`text-xl font-bold mt-0.5 font-mono-tabular ${wallet.netPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
            ${wallet.netPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Max Drawdown</span>
          <div className="text-xl font-bold text-[#F59E0B] mt-0.5 font-mono-tabular">
            {wallet.maxDrawdownPercent}%
          </div>
        </div>
      </div>

      {/* 20-Day Challenge Manager Panel */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                20-Day Challenge Manager Status
              </h2>
              <span className="text-[10px] text-[#94A3B8]">INSTITUTIONAL EVALUATION PARAMETERS</span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
              challenge.status === 'PASSED'
                ? 'bg-[#00C896]/20 text-[#00C896] border border-[#00C896]'
                : challenge.status === 'FAILED'
                ? 'bg-[#F6465D]/20 text-[#F6465D] border border-[#F6465D]'
                : 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]'
            }`}
          >
            STATUS: {challenge.status}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#94A3B8]">Profit Target Progress (${challenge.netProfit.toFixed(2)} / ${targetProfitUsd.toFixed(2)})</span>
            <span className="text-[#00C896]">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#0B0E14] h-3 rounded-full overflow-hidden border border-[#1E293B]">
            <div
              className="bg-gradient-to-r from-[#3B82F6] to-[#00C896] h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Challenge Metric Chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
            <span className="text-[#94A3B8]">Day Progress</span>
            <span className="font-bold text-[#F8FAFC]">Day {challenge.currentDay} / 20</span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
            <span className="text-[#94A3B8]">Remaining Days</span>
            <span className="font-bold text-[#3B82F6]">{challenge.remainingDays} Days</span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
            <span className="text-[#94A3B8]">Win / Loss Streak</span>
            <span className="font-bold text-[#00C896]">{challenge.winStreak}W / {challenge.lossStreak}L</span>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E293B] p-2.5 rounded-lg flex items-center justify-between">
            <span className="text-[#94A3B8]">Max Daily Loss Allowed</span>
            <span className="font-bold text-[#F59E0B]">5.0% ($2,500)</span>
          </div>
        </div>
      </div>

      {/* Professional Trade Ledger Table */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#3B82F6]" />
            Professional Trade Ledger Audit Log ({ledger.length})
          </h2>
          <span className="text-[10px] text-[#94A3B8]">28-FIELD CANONICAL EXECUTION AUDIT RECORD</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0B0E14] text-[#94A3B8] border-b border-[#1E293B]">
              <tr>
                <th className="py-2.5 px-3">Trade ID</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">TF</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3 text-right">Entry</th>
                <th className="py-2.5 px-3 text-right">Exit</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Gross PnL</th>
                <th className="py-2.5 px-3 text-right">Fee</th>
                <th className="py-2.5 px-3 text-right">Tax</th>
                <th className="py-2.5 px-3 text-right">Net PnL</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {ledger.map((e) => (
                <tr key={e.id} className="hover:bg-[#1E2638]/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#F8FAFC]">{e.tradeId}</td>
                  <td className="py-2.5 px-3 font-bold text-[#3B82F6]">{e.symbol}</td>
                  <td className="py-2.5 px-3 text-[#94A3B8]">{e.timeframe}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        e.side === 'LONG' ? 'bg-[#00C896]/15 text-[#00C896]' : 'bg-[#F6465D]/15 text-[#F6465D]'
                      }`}
                    >
                      {e.side}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-[#94A3B8]">${e.entryPrice}</td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-[#F8FAFC]">${e.exitPrice}</td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-[#94A3B8]">{e.quantity}</td>
                  <td className={`py-2.5 px-3 text-right font-mono-tabular font-bold ${e.grossPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                    ${e.grossPnL}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-[#F59E0B]">${e.tradingFee}</td>
                  <td className="py-2.5 px-3 text-right font-mono-tabular text-[#94A3B8]">${e.tax}</td>
                  <td className={`py-2.5 px-3 text-right font-mono-tabular font-bold ${e.netPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                    ${e.netPnL}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        e.resultStatus === 'WIN'
                          ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/40'
                          : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/40'
                      }`}
                    >
                      {e.resultStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
