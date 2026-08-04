import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '../../services/api';
import { EquityCurveChart } from '../../components/charts/EquityCurveChart';
import { PnLBarChart } from '../../components/charts/PnLBarChart';
import { WinRateDonutChart } from '../../components/charts/WinRateDonutChart';
import { PieChart, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { StrategyPerformanceMetricsDto } from '@algoapp/shared';

export const AnalyticsPage: React.FC = () => {
  const { data: metricsData } = useQuery({
    queryKey: ['strategyMetrics'],
    queryFn: intelligenceApi.getStrategyMetrics,
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
    </motion.div>
  );
};
