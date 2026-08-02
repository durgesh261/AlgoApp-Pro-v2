import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { tradingRulesApi } from '../../services/api';
import { useToastStore } from '../../store/useToastStore';
import { 
  Sliders, 
  BookOpen, 
  ShieldCheck, 
  Calculator, 
  Zap
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addToast } = useToastStore();

  const [entryPrice, setEntryPrice] = useState('64000.00');
  const [stopLossPrice, setStopLossPrice] = useState('62720.00');
  const [riskPercent, setRiskPercent] = useState('2.0');

  const { data: configData } = useQuery({
    queryKey: ['tradingRuleConfig'],
    queryFn: tradingRulesApi.getConfig,
  });

  const { data: registryData } = useQuery({
    queryKey: ['tradingRuleRegistry'],
    queryFn: tradingRulesApi.getRegistry,
  });

  const calcLeverageMutation = useMutation({
    mutationFn: tradingRulesApi.calculateLeverage,
    onSuccess: (res) => {
      addToast('Dynamic Leverage Computed', `Recommended: ${res.data.recommendedLeverage}x (SL Distance: ${res.data.stopLossDistancePercent}%)`, 'success');
    },
  });

  const handleCalcLeverage = (e: React.FormEvent) => {
    e.preventDefault();
    calcLeverageMutation.mutate({
      entryPrice: parseFloat(entryPrice),
      stopLossPrice: parseFloat(stopLossPrice),
      riskPercent: parseFloat(riskPercent),
    });
  };

  const config = configData?.data;
  const registry = registryData?.data || [];
  const leverageResult = calcLeverageMutation.data?.data;

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
            <Sliders className="w-5 h-5 text-[#3B82F6]" />
            Trading Rules Engine & System Settings
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Centralized business rules, confidence bonuses, risk limits, versioning, and dynamic leverage calculator.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-3 py-1.5 rounded-md text-xs text-[#3B82F6]">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>RULE VERSION: {config?.ruleVersion ?? 'v2.0.0'}</span>
        </div>
      </div>

      {/* Rules Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#161D2A] border border-[#1E293B] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Rule Engine Version</span>
          <div className="text-sm font-bold text-[#3B82F6] mt-0.5">{config?.ruleVersion ?? 'v2.0.0'}</div>
          <span className="text-[9px] text-[#64748B] block mt-1">Config: {config?.configVersion ?? 'cfg-2026.08.02'}</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Supported Timeframe</span>
          <div className="text-sm font-bold text-[#00C896] mt-0.5">{config?.supportedTimeframe ?? '1H ONLY'}</div>
          <span className="text-[9px] text-[#64748B] block mt-1">All other timeframes rejected</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Supported Perpetual Pairs</span>
          <div className="text-sm font-bold text-[#F8FAFC] mt-0.5">4 Pairs Active</div>
          <span className="text-[9px] text-[#64748B] block mt-1">BTC, ETH, SOL, XRP</span>
        </div>

        <div className="bg-[#161D2A] border border-[#1E293B] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#94A3B8] uppercase block">Min Execution Confidence</span>
          <div className="text-sm font-bold text-[#F59E0B] mt-0.5">{config?.riskRules.minConfidence ?? 80.0}%</div>
          <span className="text-[9px] text-[#64748B] block mt-1">Required for EXECUTE state</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dynamic Leverage Calculator Widget */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
            <Calculator className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
              Deterministic Dynamic Leverage Calculator
            </h3>
          </div>

          <form onSubmit={handleCalcLeverage} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[#94A3B8] block text-[11px]">Entry Price ($)</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-1.5 text-[#F8FAFC] font-mono outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#94A3B8] block text-[11px]">Stop Loss Price ($)</label>
              <input
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-1.5 text-[#F8FAFC] font-mono outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#94A3B8] block text-[11px]">Risk Per Trade (%)</label>
              <input
                type="number"
                step="any"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#334155] rounded px-3 py-1.5 text-[#F8FAFC] font-mono outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={calcLeverageMutation.isPending}
              className="w-full py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md"
            >
              <Zap className="w-4 h-4" />
              <span>{calcLeverageMutation.isPending ? 'CALCULATING...' : 'COMPUTE DYNAMIC LEVERAGE'}</span>
            </button>
          </form>

          {leverageResult && (
            <div className="bg-[#0B0E14] border border-[#00C896]/30 p-3 rounded-lg text-xs space-y-1 mt-2">
              <span className="text-[10px] text-[#94A3B8] uppercase block">Result</span>
              <div className="text-base font-bold text-[#00C896]">
                Recommended Leverage: {leverageResult.recommendedLeverage}x
              </div>
              <span className="text-[11px] text-[#94A3B8] block">
                SL Distance: {leverageResult.stopLossDistancePercent}% | Risk: {leverageResult.riskPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Rule Registry Viewer */}
        <div className="lg:col-span-2 bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#00C896]" />
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                Trading Rules Explanation Registry ({registry.length})
              </h3>
            </div>
            <span className="text-[10px] text-[#94A3B8]">METADATA REGISTRY</span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {registry.map((r) => (
              <div key={r.ruleId} className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC]">{r.name}</span>
                  <span className="text-[10px] bg-[#3B82F6]/15 text-[#3B82F6] px-2 py-0.5 rounded font-bold">
                    {String(r.currentValue)}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">{r.description}</p>
                <div className="text-[10px] text-[#64748B] border-t border-[#1E293B] pt-1 mt-1">
                  Purpose: {r.purpose}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
