import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { strategyProfileApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { 
  Sliders, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  Shield, 
  Target, 
  TrendingUp, 
  Layers, 
  Scale, 
  Cpu, 
  Activity, 
  GitMerge, 
  FileCode2,
  DollarSign,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export const StrategyProfilesPage: React.FC = () => {
  const { activeSymbol } = useTerminalStore();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SMC_RULES' | 'ENTRY_FORMULA' | 'RISK_CAPITAL' | 'SCANNER_AI'>('OVERVIEW');

  const { isLoading, refetch } = useQuery({
    queryKey: ['strategyProfiles'],
    queryFn: strategyProfileApi.getProfiles,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-[1600px] mx-auto pb-10 font-mono select-none"
    >
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-[#161D2A] border border-[#1E293B] p-5 rounded-2xl shadow-lg gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-[#3B82F6]/20 to-[#6366F1]/20 border border-[#3B82F6]/30 rounded-xl text-[#3B82F6] shadow-inner">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold text-white uppercase tracking-wide">Strategy Profiles Lab</h1>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/30 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse"></span>
                <span>SYSTEM v5.1 ACTIVE</span>
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Active Institutional SMC Engine specification, entry formulas, risk compounding rules, and scanner parameters.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full lg:w-auto justify-end">
          <button
            onClick={() => refetch()}
            className="px-3.5 py-2 bg-[#1E293B] hover:bg-[#28334A] text-white text-xs font-bold rounded-xl border border-[#334155] flex items-center space-x-2 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>REFRESH ENGINE</span>
          </button>
        </div>
      </div>

      {/* Top Profile Card & Core Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Active Profile Summary */}
        <div className="lg:col-span-1 bg-[#161D2A] border border-[#3B82F6]/50 bg-gradient-to-b from-[#161D2A] to-[#111722] p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#3B82F6]/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#3B82F6] bg-[#3B82F6]/15 px-2.5 py-1 rounded-lg border border-[#3B82F6]/30 uppercase tracking-wider">
                {activeSymbol} • 1H TIMEFRAME
              </span>
              <span className="flex items-center space-x-1 text-[11px] text-[#00C896] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>ACTIVE</span>
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">Default 1H Institutional Profile</h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Native SMC + Price Action Toolkit engine optimized for Delta Exchange perpetual contracts.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#1E293B] space-y-2 text-xs">
            <div className="flex justify-between text-[#94A3B8]">
              <span>Engine Version:</span>
              <strong className="text-white font-mono">v5.1.0 Institutional</strong>
            </div>
            <div className="flex justify-between text-[#94A3B8]">
              <span>Order Block Source:</span>
              <strong className="text-[#3B82F6] font-mono">LuxAlgo + UAlgo Merged</strong>
            </div>
            <div className="flex justify-between text-[#94A3B8]">
              <span>Database Sync:</span>
              <strong className="text-[#00C896] font-mono">SQLite Permanent</strong>
            </div>
          </div>
        </div>

        {/* 3 Core Highlights Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider">Strategy Target</span>
              <div className="p-2 bg-[#00C896]/10 text-[#00C896] rounded-lg border border-[#00C896]/20">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white font-mono">60.0% <span className="text-xs font-normal text-[#00C896]">TP</span></div>
              <p className="text-[11px] text-[#94A3B8] mt-1">Take profit target net of fees and funding.</p>
            </div>
            <div className="pt-2 mt-2 border-t border-[#1E293B]/60 text-[10px] text-[#00C896] font-bold flex items-center space-x-1">
              <span>Automatic exit & re-balance</span>
            </div>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider">Max Drawdown SL</span>
              <div className="p-2 bg-[#EF4444]/10 text-[#EF4444] rounded-lg border border-[#EF4444]/20">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-[#EF4444] font-mono">35.0% <span className="text-xs font-normal text-[#EF4444]">MAX SL</span></div>
              <p className="text-[11px] text-[#94A3B8] mt-1">Strict account-level stop loss protection.</p>
            </div>
            <div className="pt-2 mt-2 border-t border-[#1E293B]/60 text-[10px] text-[#EF4444] font-bold flex items-center space-x-1">
              <span>Hard capital preservation barrier</span>
            </div>
          </div>

          <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider">AI Confidence Gate</span>
              <div className="p-2 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-lg border border-[#8B5CF6]/20">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-[#8B5CF6] font-mono">&ge; 85% <span className="text-xs font-normal text-[#94A3B8]">MIN</span></div>
              <p className="text-[11px] text-[#94A3B8] mt-1">Trades below 85% confidence rejected.</p>
            </div>
            <div className="pt-2 mt-2 border-t border-[#1E293B]/60 text-[10px] text-[#8B5CF6] font-bold flex items-center space-x-1">
              <span>Multi-factor institutional gate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'OVERVIEW'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'bg-[#161D2A] text-[#94A3B8] hover:text-white hover:bg-[#1E2638] border border-[#1E293B]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>STRATEGY OVERVIEW</span>
        </button>

        <button
          onClick={() => setActiveTab('SMC_RULES')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'SMC_RULES'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'bg-[#161D2A] text-[#94A3B8] hover:text-white hover:bg-[#1E2638] border border-[#1E293B]'
          }`}
        >
          <GitMerge className="w-3.5 h-3.5" />
          <span>SMC INDICATOR ENGINE</span>
        </button>

        <button
          onClick={() => setActiveTab('ENTRY_FORMULA')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'ENTRY_FORMULA'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'bg-[#161D2A] text-[#94A3B8] hover:text-white hover:bg-[#1E2638] border border-[#1E293B]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>ENTRY & OFFSET FORMULA</span>
        </button>

        <button
          onClick={() => setActiveTab('RISK_CAPITAL')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'RISK_CAPITAL'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'bg-[#161D2A] text-[#94A3B8] hover:text-white hover:bg-[#1E2638] border border-[#1E293B]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>RISK & COMPOUNDING</span>
        </button>

        <button
          onClick={() => setActiveTab('SCANNER_AI')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'SCANNER_AI'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'bg-[#161D2A] text-[#94A3B8] hover:text-white hover:bg-[#1E2638] border border-[#1E293B]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>4-PAIR SCANNER & AI GATE</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pairs */}
            <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Scanned Perpetual Pairs</span>
                <Layers className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['BTCUSD.P', 'ETHUSD.P', 'SOLUSD.P', 'XRPUSD.P'].map((pair) => (
                  <div key={pair} className="bg-[#0F172A] border border-[#1E293B] px-2 py-1.5 rounded-lg text-center font-bold text-xs text-white">
                    {pair}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeframe */}
            <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Execution Timeframe</span>
                <Clock className="w-4 h-4 text-[#00C896]" />
              </div>
              <div className="text-xl font-bold text-white font-mono">1 Hour (1H)</div>
              <p className="text-[11px] text-[#94A3B8]">
                Strategy runs strictly on the 1-Hour candle series for institutional structure accuracy.
              </p>
            </div>

            {/* Strategy Model */}
            <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Setup Filter</span>
                <Zap className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="text-xl font-bold text-[#F59E0B] font-mono">Order Blocks Only</div>
              <p className="text-[11px] text-[#94A3B8]">
                FVG and secondary breakouts are ignored. Trades only native Order Blocks.
              </p>
            </div>

            {/* Execution Trigger */}
            <div className="bg-[#161D2A] border border-[#1E293B] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Execution Trigger</span>
                <Activity className="w-4 h-4 text-[#EC4899]" />
              </div>
              <div className="text-xl font-bold text-[#EC4899] font-mono">First Touch</div>
              <p className="text-[11px] text-[#94A3B8]">
                Immediate execution upon price reach. Zero candle close waiting.
              </p>
            </div>
          </div>

          {/* Master Specification Table */}
          <div className="bg-[#161D2A] border border-[#1E293B] rounded-2xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-[#1E293B] bg-[#1A2234] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Strategy Execution Rules Matrix</span>
              </div>
              <span className="text-[11px] text-[#00C896] font-mono font-bold">100% Native Backend Engine</span>
            </div>

            <div className="divide-y divide-[#1E293B] text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-[#1A2333] transition-colors gap-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                  <span>Trading Universe</span>
                </div>
                <div className="text-[#94A3B8] md:col-span-2">
                  <strong className="text-white">BTCUSD.P, ETHUSD.P, SOLUSD.P, XRPUSD.P</strong>. Scans all 4 perpetual pairs simultaneously in real-time.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-[#1A2333] transition-colors gap-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#00C896]"></span>
                  <span>Entry Mechanism</span>
                </div>
                <div className="text-[#94A3B8] md:col-span-2">
                  Price reaches Bullish/Bearish Order Block &rarr; <strong className="text-[#00C896]">First Touch Execution</strong> when AI Confidence &ge; 85%. No waiting for candle close.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-[#1A2333] transition-colors gap-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                  <span>Order Block Width Offset</span>
                </div>
                <div className="text-[#94A3B8] md:col-span-2">
                  If width &le; 0.6% &rarr; <strong className="text-white">Entry at Edge</strong>. If width &gt; 0.6% &rarr; <strong className="text-white">Entry 25% Inside Zone</strong>.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-[#1A2333] transition-colors gap-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
                  <span>Order Block Lifetime</span>
                </div>
                <div className="text-[#94A3B8] md:col-span-2">
                  Every Order Block can be traded <strong className="text-white">strictly once</strong>. Upon trade execution, the zone is marked <strong className="text-[#8B5CF6]">USED</strong> and never traded again.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-[#1A2333] transition-colors gap-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#EC4899]"></span>
                  <span>Capital & Dynamic Leverage</span>
                </div>
                <div className="text-[#94A3B8] md:col-span-2">
                  Trades use <strong className="text-white">100% of current Delta Exchange account balance</strong>. Auto-calculated dynamic leverage up to <strong className="text-white">100x maximum</strong>.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-[#1A2333] transition-colors gap-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#00C896]"></span>
                  <span>Profit & Loss Targets</span>
                </div>
                <div className="text-[#94A3B8] md:col-span-2">
                  Take Profit at <strong className="text-[#00C896]">60.0% account profit</strong>. Maximum Stop Loss at <strong className="text-[#EF4444]">35.0% account loss</strong>. Exchange fees & funding subtracted.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-[#1A2333] transition-colors gap-2">
                <div className="font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                  <span>Scanner Concurrency</span>
                </div>
                <div className="text-[#94A3B8] md:col-span-2">
                  <strong className="text-white">Strictly 1 open trade allowed</strong> across all pairs. If multiple pairs trigger together, the engine chooses the <strong className="text-[#3B82F6]">highest AI confidence</strong> setup.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMC RULES */}
      {activeTab === 'SMC_RULES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Engine Port Card */}
            <div className="bg-[#161D2A] border border-[#1E293B] p-5 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#3B82F6]/10 text-[#3B82F6] rounded-xl border border-[#3B82F6]/20">
                  <GitMerge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">Dual LuxAlgo + UAlgo Merged Engine</h3>
                  <p className="text-xs text-[#94A3B8]">Independent generation merged into institutional Order Blocks.</p>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                The native backend executes full mathematical ports of both Smart Money Concepts (LuxAlgo) and Price Action Toolkit (UAlgo). Overlapping zones are merged into a unified list before AI evaluation, retaining the exact source attribution (<code className="text-[#3B82F6]">LuxAlgo</code>, <code className="text-[#00C896]">UAlgo</code>, or <code className="text-[#8B5CF6]">Merged</code>) in SQLite.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-xl">
                  <div className="text-[11px] text-[#94A3B8]">Swing Length</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">50</div>
                  <div className="text-[10px] text-[#3B82F6]">Configurable via SQLite</div>
                </div>
                <div className="bg-[#0F172A] border border-[#1E293B] p-3 rounded-xl">
                  <div className="text-[11px] text-[#94A3B8]">Internal Structure Length</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">5</div>
                  <div className="text-[10px] text-[#3B82F6]">Configurable via SQLite</div>
                </div>
              </div>
            </div>

            {/* Market Structure Port */}
            <div className="bg-[#161D2A] border border-[#1E293B] p-5 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#00C896]/10 text-[#00C896] rounded-xl border border-[#00C896]/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">Market Structure Calculations</h3>
                  <p className="text-xs text-[#94A3B8]">Calculated purely on backend from 1H OHLCV series.</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#0F172A] border border-[#1E293B] rounded-xl">
                  <span className="font-bold text-white">BOS (Break of Structure)</span>
                  <span className="text-[#00C896] font-mono">Confirmed on candle break</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#0F172A] border border-[#1E293B] rounded-xl">
                  <span className="font-bold text-white">CHoCH (Change of Character)</span>
                  <span className="text-[#3B82F6] font-mono">Trend reversal detection</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#0F172A] border border-[#1E293B] rounded-xl">
                  <span className="font-bold text-white">Equal Highs / Equal Lows</span>
                  <span className="text-[#F59E0B] font-mono">Liquidity pool detection</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#0F172A] border border-[#1E293B] rounded-xl">
                  <span className="font-bold text-white">Premium / Discount Matrix</span>
                  <span className="text-[#8B5CF6] font-mono">0.5 Equilibrium Port</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENTRY & OFFSET FORMULA */}
      {activeTab === 'ENTRY_FORMULA' && (
        <div className="space-y-4">
          <div className="bg-[#161D2A] border border-[#1E293B] p-6 rounded-2xl space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[#F59E0B]/10 text-[#F59E0B] rounded-xl border border-[#F59E0B]/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase">Order Block Width & Entry Offset Formula</h3>
                <p className="text-xs text-[#94A3B8]">Calculates the exact entry price and stop placement dynamically.</p>
              </div>
            </div>

            {/* Formula Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-lg border border-[#3B82F6]/30">
                    CASE 1: Width &le; 0.6%
                  </span>
                  <span className="text-xs text-[#94A3B8] font-bold">Standard Zone</span>
                </div>
                <h4 className="text-sm font-bold text-white">Entry at Exact Zone Edge</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  When the Order Block percentage width is less than or equal to 0.6%, price triggers an immediate entry right at the outer edge boundary.
                </p>
                <div className="p-3 bg-[#161D2A] rounded-lg border border-[#1E293B] font-mono text-xs text-white">
                  <div><strong>Bullish:</strong> Entry = OB.Top (High)</div>
                  <div className="mt-1"><strong>Bearish:</strong> Entry = OB.Bottom (Low)</div>
                </div>
              </div>

              <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-lg border border-[#F59E0B]/30">
                    CASE 2: Width &gt; 0.6%
                  </span>
                  <span className="text-xs text-[#94A3B8] font-bold">Wide Zone</span>
                </div>
                <h4 className="text-sm font-bold text-white">Entry 25% Inside the Zone</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  When the Order Block percentage width exceeds 0.6%, the engine enters 25% deeper inside the zone to secure optimal risk/reward.
                </p>
                <div className="p-3 bg-[#161D2A] rounded-lg border border-[#1E293B] font-mono text-xs text-white">
                  <div><strong>Bullish:</strong> Entry = High - 0.25 &times; (High - Low)</div>
                  <div className="mt-1"><strong>Bearish:</strong> Entry = Low + 0.25 &times; (High - Low)</div>
                </div>
              </div>
            </div>

            {/* Real Example Walkthrough */}
            <div className="bg-[#1A2234] border border-[#3B82F6]/30 p-4 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#3B82F6]">
                <Info className="w-4 h-4" />
                <span>Example Calculation Walkthrough:</span>
              </div>
              <div className="text-xs text-[#94A3B8] leading-relaxed font-mono">
                Order Block Top: <strong className="text-white">$100</strong> &bull; Order Block Bottom: <strong className="text-white">$99</strong> (Width = 1.0% &gt; 0.6%)<br />
                &rarr; Calculated Bullish Entry = <strong className="text-[#00C896]">$99.75</strong> (25% inside zone)<br />
                &rarr; Stop Loss Level = <strong className="text-[#EF4444]">$99.00</strong> (OB Bottom)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RISK & CAPITAL */}
      {activeTab === 'RISK_CAPITAL' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#161D2A] border border-[#1E293B] p-5 rounded-2xl space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#3B82F6]/10 text-[#3B82F6] rounded-xl border border-[#3B82F6]/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">100% Compounding</h3>
                  <span className="text-[10px] text-[#00C896] font-bold">FULL BALANCE SIZING</span>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Uses 100% of current Delta Exchange account balance on every new trade execution.
              </p>
              <div className="p-3 bg-[#0F172A] rounded-xl border border-[#1E293B] text-xs font-mono space-y-1">
                <div>Initial Balance: <strong className="text-white">$10.00</strong></div>
                <div>Trade Closes: <strong className="text-[#00C896]">$15.00</strong></div>
                <div>Next Trade Uses: <strong className="text-[#3B82F6]">$15.00</strong></div>
              </div>
            </div>

            <div className="bg-[#161D2A] border border-[#1E293B] p-5 rounded-2xl space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#EF4444]/10 text-[#EF4444] rounded-xl border border-[#EF4444]/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">35% Stop Loss Barrier</h3>
                  <span className="text-[10px] text-[#EF4444] font-bold">MAX ACCOUNT RISK</span>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Positions are sized with dynamic leverage so that hitting the Stop Loss never loses more than 35% of total account capital.
              </p>
              <div className="p-3 bg-[#0F172A] rounded-xl border border-[#1E293B] text-xs font-mono text-[#EF4444]">
                Max Account Risk: 35.0%
              </div>
            </div>

            <div className="bg-[#161D2A] border border-[#1E293B] p-5 rounded-2xl space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#00C896]/10 text-[#00C896] rounded-xl border border-[#00C896]/20">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">60% Net Take Profit</h3>
                  <span className="text-[10px] text-[#00C896] font-bold">TARGET HARVEST</span>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Automatically closes the trade when the account reaches 60% profit after subtracting exchange fees, trading fees, and funding.
              </p>
              <div className="p-3 bg-[#0F172A] rounded-xl border border-[#1E293B] text-xs font-mono text-[#00C896]">
                Target Profit: +60.0% Net
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCANNER & AI */}
      {activeTab === 'SCANNER_AI' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Scanner Controls Card */}
            <div className="bg-[#161D2A] border border-[#1E293B] p-5 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#3B82F6]/10 text-[#3B82F6] rounded-xl border border-[#3B82F6]/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">4-Pair Scanner Engine</h3>
                  <p className="text-xs text-[#94A3B8]">Scans BTC, ETH, SOL, XRP for institutional setups.</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#94A3B8] leading-relaxed">
                <p>
                  &bull; <strong className="text-white">Single Trade Limit:</strong> Only 1 trade can remain open at any time across the 4 pairs.
                </p>
                <p>
                  &bull; <strong className="text-white">Conflict Resolution:</strong> If multiple pairs trigger concurrently, the engine selects the one with the highest confidence score.
                </p>
                <p>
                  &bull; <strong className="text-white">Lifecycle Controls:</strong> User can Start, Pause, Resume, or Stop the scanner directly from the Live Trading terminal.
                </p>
                <p>
                  &bull; <strong className="text-white">Instant Resumption:</strong> Scanner resumes scanning immediately after a trade reaches Take Profit (TP) or Stop Loss (SL).
                </p>
              </div>
            </div>

            {/* AI Decision Gate Card */}
            <div className="bg-[#161D2A] border border-[#1E293B] p-5 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl border border-[#8B5CF6]/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">AI Evaluation & Gatekeeper</h3>
                  <p className="text-xs text-[#94A3B8]">Strict &ge; 85% confidence requirement for authorization.</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#94A3B8] leading-relaxed">
                <p>
                  &bull; <strong className="text-white">Score Threshold:</strong> Minimum 85% confidence. Any setup below 85% is rejected.
                </p>
                <p>
                  &bull; <strong className="text-white">Evaluation Factors:</strong> Order Block freshness, zone strength, higher-timeframe trend alignment, liquidity sweep confluence.
                </p>
                <p>
                  &bull; <strong className="text-white">Audit Trail:</strong> Every AI decision (accepted or rejected) with full reasoning is stored permanently in SQLite.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
