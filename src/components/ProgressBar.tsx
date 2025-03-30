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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Timer className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
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

      <div className="relative h-1.5">
        {/* Fond de la barre avec effet de grain */}
        <div className="absolute inset-0 bg-slate-700/50">
          <div className="absolute inset-0 opacity-50 mix-blend-overlay">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwMDAwMTAiLz4KPHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI2ZmZmZmZjEwIi8+Cjwvc3ZnPg==')]" />
          </div>
        </div>

        {/* Barre de progression avec effets */}
        <div
          className={`absolute h-full transition-all duration-500 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
          }`}
          style={{ width: `${progress}%` }}
        >
          {/* Effet de brillance */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 opacity-75">
              <div className="absolute top-0 -left-[100%] w-[400%] h-full animate-[shine_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>

          {/* Effet de pulsation */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 animate-pulse opacity-50" />
        </div>

        {/* Points de progression */}
        <div className="absolute inset-0 flex items-center">
          {[...Array(Math.ceil(total / 2))].map((_, i) => (
            <div
              key={i}
              className={`w-0.5 h-0.5 rounded-full mx-0.5 transition-all duration-300 ${
                i * 2 <= validCompleted
                  ? 'bg-white/30'
                  : 'bg-white/5'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}