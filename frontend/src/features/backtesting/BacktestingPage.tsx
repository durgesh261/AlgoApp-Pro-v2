import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backtestApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useToastStore } from '../../store/useToastStore';
import { CurrentPairWidget } from '../../components/widgets/CurrentPairWidget';
import { 
  BarChart3, 
  Play, 
  ShieldCheck, 
  Percent, 
  List
} from 'lucide-react';

export const BacktestingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeSymbol } = useTerminalStore();
  const { addToast } = useToastStore();

  const [initialBalance, setInitialBalance] = useState('50000');

  const { data: sessionsData } = useQuery({
    queryKey: ['backtestSessions'],
    queryFn: backtestApi.getSessions,
  });

  const runBacktestMutation = useMutation({
    mutationFn: backtestApi.runBacktest,
    onSuccess: (res) => {
      addToast(
        'Backtest Completed Successfully',
        `Win Rate: ${res.data.metrics.winRate}% | Net PnL: +$${res.data.metrics.netPnL}`,
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['backtestSessions'] });
    },
  });

  const handleRunBacktest = (e: React.FormEvent) => {
    e.preventDefault();
    runBacktestMutation.mutate({
      symbol: activeSymbol,
      initialBalance: parseFloat(initialBalance),
    });
  };

  const sessions = sessionsData?.data || [];
  const latestSession = sessions[0];
  const metrics = latestSession?.metrics;
  const trades = latestSession?.trades || [];

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
            <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
            Backtesting Core & Performance Engine
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Full 8-stage deterministic strategy backtesting over canonical 1H historical candle data.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs text-[#3B82F6]">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>RULE VERSION: {latestSession?.ruleVersion ?? 'v2.0.0'}</span>
        </div>
      </div>

      <CurrentPairWidget />

      {/* Backtest Session Runner Banner */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <Play className="w-4 h-4 text-[#00C896]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Execute Backtest Session — {activeSymbol}
            </h3>
          </div>
          <span className="text-[10px] bg-[#1E293B] text-[#3B82F6] px-2 py-0.5 rounded font-bold">
            TIMEFRAME: 1H ONLY
          </span>
        </div>

        <form onSubmit={handleRunBacktest} className="flex flex-wrap items-end gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-[#94A3B8] text-[11px] block">Initial Virtual Equity ($)</label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="bg-[#0B0E14] border border-[#334155] rounded px-3 py-1.5 text-[#F8FAFC] font-mono outline-none w-48"
              required
            />
          </div>

          <button
            type="submit"
            disabled={runBacktestMutation.isPending}
            className="px-5 py-2 bg-[#00C896] hover:bg-[#00B084] text-[#0B0E14] font-bold rounded-lg text-xs transition-colors flex items-center space-x-2 shadow-md"
          >
            <Play className="w-4 h-4" />
            <span>{runBacktestMutation.isPending ? 'RUNNING PIPELINE...' : `EXECUTE BACKTEST (${activeSymbol})`}</span>
          </button>
        </form>
      </div>

      {/* Metrics Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Total Trades</span>
            <div className="text-base font-bold text-[#F8FAFC] mt-0.5">{metrics.totalTrades}</div>
            <span className="text-[9px] text-[#64748B] block mt-0.5">Skipped: {metrics.skippedTrades}</span>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Win Rate</span>
            <div className="text-base font-bold text-[#00C896] mt-0.5 flex items-center gap-1">
              <Percent className="w-4 h-4" />
              <span>{metrics.winRate}%</span>
            </div>
            <span className="text-[9px] text-[#64748B] block mt-0.5">Wins: {metrics.winningTrades} / Loss: {metrics.losingTrades}</span>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Profit Factor</span>
            <div className="text-base font-bold text-[#3B82F6] mt-0.5">{metrics.profitFactor}</div>
            <span className="text-[9px] text-[#64748B] block mt-0.5">Avg R:R {metrics.averageRR}</span>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Net PnL</span>
            <div className={`text-base font-bold mt-0.5 ${metrics.netPnL >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
              {metrics.netPnL >= 0 ? `+$${metrics.netPnL.toLocaleString()}` : `-$${Math.abs(metrics.netPnL).toLocaleString()}`}
            </div>
            <span className="text-[9px] text-[#64748B] block mt-0.5">Virtual Equity</span>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Max Drawdown</span>
            <div className="text-base font-bold text-[#F6465D] mt-0.5">-{metrics.maxDrawdown}%</div>
            <span className="text-[9px] text-[#64748B] block mt-0.5">Peak-to-Trough</span>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] p-3 rounded-xl">
            <span className="text-[10px] text-[#94A3B8] uppercase block">Best Trade</span>
            <div className="text-base font-bold text-[#00C896] mt-0.5">+$${metrics.bestTradePnL}</div>
            <span className="text-[9px] text-[#64748B] block mt-0.5">Worst: -${Math.abs(metrics.worstTradePnL)}</span>
          </div>
        </div>
      )}

      {/* Trade Log Table */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <div className="flex items-center space-x-2">
            <List className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Backtest Trade Execution History ({trades.length})
            </h3>
          </div>
          <span className="text-[10px] text-[#94A3B8]">DETERMINISTIC PIPELINE TRADES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs select-none">
            <thead>
              <tr className="bg-[#1E2638] text-[#94A3B8] uppercase text-[10px] border-b border-[#1E293B] h-8">
                <th className="px-3 text-left">Trade ID</th>
                <th className="px-3 text-left">Symbol</th>
                <th className="px-3 text-center">Side</th>
                <th className="px-3 text-right">Entry Price</th>
                <th className="px-3 text-right">Exit Price</th>
                <th className="px-3 text-right">PnL ($)</th>
                <th className="px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-[#64748B]">No backtest trades executed yet.</td>
                </tr>
              ) : (
                trades.map((t) => (
                  <tr key={t.id} className="hover:bg-[#28334A] h-8 transition-colors text-[11px]">
                    <td className="px-3 text-[#3B82F6] font-bold">{t.id}</td>
                    <td className="px-3 font-bold text-[#F8FAFC]">{t.symbol}</td>
                    <td className="px-3 text-center">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          t.side === 'LONG' ? 'bg-[#00C896]/20 text-[#00C896]' : 'bg-[#F6465D]/20 text-[#F6465D]'
                        }`}
                      >
                        {t.side}
                      </span>
                    </td>
                    <td className="px-3 text-right text-[#F8FAFC]">${t.entryPrice.toLocaleString()}</td>
                    <td className="px-3 text-right text-[#F8FAFC]">${t.exitPrice.toLocaleString()}</td>
                    <td className={`px-3 text-right font-bold ${t.pnl >= 0 ? 'text-[#00C896]' : 'text-[#F6465D]'}`}>
                      {t.pnl >= 0 ? `+$${t.pnl.toLocaleString()}` : `-$${Math.abs(t.pnl).toLocaleString()}`}
                    </td>
                    <td className="px-3 text-center">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          t.status === 'WIN' ? 'bg-[#00C896]/15 text-[#00C896]' : 'bg-[#F6465D]/15 text-[#F6465D]'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
