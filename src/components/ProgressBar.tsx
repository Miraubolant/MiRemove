import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, Image as ImageIcon, Clock } from 'lucide-react';

interface ProgressBarProps {
  total: number;
  completed: number;
}

export function ProgressBar({ total, completed }: ProgressBarProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Ensure completed never exceeds total
  const validCompleted = Math.min(completed, total);
  const progress = total === 0 ? 0 : Math.min((validCompleted / total) * 100, 100);
  const isComplete = validCompleted === total && total > 0;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} seconde${remainingSeconds > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          {isComplete ? (
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          ) : (
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Timer className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-200">
              {isComplete ? 'Traitement terminé' : 'Traitement en cours'}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs text-gray-400">
                {validCompleted} sur {total} image{total > 1 ? 's' : ''} traitée{validCompleted > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
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

        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-400">
            {isComplete ? (
              <span className="text-emerald-500">Traitement terminé avec succès</span>
            ) : (
              <span>Traitement des images en cours...</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
            <span className="text-gray-300 font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}