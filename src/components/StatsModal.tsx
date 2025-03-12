import React, { useEffect, useState } from 'react';
import { X, Sparkles, Clock, CheckCircle2, XCircle, Timer, BarChart3, ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

interface UserStats {
  id: string;
  email: string;
  processed_images: number;
  success_count: number;
  failure_count: number;
  total_processing_time: number;
  is_admin: boolean;
  image_limit: number;
}

interface StatsModalProps {
  onClose: () => void;
  stats: {
    processedImages: number;
    successRate: number;
    averageProcessingTime: number;
    totalProcessingTime: number;
    successCount: number;
    failureCount: number;
  };
}

export function StatsModal({ onClose, stats }: StatsModalProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadUserStats() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserStats(data);
      } catch (err) {
        console.error('Error loading user stats:', err);
      }
    }

    loadUserStats();
  }, [user]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header avec effet de gradient */}
        <div className="relative px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent"></div>
          <div className="relative flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Statistiques
            </h2>
          </div>
          <button onClick={onClose} className="relative btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Statistiques principales avec animations */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                label: "Images traitées",
                value: stats.processedImages,
                limit: userStats?.image_limit,
                color: "emerald"
              },
              {
                icon: CheckCircle2,
                label: "Taux de réussite",
                value: `${stats.successRate}%`,
                color: "emerald"
              },
              {
                icon: Clock,
                label: "Temps moyen",
                value: `${stats.averageProcessingTime.toFixed(1)}s`,
                color: "emerald"
              },
              {
                icon: ImageIcon,
                label: "Limite totale",
                value: userStats?.image_limit || "∞",
                color: "emerald"
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className="relative group overflow-hidden bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-lg"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Contenu */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-500/10 p-2 rounded-lg transform group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                  <div className="text-3xl font-semibold text-emerald-500 transform group-hover:scale-105 transition-transform duration-300">
                    {stat.limit ? `${stat.value} / ${stat.limit}` : stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistiques détaillées avec animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 rounded-xl p-6 border border-gray-700/30 hover:border-emerald-500/30 transition-all duration-300 group">
              <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Détails des traitements
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg group-hover:bg-slate-700/50 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-400">Réussis</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-500">{stats.successCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg group-hover:bg-slate-700/50 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-400">Échoués</span>
                  </div>
                  <span className="text-sm font-medium text-red-500">{stats.failureCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-6 border border-gray-700/30 hover:border-emerald-500/30 transition-all duration-300 group">
              <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-500" />
                Temps de traitement
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg group-hover:bg-slate-700/50 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-400">Total</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {formatTime(stats.totalProcessingTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg group-hover:bg-slate-700/50 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-400">Moyenne</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {formatTime(stats.averageProcessingTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}