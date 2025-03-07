import React from 'react';

interface ProgressBarProps {
  total: number;
  completed: number;
}

export function ProgressBar({ total, completed }: ProgressBarProps) {
  const progress = total === 0 ? 0 : (completed / total) * 100;

  return (
    <div className="w-full bg-cream dark:bg-slate-700 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-olive to-sage dark:from-emerald-600 dark:to-emerald-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}