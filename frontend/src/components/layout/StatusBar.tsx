import React, { useState, useEffect } from 'react';
import { getIsoUtcTimestamp } from '@algoapp/shared';
import { 
  Wifi, 
  Clock, 
  Database, 
  Cpu, 
  Radio, 
  Zap, 
  HardDrive,
  ShieldCheck
} from 'lucide-react';

export const StatusBar: React.FC = () => {
  const [utcTime, setUtcTime] = useState(getIsoUtcTimestamp());

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(getIsoUtcTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-6 bg-[#0B0E14] border-t border-[#1E293B] flex items-center justify-between px-3 text-[10px] font-mono text-[#64748B] select-none z-20 overflow-x-auto whitespace-nowrap no-scrollbar">
      <div className="flex items-center space-x-4">
        {/* Frontend Status */}
        <div className="flex items-center space-x-1 text-[#00C896]">
          <Cpu className="w-3 h-3 text-[#3B82F6]" />
          <span>FE: Vite 5.4</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* Backend API */}
        <div className="flex items-center space-x-1 text-[#94A3B8]">
          <Wifi className="w-3 h-3 text-[#00C896]" />
          <span>BE: Express (12ms)</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* PostgreSQL Database */}
        <div className="flex items-center space-x-1 text-[#94A3B8]">
          <Database className="w-3 h-3 text-[#3B82F6]" />
          <span>DB: PostgreSQL</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* TradingView Webhook */}
        <div className="flex items-center space-x-1 text-[#94A3B8]">
          <Radio className="w-3 h-3 text-[#F59E0B]" />
          <span>TV: Ingestion Active</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* Delta Exchange Gateway */}
        <div className="flex items-center space-x-1 text-[#94A3B8]">
          <Zap className="w-3 h-3 text-[#3B82F6]" />
          <span>Delta: Gateway Standby</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Execution Mode */}
        <div className="flex items-center space-x-1 text-[#3B82F6]">
          <ShieldCheck className="w-3 h-3" />
          <span>MODE: PAPER SIMULATION</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* Heap Memory */}
        <div className="flex items-center space-x-1 text-[#94A3B8]">
          <HardDrive className="w-3 h-3 text-[#64748B]" />
          <span>MEM: 42.8 MB</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* UTC Clock */}
        <div className="flex items-center space-x-1.5 text-[#F8FAFC]">
          <Clock className="w-3 h-3 text-[#3B82F6]" />
          <span>{utcTime.replace('T', ' ').substring(0, 19)} UTC</span>
        </div>
      </div>
    </footer>
  );
};
