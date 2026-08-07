import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { InteractiveTradingChart } from '../../components/charts/InteractiveTradingChart';
import { PatternDiscoveryItemDto, StrategyRecommendationDto } from '@algoapp/shared';
import { 
  LineChart, 
  Brain, 
  RotateCcw,
  Zap,
  Award,
  Shield,
  Lightbulb,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnalysisPage: React.FC = () => {
  const { activeSymbol, activeTimeframe } = useTerminalStore();

  const { data: scoreData } = useQuery({
    queryKey: ['intelligenceScore'],
    queryFn: intelligenceApi.getIntelligenceScore,
  });

  const { data: metricsData } = useQuery({
    queryKey: ['strategyMetrics'],
    queryFn: () => intelligenceApi.getStrategyMetrics(),
  });

  const { data: regimeData } = useQuery({
    queryKey: ['marketRegime', activeSymbol, activeTimeframe],
    queryFn: () => intelligenceApi.getMarketRegime(activeSymbol, activeTimeframe),
  });

  const { data: patternsData } = useQuery({
    queryKey: ['patternDiscovery'],
    queryFn: intelligenceApi.getPatterns,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['traderAnalytics'],
    queryFn: intelligenceApi.getTraderAnalytics,
  });

  const { data: recommendationsData } = useQuery({
    queryKey: ['strategyRecommendations'],
    queryFn: intelligenceApi.getRecommendations,
  });

  const { data: riskData } = useQuery({
    queryKey: ['riskIntelligence'],
    queryFn: intelligenceApi.getRiskIntelligence,
  });

  const score = scoreData?.data;
  const metrics = metricsData?.data;
  const regime = regimeData?.data;
  const patterns = patternsData?.data || [];
  const analytics = analyticsData?.data;
  const recommendations = recommendationsData?.data || [];
  const risk = riskData?.data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 max-w-[1920px] mx-auto pb-6 font-mono select-none"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1E293B] pb-3 bg-[#161D2A] p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
            <LineChart className="w-5 h-5 text-[#3B82F6]" />
            Trading Intelligence & Adaptive Strategy Platform — {activeSymbol} ({activeTimeframe})
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Empirical trade quality scoring, Sharpe/Sortino performance monitoring, regime detection, and evidence-backed recommendations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/replay"
            className="flex items-center space-x-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REPLAY ENGINE</span>
          </Link>
        </div>
      </div>

      {/* MODULE 1: TRADE INTELLIGENCE SCORE & SUB-METRICS */}
      <div className="grid grid-cols-12 gap-4">
        {/* Trade Intelligence Score Box */}
        <div className="col-span-12 lg:col-span-4 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-[#F59E0B]" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Trade Intelligence Score</h2>
              </div>
              <span className="text-[10px] bg-[#00C896]/20 text-[#00C896] px-2 py-0.5 rounded font-bold">
                EMPIRICAL SCORE
              </span>
            </div>

            <div className="flex items-baseline space-x-3 mb-3">
              <span className="text-4xl font-extrabold text-[#00C896] font-mono-tabular">
                {score?.overallScore ?? 0}
              </span>
              <span className="text-xs text-[#94A3B8]">/ 100 Quality Rating</span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed bg-[#0B0E14] p-2.5 rounded-lg border border-[#1E293B]">
              {score?.journalCorrelation ?? '—'}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1E293B] text-[11px] text-[#94A3B8]">
            Evaluated At: <span className="text-white font-bold">{score?.evaluatedAt ? new Date(score.evaluatedAt).toLocaleTimeString() : 'LIVE'}</span>
          </div>
        </div>

        {/* 7 Quality Sub-Metrics Grid */}
        <div className="col-span-12 lg:col-span-8 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2 mb-3">
            <Activity className="w-4 h-4 text-[#3B82F6]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">7 Trade Quality Dimensions</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block uppercase">Entry Quality</span>
              <span className="text-lg font-bold text-[#00C896]">{score?.entryQuality ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block uppercase">Exit Quality</span>
              <span className="text-lg font-bold text-[#00C896]">{score?.exitQuality ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block uppercase">Timing Quality</span>
              <span className="text-lg font-bold text-[#3B82F6]">{score?.timingQuality ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block uppercase">Zone Quality</span>
              <span className="text-lg font-bold text-[#00C896]">{score?.zoneQuality ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block uppercase">RR Quality</span>
              <span className="text-lg font-bold text-[#F59E0B]">{score?.rrQuality ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block uppercase">Confidence Accuracy</span>
              <span className="text-lg font-bold text-[#00C896]">{score?.confidenceAccuracy ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block uppercase">Execution Accuracy</span>
              <span className="text-lg font-bold text-[#3B82F6]">{score?.executionAccuracy ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-[#94A3B8] block uppercase">Market Regime</span>
              <span className="text-xs font-bold text-[#00C896]">{regime?.regime ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODULE 2 & 3: STRATEGY PERFORMANCE MONITOR & MARKET REGIME */}
      <div className="grid grid-cols-12 gap-4">
        {/* Strategy Performance Monitor Card */}
        <div className="col-span-12 lg:col-span-8 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#00C896]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Strategy Performance Monitor ({metrics?.profileName ?? '—'})</h2>
            </div>
            <span className="text-[10px] bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded font-bold">
              SHARPE: {metrics?.sharpeRatio ? metrics.sharpeRatio.toFixed(2) : '—'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">WIN RATE</span>
              <span className="text-lg font-bold text-[#00C896]">{metrics?.winRate !== undefined ? `${metrics.winRate.toFixed(1)}%` : '—'}</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">PROFIT FACTOR</span>
              <span className="text-lg font-bold text-white">{metrics?.profitFactor ? metrics.profitFactor.toFixed(2) : '—'}</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">SORTINO RATIO</span>
              <span className="text-lg font-bold text-[#3B82F6]">{metrics?.sortinoRatio ? metrics.sortinoRatio.toFixed(2) : '—'}</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">CALMAR RATIO</span>
              <span className="text-lg font-bold text-[#F59E0B]">{metrics?.calmarRatio ? metrics.calmarRatio.toFixed(2) : '—'}</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">RECOVERY FACTOR</span>
              <span className="text-lg font-bold text-[#00C896]">{metrics?.recoveryFactor ? metrics.recoveryFactor.toFixed(1) : '—'}</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">MAX DRAWDOWN</span>
              <span className="text-lg font-bold text-[#F6465D]">{metrics?.maxDrawdownPercent !== undefined ? `${metrics.maxDrawdownPercent.toFixed(2)}%` : '—'}</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">AVG RISK-REWARD</span>
              <span className="text-lg font-bold text-[#F59E0B]">{metrics?.avgRiskRewardRatio ? `${metrics.avgRiskRewardRatio.toFixed(2)}:1` : '—'}</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">AVG HOLD TIME</span>
              <span className="text-lg font-bold text-white">{metrics?.avgHoldTimeMinutes ? `${metrics.avgHoldTimeMinutes} mins` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Market Regime Detection Card */}
        <div className="col-span-12 lg:col-span-4 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2 mb-3">
              <Zap className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Market Regime Detector</h2>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Active Regime:</span>
                <span className="text-[#00C896] font-bold">{regime?.regime ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">ATR Volatility:</span>
                <span className="text-white font-bold">${regime?.atr ?? 0} ({regime?.volatilityPercent ?? 0}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Trend Strength:</span>
                <span className="text-[#3B82F6] font-bold">{regime?.trendStrength ?? 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Trading Session:</span>
                <span className="text-white font-bold">{regime?.session ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#94A3B8] border-t border-[#1E293B] pt-2 mt-3">
            Real-time classification based on ATR, volume expansion, and market structure.
          </div>
        </div>
      </div>

      {/* MODULE 4 & 6: PATTERN DISCOVERY & EVIDENCE-BACKED RECOMMENDATIONS */}
      <div className="grid grid-cols-12 gap-4">
        {/* Pattern Discovery Section */}
        <div className="col-span-12 lg:col-span-6 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
            <Brain className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Empirical Pattern Discovery</h2>
          </div>

          <div className="space-y-2">
            {patterns.map((item: PatternDiscoveryItemDto) => (
              <div key={item.id} className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{item.title}</span>
                  <span className="text-[10px] bg-[#00C896]/20 text-[#00C896] px-2 py-0.5 rounded font-bold">
                    WIN RATE: {item.winRate}%
                  </span>
                </div>
                <p className="text-[#94A3B8] text-[11px]">{item.patternDescription}</p>
                <div className="flex justify-between text-[10px] text-[#94A3B8] pt-1 border-t border-[#1E293B]/50">
                  <span>Sample Size: {item.sampleSize} Trades</span>
                  <span>Stat Significance: {item.statisticalSignificance}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Recommendations Section */}
        <div className="col-span-12 lg:col-span-6 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Strategy Recommendation Engine</h2>
            </div>
            <span className="text-[10px] bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-0.5 rounded font-bold">
              NON-AUTOMATED ADVICE
            </span>
          </div>

          <div className="space-y-2">
            {recommendations.map((rec: StrategyRecommendationDto) => (
              <div key={rec.id} className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F59E0B]">{rec.recommendation}</span>
                  <span className="text-[10px] bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded font-bold">
                    CONFIDENCE: {rec.confidenceScore}%
                  </span>
                </div>
                <p className="text-[#94A3B8] text-[11px]">{rec.supportingEvidenceText}</p>
                <div className="flex justify-between text-[10px] text-[#94A3B8] pt-1 border-t border-[#1E293B]/50">
                  <span>Target: {rec.targetParameter} ({rec.currentValue} → {rec.recommendedValue})</span>
                  <span>Evidentiary Trades: {rec.historicalTradeIds.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODULE 5, 7 & 9: TRADER ANALYTICS & RISK INTELLIGENCE */}
      <div className="grid grid-cols-12 gap-4">
        {/* Personal Trader Analytics */}
        <div className="col-span-12 lg:col-span-6 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
            <Award className="w-5 h-5 text-[#00C896]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Personal Trader Analytics</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">CONSISTENCY SCORE</span>
              <span className="text-lg font-bold text-[#00C896]">{analytics?.consistencyScore ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">DISCIPLINE SCORE</span>
              <span className="text-lg font-bold text-[#00C896]">{analytics?.disciplineScore ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">RISK MANAGEMENT SCORE</span>
              <span className="text-lg font-bold text-[#3B82F6]">{analytics?.riskManagementScore ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">AVG MISTAKE FREQUENCY</span>
              <span className="text-lg font-bold text-[#00C896]">{analytics?.avgMistakeFrequencyPerWeek ?? 0} / week</span>
            </div>
          </div>
        </div>

        {/* Risk Intelligence Engine */}
        <div className="col-span-12 lg:col-span-6 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
            <Shield className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Risk Intelligence Engine</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">DAILY RISK EXPOSURE</span>
              <span className="text-lg font-bold text-white">{risk?.dailyRiskPercent ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">RISK DRIFT</span>
              <span className="text-lg font-bold text-[#00C896]">{risk?.riskDriftPercent ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">RISK CONSISTENCY</span>
              <span className="text-lg font-bold text-[#00C896]">{risk?.riskConsistencyScore ?? 0}%</span>
            </div>
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[#94A3B8] block text-[10px]">CAPITAL EFFICIENCY</span>
              <span className="text-lg font-bold text-[#3B82F6]">{risk?.capitalEfficiencyPercent ?? 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHART WORKSPACE CONTAINER */}
      <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
          <LineChart className="w-5 h-5 text-[#3B82F6]" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">TradingView Lightweight Chart Workspace ({activeSymbol} {activeTimeframe})</h2>
        </div>
        <div className="h-[480px]">
          <InteractiveTradingChart />
        </div>
      </div>
    </motion.div>
  );
};
