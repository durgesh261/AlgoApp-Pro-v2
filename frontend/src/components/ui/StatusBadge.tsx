import React from 'react';

export interface StatusBadgeProps {
  status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR' | 'ONLINE' | 'OFFLINE' | 'DEGRADED' | string;
  label?: string;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
  showDot = true,
}) => {
  const normStatus = (status || '').toUpperCase();

  let bgClass = 'bg-slate-800/80 border-slate-700 text-slate-400';
  let dotClass = 'bg-slate-400';
  let isPulsing = false;

  if (normStatus === 'CONNECTED' || normStatus === 'ONLINE' || normStatus === 'HEALTHY') {
    bgClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    dotClass = 'bg-emerald-400';
  } else if (normStatus === 'RECONNECTING' || normStatus === 'DEGRADED' || normStatus === 'SYNCING') {
    bgClass = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    dotClass = 'bg-amber-400';
    isPulsing = true;
  } else if (normStatus === 'DISCONNECTED' || normStatus === 'OFFLINE' || normStatus === 'ERROR') {
    bgClass = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    dotClass = 'bg-rose-400';
  }

  const displayLabel = label || normStatus;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${bgClass} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotClass} ${isPulsing ? 'animate-ping' : ''}`}
        />
      )}
      {displayLabel}
    </span>
  );
};
