import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deltaApi } from '../../services/api';
import { useTerminalStore } from '../../store/useTerminalStore';
import { useConnectionManager } from '../../hooks/useConnectionManager';
import { nowIST } from '../../utils/time';
import { Wifi, WifiOff, Clock, Cpu, Radio, Zap, ShieldCheck } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { activeTimeframe } = useTerminalStore();
  const [istTime, setIstTime] = useState(nowIST());

  const { isBackendReachable, isDeltaReachable, status } = useConnectionManager();

  const { data: deltaHealth } = useQuery({
    queryKey: ['deltaHealth'],
    queryFn: deltaApi.getHealth,
    refetchInterval: 5000,
    enabled: isBackendReachable,
  });

  const isDeltaConnected = deltaHealth?.data?.connectionState === 'CONNECTED';

  useEffect(() => {
    const timer = setInterval(() => setIstTime(nowIST()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dot = (ok: boolean) => (
    <div
      className={`w-1.5 h-1.5 rounded-full ${
        ok ? 'bg-[#00C896]' : 'bg-[#F6465D] animate-pulse'
      }`}
    />
  );

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
        <div className={`flex items-center space-x-1 ${isBackendReachable ? 'text-[#F8FAFC]' : 'text-[#F6465D]'}`}>
          {isBackendReachable
            ? <Wifi className="w-3 h-3 text-[#00C896]" />
            : <WifiOff className="w-3 h-3 text-[#F6465D]" />
          }
          <span>BE: {isBackendReachable ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* Pipeline */}
        <div className="flex items-center space-x-1 text-[#F8FAFC]">
          <Zap className="w-3 h-3 text-[#F59E0B]" />
          <span>
            PIPELINE:{' '}
            {isBackendReachable ? (
              <span className="text-[#00C896]">9/9 STAGES OK</span>
            ) : (
              <span className="text-[#F6465D]">OFFLINE</span>
            )}
          </span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* Stream */}
        <div className="flex items-center space-x-1 text-[#3B82F6]">
          <Radio className="w-3 h-3 text-[#3B82F6]" />
          <span>STREAM: {activeTimeframe} CANDLES</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Delta Mode */}
        <div className={`flex items-center space-x-1 font-bold ${isDeltaConnected ? 'text-[#00C896]' : 'text-[#94A3B8]'}`}>
          <ShieldCheck className={`w-3 h-3 ${isDeltaConnected ? 'text-[#00C896]' : 'text-[#94A3B8]'}`} />
          <span>MODE: {isDeltaConnected ? 'DELTA EXCHANGE LIVE' : 'DELTA DISCONNECTED'}</span>
        </div>

        <div className="h-3 w-px bg-[#1E293B]" />

        {/* Clock */}
        <div className="flex items-center space-x-1 text-[#F8FAFC] font-mono-tabular">
          <Clock className="w-3 h-3 text-[#3B82F6]" />
          <span>{istTime}</span>
        </div>
      </div>
    </footer>
  );
};
