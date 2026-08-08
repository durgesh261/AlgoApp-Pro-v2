import React from 'react';
import { WifiOff, Server, RefreshCw } from 'lucide-react';
import { useConnectionManager } from '../../hooks/useConnectionManager';

export const OfflineOverlay: React.FC = () => {
  const { status, forceReconnect, nextRetryIn, retryCount } = useConnectionManager();

  // Only show full overlay after 3+ failed retries (not on first load flicker)
  if (status !== 'disconnected' || retryCount < 3) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-[#0B0E14]/95 backdrop-blur-sm flex items-center justify-center">
      <div className="max-w-sm w-full mx-4 text-center">
        {/* Animated pulsing icon */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-[#F6465D]/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-[#F6465D]/10 border border-[#F6465D]/30 flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-[#F6465D]" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-[#F8FAFC] mb-2">Backend Disconnected</h2>
        <p className="text-[11px] text-[#94A3B8] mb-6 leading-relaxed">
          QuantEdge AI cannot reach the backend API. Live data, trading, and AI signals are
          unavailable. Check that your backend server is running.
        </p>

        {/* Info box */}
        <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex items-center space-x-2 text-[10px] text-[#94A3B8]">
            <Server className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <span>
              Expected:{' '}
              <code className="text-[#F8FAFC] bg-[#0B0E14] px-1 py-0.5 rounded">
                http://localhost:4000
              </code>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-[#94A3B8]">
            <WifiOff className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <span>
              Status: <span className="text-[#F6465D] font-bold">Connection Refused</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-[#94A3B8]">
            <RefreshCw className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <span>
              Auto-retry:{' '}
              <span className="text-[#F59E0B] font-mono">
                {nextRetryIn > 0 ? `${nextRetryIn}s` : '—'}
              </span>{' '}
              (attempt {retryCount})
            </span>
          </div>
        </div>

        <button
          onClick={forceReconnect}
          className="w-full py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reconnect Now</span>
        </button>

        <p className="mt-4 text-[9px] text-[#64748B]">
          Chart data and history may still be available from cache.
        </p>
      </div>
    </div>
  );
};
