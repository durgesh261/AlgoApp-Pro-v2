import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({ className = 'h-6 w-full' }) => {
  return (
    <div className={`bg-[#1E2638] animate-pulse rounded ${className}`} />
  );
};

export const WidgetSkeleton: React.FC = () => {
  return (
    <div className="bg-[#161D2A] border border-[#1E293B] rounded-xl p-4 space-y-4 shadow-sm animate-pulse font-mono">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <SkeletonBox className="h-5 w-40" />
        <SkeletonBox className="h-5 w-24" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SkeletonBox className="h-12 w-full" />
        <SkeletonBox className="h-12 w-full" />
        <SkeletonBox className="h-12 w-full" />
        <SkeletonBox className="h-12 w-full" />
      </div>
    </div>
  );
};
