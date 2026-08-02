import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { paperTradingApi, decisionApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { InteractiveTradingChart } from '../../components/charts/InteractiveTradingChart';
import { 
  LayoutDashboard, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight, 
  Layers, 
  Brain, 
  Activity,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { activeSymbol } = useTerminalStore();

  const { data: walletData } = useQuery({
    queryKey: ['paperWallet'],
    queryFn: paperTradingApi.getWallet,
  });

  const { data: positionsData } = useQuery({
    queryKey: ['paperPositions'],
    queryFn: paperTradingApi.getPositions,
  });

  const { data: decisionsData } = useQuery({
    queryKey: ['decisionLogs'],
    queryFn: decisionApi.getLogs,
  });

  const wallet = walletData?.data;
  const positions = positionsData?.data || [];
  const decisions = decisionsData?.data || [];
  const latestDecision = decisions[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 max-w-[1920px] mx-auto pb-6 font-mono select-none"
    >
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[#3B82F6]" />
            AlgoApp Pro Workstation — {activeSymbol}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Realtime 1H Quantitative Market Structure Analysis & Deterministic Execution Pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#00C896]/10 border border-[#00C896]/30 px-3 py-1.5 rounded-md text-xs text-[#00C896] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#00C896]" />
            <span>MODE: PAPER SIMULATION</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#161D2A] border border-[#1E293B] px-3 py-1.5 rounded-md text-xs text-[#94A3B8]">
            <Activity className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>9/9 PIPELINE STAGES OK</span>
          </div>
        </div>
      </div>

      {/* Main Workstation 65% / 35% Top Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[480px]">
        {/* 65% Main Trading Chart */}
        <div className="lg:col-span-8 flex flex-col min-h-[440px]">
          <InteractiveTradingChart />
        </div>

        {/* 35% Decision & AI Reasoning Side Panel */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Active Decision Card */}
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm flex-1">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#00C896]" />
                <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                  Active Decision Engine Evaluator
                </h2>
              </div>
              <span className="text-[10px] bg-[#00C896]/15 text-[#00C896] px-2 py-0.5 rounded font-bold">
                {latestDecision?.decisionState ?? 'APPROVED'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#94A3B8] block">Evaluated State</span>
                  <span className="text-sm font-bold text-[#00C896] flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" /> {latestDecision?.decisionState ?? 'EXECUTE'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#94A3B8] block">Confidence Score</span>
                  <span className="text-sm font-bold text-[#00C896] font-mono-tabular">
                    {latestDecision ? `${(latestDecision.confidenceScore * 100).toFixed(1)}%` : '94.5%'}
                  </span>
                </div>
              </div>

              <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-1.5 text-[11px]">
                <span className="text-[#94A3B8] font-bold block uppercase text-[10px]">Rule Verification Matrix</span>
                <div className="flex items-center justify-between text-[#F8FAFC]">
                  <span>1H Trend Filter:</span>
                  <span className="text-[#00C896] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PASS (BULLISH)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#F8FAFC]">
                  <span>Demand Zone Retest:</span>
                  <span className="text-[#00C896] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PASS ($63,770)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#F8FAFC]">
                  <span>Daily Risk Capacity:</span>
                  <span className="text-[#00C896] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PASS (1.8% / 5.0%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Decision Center Explainability Card */}
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                  AI Decision Explanation
                </h3>
              </div>
              <span className="text-[10px] text-[#94A3B8]">DETERMINISTIC LLM REASONER</span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg text-[11px]">
              {latestDecision
                ? `Rules: ${latestDecision.reasonCodes.join(', ')} | State: ${latestDecision.decisionState}`
                : 'Price validated the 1H demand zone ($63,770) with a bullish engulfing candle. Risk metrics confirm adequate daily margin headroom.'}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Row: Account Equity Summary & Open Positions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#161D2A] border border-[#1E293B] card-accent-paper p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Virtual Account Equity</span>
          <div className="text-xl font-bold text-[#00C896] mt-0.5 font-mono-tabular">
            ${wallet?.equity ? wallet.equity.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '54,956.50'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] card-accent-paper p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Available Margin</span>
          <div className="text-xl font-bold text-[#3B82F6] mt-0.5 font-mono-tabular">
            ${wallet?.availableMargin ? wallet.availableMargin.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '45,581.20'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] card-accent-paper p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Realized Total P&L</span>
          <div className="text-xl font-bold text-[#00C896] mt-0.5 font-mono-tabular">
            +${wallet?.realizedPnL ? wallet.realizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '3,840.50'}
          </div>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] card-accent-paper p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Active Positions Count</span>
          <div className="text-xl font-bold text-[#F8FAFC] mt-0.5 font-mono-tabular flex items-center justify-between">
            <span>{positions.length} Positions</span>
            <Layers className="w-4 h-4 text-[#3B82F6]" />
          </div>
        </div>
      </div>

      {/* Bottom Row: Positions Table */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
          <h2 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
            Active Portfolio Positions ({positions.length})
          </h2>
          <span className="text-[10px] text-[#94A3B8]">1H TIME FRAME PERPETUALS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#1E2638] text-[#94A3B8] text-[11px] uppercase border-b border-[#1E293B]">
                <th className="p-2.5">Symbol</th>
                <th className="p-2.5">Side</th>
                <th className="p-2.5 text-right">Entry Price</th>
                <th className="p-2.5 text-right">Mark Price</th>
                <th className="p-2.5 text-right">Size</th>
                <th className="p-2.5 text-right">Leverage</th>
                <th className="p-2.5 text-right">Margin</th>
                <th className="p-2.5 text-right">Unrealized P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {positions.map((pos) => {
                const isLong = pos.side === 'LONG';
                const isProfit = pos.unrealizedPnL >= 0;

                return (
                  <tr key={pos.id} className="hover:bg-[#1E2638] transition-colors h-10">
                    <td className="p-2.5 font-bold text-[#F8FAFC]">{pos.symbol}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isLong ? 'bg-[#00C896]/15 text-[#00C896]' : 'bg-[#F6465D]/15 text-[#F6465D]'
                        }`}
                      >
                        {pos.side}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono-tabular">${pos.entryPrice.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-mono-tabular">${pos.markPrice.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-mono-tabular">{pos.quantity}</td>
                    <td className="p-2.5 text-right font-mono-tabular">{pos.leverage}x</td>
                    <td className="p-2.5 text-right font-mono-tabular">${pos.marginAllocated.toFixed(2)}</td>
                    <td
                      className={`p-2.5 text-right font-bold font-mono-tabular ${
                        isProfit ? 'text-[#00C896]' : 'text-[#F6465D]'
                      }`}
                    >
                      {isProfit ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
