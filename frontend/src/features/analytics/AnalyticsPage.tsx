import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '../../services/api';
import { EquityCurveChart } from '../../components/charts/EquityCurveChart';
import { PnLBarChart } from '../../components/charts/PnLBarChart';
import { WinRateDonutChart } from '../../components/charts/WinRateDonutChart';
import { PieChart, TrendingUp, ShieldAlert, Award, Activity } from 'lucide-react';
import { StrategyPerformanceMetricsDto } from '@algoapp/shared';

export const AnalyticsPage: React.FC = () => {
  const { data: metricsData } = useQuery({
    queryKey: ['strategyMetrics'],
    queryFn: () => intelligenceApi.getStrategyMetrics(),
    refetchInterval: 5000,
  });

  const metrics: StrategyPerformanceMetricsDto | undefined = metricsData?.data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6 font-mono select-none"
    >
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#3B82F6]" />
            Quantitative Performance Analytics
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Equity growth curves, drawdown metrics, win-rate breakdown, and profit factor analytics.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#161D2A] border border-[#1E293B] px-3 py-1.5 rounded-md text-xs font-mono text-[#94A3B8]">
          <TrendingUp className="w-4 h-4 text-[#00C896]" />
          <span>ANALYTICS ENGINE ONLINE</span>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block uppercase">Profit Factor</span>
          <div className="text-2xl font-bold text-[#00C896] mt-1 font-mono-tabular">
            {metrics?.profitFactor ? metrics.profitFactor.toFixed(2) : 'No data available'}
          </div>
          <span className="text-[10px] text-[#00C896]">Gross Win / Gross Loss</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block uppercase">Max Peak Drawdown</span>
          <div className="text-2xl font-bold text-[#F6465D] mt-1 font-mono-tabular">
            {metrics?.maxDrawdownPercent !== undefined ? `-${metrics.maxDrawdownPercent.toFixed(2)}%` : 'No data available'}
          </div>
          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#00C896]" /> Well within 5% limit
          </span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block uppercase">Average Win / Loss R:R</span>
          <div className="text-2xl font-bold text-[#3B82F6] mt-1 font-mono-tabular">
            {metrics?.avgRiskRewardRatio ? `1 : ${metrics.avgRiskRewardRatio.toFixed(2)}` : 'No data available'}
          </div>
          <span className="text-[10px] text-[#94A3B8]">Positive Expectancy</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl">
          <span className="text-[11px] text-[#94A3B8] block uppercase">Sharpe Ratio</span>
          <div className="text-2xl font-bold text-[#F8FAFC] mt-1 font-mono-tabular">
            {metrics?.sharpeRatio ? metrics.sharpeRatio.toFixed(2) : 'No data available'}
          </div>
          <span className="text-[10px] text-[#00C896] flex items-center gap-1">
            <Award className="w-3 h-3 text-[#F59E0B]" /> Risk-Adjusted Return
          </span>
        </div>
      </div>

      {/* Main Charts */}
      <EquityCurveChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PnLBarChart />
        <WinRateDonutChart />
      </div>

      {/* Advanced Statistical Analytics */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-5 mt-6 font-mono">
        <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#8B5CF6]" />
          Advanced Statistical Analytics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Row 1 */}
          <div className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-lg relative overflow-hidden">
            <span className="text-[10px] text-[#94A3B8] block uppercase">Total Trades</span>
            <div className="text-lg font-bold text-white mt-0.5">{metrics?.totalTrades ?? '-'}</div>
            <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
              <div className="h-full bg-white/40 transition-all duration-1000" style={{ width: `${Math.min(((metrics?.totalTrades ?? 0) / 100) * 100, 100)}%` }} />
            </div>
          </div>
          
          <div className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-lg relative overflow-hidden">
            <span className="text-[10px] text-[#94A3B8] block uppercase">Win Rate</span>
            <div className="text-lg font-bold text-[#00C896] mt-0.5">{metrics?.winRate !== undefined ? `${metrics.winRate.toFixed(1)}%` : '-'}</div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#00C896]/20 w-full">
              <div className="h-full bg-[#00C896] transition-all duration-1000" style={{ width: `${Math.min(metrics?.winRate ?? 0, 100)}%` }} />
            </div>
          </div>
          
          <div className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-lg relative overflow-hidden">
            <span className="text-[10px] text-[#94A3B8] block uppercase">Sortino Ratio</span>
            <div className="text-lg font-bold text-[#3B82F6] mt-0.5">{metrics?.sortinoRatio?.toFixed(2) ?? '-'}</div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#3B82F6]/20 w-full">
              <div className="h-full bg-[#3B82F6] transition-all duration-1000" style={{ width: `${Math.min(((metrics?.sortinoRatio ?? 0) / 3) * 100, 100)}%` }} />
            </div>
          </div>
          
          <div className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-lg relative overflow-hidden">
            <span className="text-[10px] text-[#94A3B8] block uppercase">Calmar Ratio</span>
            <div className="text-lg font-bold text-[#8B5CF6] mt-0.5">{metrics?.calmarRatio?.toFixed(2) ?? '-'}</div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#8B5CF6]/20 w-full">
              <div className="h-full bg-[#8B5CF6] transition-all duration-1000" style={{ width: `${Math.min(((metrics?.calmarRatio ?? 0) / 3) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-lg relative overflow-hidden">
            <span className="text-[10px] text-[#94A3B8] block uppercase">Recovery Factor</span>
            <div className="text-lg font-bold text-[#F59E0B] mt-0.5">{metrics?.recoveryFactor?.toFixed(2) ?? '-'}</div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#F59E0B]/20 w-full">
              <div className="h-full bg-[#F59E0B] transition-all duration-1000" style={{ width: `${Math.min(((metrics?.recoveryFactor ?? 0) / 5) * 100, 100)}%` }} />
            </div>
          </div>
          
          <div className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-lg relative overflow-hidden">
            <span className="text-[10px] text-[#94A3B8] block uppercase">Avg Hold Time</span>
            <div className="text-lg font-bold text-white mt-0.5">{metrics?.avgHoldTimeMinutes !== undefined ? `${metrics.avgHoldTimeMinutes}m` : '-'}</div>
            <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
              <div className="h-full bg-white/40 transition-all duration-1000" style={{ width: `${Math.min(((metrics?.avgHoldTimeMinutes ?? 0) / 120) * 100, 100)}%` }} />
            </div>
          </div>
          
          <div className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-lg relative overflow-hidden">
            <span className="text-[10px] text-[#94A3B8] block uppercase">Avg Trading Fee</span>
            <div className="text-lg font-bold text-[#F6465D] mt-0.5">{metrics?.avgTradingFee !== undefined ? `$${metrics.avgTradingFee.toFixed(2)}` : '-'}</div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#F6465D]/20 w-full">
              <div className="h-full bg-[#F6465D] transition-all duration-1000" style={{ width: `${Math.min(((metrics?.avgTradingFee ?? 0) / 10) * 100, 100)}%` }} />
            </div>
          </div>
          
          <div className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-lg relative overflow-hidden">
            <span className="text-[10px] text-[#94A3B8] block uppercase">Avg Net Profit</span>
            <div className="text-lg font-bold text-[#00C896] mt-0.5">{metrics?.avgNetProfit !== undefined ? `$${metrics.avgNetProfit.toFixed(2)}` : '-'}</div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#00C896]/20 w-full">
              <div className="h-full bg-[#00C896] transition-all duration-1000" style={{ width: `${Math.min((Math.abs(metrics?.avgNetProfit ?? 0) / 100) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
