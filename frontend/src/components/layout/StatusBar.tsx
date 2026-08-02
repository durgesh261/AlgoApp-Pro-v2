import React, { useState, useEffect } from 'react';
import { getIsoUtcTimestamp } from '@algoapp/shared';
import { Wifi, Clock, Database, Layers } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const [utcTime, setUtcTime] = useState(getIsoUtcTimestamp());

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(getIsoUtcTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-6 bg-[#0B0E14] border-t border-[#1E293B] flex items-center justify-between px-3 text-[11px] font-mono text-[#64748B] select-none z-20">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-[#00C896]">
          <Wifi className="w-3 h-3" />
          <span>API Connected (12ms)</span>
        </div>
        <div className="flex items-center space-x-1 text-[#94A3B8]">
          <Database className="w-3 h-3" />
          <span>PostgreSQL Live</span>
        </div>
        <div className="flex items-center space-x-1 text-[#94A3B8]">
          <Layers className="w-3 h-3" />
          <span>Single-User Engine</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-[#94A3B8]">
          <Clock className="w-3 h-3" />
          <span>{utcTime.replace('T', ' ').substring(0, 19)} UTC</span>
        </div>
      </div>
    </footer>
  );
};
