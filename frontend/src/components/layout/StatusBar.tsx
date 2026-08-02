import React, { useState, useEffect } from 'react';
import { getIsoUtcTimestamp } from '@algoapp/shared';
import { 
  Wifi, 
  Clock, 
  Cpu, 
  Radio, 
  Zap, 
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
    <footer className="h-6 bg-[#0B0E14] border-t border-[#1E293B] flex items-center justify-between px-3 text-[10px] font-mono text-[#94A3B8] select-none z-20 overflow-x-auto whitespace-nowrap no-scrollbar">
      <div className="flex items-center space-x-4">
        {/* Frontend Status */}
        <div className="flex items-center space-x-1 text-[#00C896] font-semibold">
          <Cpu className="w-3 h-3 text-[#3B82F6]" />
          <span>FE: ONLINE</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* Backend API */}
        <div className="flex items-center space-x-1 text-[#F8FAFC]">
          <Wifi className="w-3 h-3 text-[#00C896]" />
          <span>BE: ONLINE</span>
          <span className="text-[#64748B] font-mono-tabular">(12.4ms)</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* Pipeline Telemetry */}
        <div className="flex items-center space-x-1 text-[#F8FAFC]">
          <Zap className="w-3 h-3 text-[#F59E0B]" />
          <span>PIPELINE: 9/9 STAGES OK</span>
          <span className="text-[#64748B] font-mono-tabular">(18.5ms)</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* Replay / Market Data */}
        <div className="flex items-center space-x-1 text-[#3B82F6]">
          <Radio className="w-3 h-3 text-[#3B82F6]" />
          <span>STREAM: 1H CANDLES</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Environment Badge */}
        <div className="flex items-center space-x-1 text-[#00C896] font-bold">
          <ShieldCheck className="w-3 h-3 text-[#00C896]" />
          <span>MODE: PAPER SIMULATION</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* UTC Clock */}
        <div className="flex items-center space-x-1 text-[#F8FAFC] font-mono-tabular">
          <Clock className="w-3 h-3 text-[#3B82F6]" />
          <span>{utcTime}</span>
        </div>
      </div>
    </footer>
  );
};
