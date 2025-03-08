import React from 'react';
import { Timer, CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  total: number;
  completed: number;
}

export function ProgressBar({ total, completed }: ProgressBarProps) {
  const progress = total === 0 ? 0 : (completed / total) * 100;
  const isComplete = completed === total && total > 0;

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isComplete
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
            }`}
            style={{ width: `${progress}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 w-full animate-[shine_2s_ease-in-out_infinite]">
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        </div>

        {/* Pulsing dot for active progress */}
        {progress > 0 && progress < 100 && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3"
            style={{ left: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
            <div className="relative w-3 h-3 bg-emerald-500 rounded-full" />
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500 font-medium">
                Traitement terminé
              </span>
            </>
          ) : (
            <>
              <Timer className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-gray-400">
                {completed} sur {total} image{total > 1 ? 's' : ''} traitée{total > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
        <div className="text-gray-400 font-medium">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}