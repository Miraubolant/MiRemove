import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, Clock } from 'lucide-react';
import { useStats } from '../contexts/StatsContext';
import { useAuthStore } from '../stores/authStore';

interface ProgressBarProps {
  total: number;
  completed: number;
  maxFreeImages: number;
}

export function ProgressBar({ total, completed, maxFreeImages }: ProgressBarProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());
  const { stats } = useStats();
  const { user } = useAuthStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const validCompleted = Math.min(completed, total);
  const progress = total === 0 ? 0 : Math.min((validCompleted / total) * 100, 100);
  const isComplete = validCompleted === total && total > 0;
  const remaining = total - validCompleted;

  const estimatedTimeRemaining = stats.averageProcessingTime > 0
    ? Math.round(remaining * stats.averageProcessingTime)
    : 0;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} seconde${remainingSeconds > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Timer className="w-4 h-4 text-emerald-500 animate-pulse" />
          )}
          <span className="text-sm text-gray-300">
            {validCompleted}/{total} image{total > 1 ? 's' : ''}
            {!user && remaining > 0 && (
              <span className="text-emerald-500 ml-2">
                ({remaining} restante{remaining > 1 ? 's' : ''} sur {maxFreeImages})
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>
            {isComplete ? 'Terminé' : `Reste ~${formatTime(estimatedTimeRemaining)}`}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="h-1 bg-slate-700/50">
          <div
            className={`h-full transition-all duration-500 ease-out relative ${
              isComplete
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
            }`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 w-full animate-[shine_2s_ease-in-out_infinite]">
              <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}