import React from 'react';

export interface PortfolioCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  action,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}) => {
  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-200 hover:border-slate-700/80 ${className}`}
    >
      {(title || icon || badge || action) && (
        <div
          className={`px-4 py-3 border-b border-slate-800/80 flex items-center justify-between gap-2 bg-slate-950/40 ${headerClassName}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <div className="text-slate-400 shrink-0">{icon}</div>}
            <div className="min-w-0">
              {title && (
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 truncate font-mono">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-[10px] text-slate-500 truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {badge}
            {action}
          </div>
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
