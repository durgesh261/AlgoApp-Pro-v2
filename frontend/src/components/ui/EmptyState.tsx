import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-8 text-center font-mono space-y-3 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-[#1E2638] border border-[#334155] flex items-center justify-center mx-auto text-[#3B82F6]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-[#F8FAFC]">{title}</h3>
      <p className="text-xs text-[#94A3B8] max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
