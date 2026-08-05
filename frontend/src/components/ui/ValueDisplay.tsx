import React from 'react';

export interface ValueDisplayProps {
  value: number | string | undefined | null;
  format?: 'currency' | 'percent' | 'number' | 'raw';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  colorize?: boolean;
  neutralColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  className?: string;
}

export const ValueDisplay: React.FC<ValueDisplayProps> = ({
  value,
  format = 'raw',
  decimals = 2,
  prefix = '',
  suffix = '',
  colorize = false,
  neutralColor = 'text-white',
  size = 'md',
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-slate-800 rounded h-6 w-20 inline-block align-middle ${className}`}
      />
    );
  }

  if (value === undefined || value === null) {
    return <span className={`text-slate-500 font-mono ${className}`}>--</span>;
  }

  const num = typeof value === 'number' ? value : parseFloat(value);
  const isNumeric = !isNaN(num);

  let formatted = String(value);

  if (isNumeric) {
    if (format === 'currency') {
      formatted = `${prefix}$${num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;
    } else if (format === 'percent') {
      formatted = `${prefix}${num > 0 ? '+' : ''}${num.toFixed(decimals)}%${suffix}`;
    } else if (format === 'number') {
      formatted = `${prefix}${num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;
    }
  }

  let colorClass = neutralColor;
  if (colorize && isNumeric) {
    if (num > 0) colorClass = 'text-emerald-400';
    else if (num < 0) colorClass = 'text-rose-400';
    else colorClass = 'text-slate-400';
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm font-medium',
    lg: 'text-lg font-semibold',
    xl: 'text-2xl font-bold',
  };

  return (
    <span className={`font-mono tracking-tight ${sizeClasses[size]} ${colorClass} ${className}`}>
      {formatted}
    </span>
  );
};
