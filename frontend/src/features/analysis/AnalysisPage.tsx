import React from 'react';
import { motion } from 'framer-motion';
import { CurrentPairWidget } from '../../components/widgets/CurrentPairWidget';
import { OpportunityRadarWidget } from '../../components/widgets/OpportunityRadarWidget';
import { LineChart, BarChart2, Compass } from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5 max-w-7xl mx-auto pb-6"
    >
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <LineChart className="w-5 h-5 text-[#3B82F6]" />
            Quantitative Market Analysis & Structure Radar
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Technical indicator overlays, zone classification, and multi-pair opportunity scanning.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#161D2A] border border-[#1E293B] px-3 py-1.5 rounded-md text-xs font-mono text-[#94A3B8]">
          <BarChart2 className="w-4 h-4 text-[#3B82F6]" />
          <span>QUANT RESEARCH TERMINAL</span>
        </div>
      </div>

      <CurrentPairWidget />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OpportunityRadarWidget />

        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-2">
            <Compass className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="font-bold text-[#F8FAFC] uppercase tracking-wider">
              Technical Indicator Signals Matrix
            </h3>
          </div>

          <div className="space-y-2">
            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">EMA Trend Overlay (20/50/200)</span>
              <span className="text-[#00C896] font-bold">BULLISH ALIGNMENT</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Relative Strength Index (RSI 14)</span>
              <span className="text-[#3B82F6] font-bold">64.2 (NEUTRAL-BULLISH)</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Volume Profile & Liquidity Node</span>
              <span className="text-[#00C896] font-bold">HIGH VOLUME SUPPORT</span>
            </div>

            <div className="bg-[#0B0E14] border border-[#1E293B] p-3 rounded-lg flex items-center justify-between">
              <span className="text-[#94A3B8]">Average True Range (ATR 14)</span>
              <span className="text-[#F8FAFC] font-bold">1,240.00 (EXPANSION)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
