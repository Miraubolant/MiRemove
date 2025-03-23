import React, { useEffect, useState } from 'react';
import { X, Sparkles, Clock, CheckCircle2, XCircle, Timer, BarChart3, Users } from 'lucide-react';
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
  group?: {
    id: string;
    name: string;
    image_limit: number;
    total_processed?: number;
    success_rate?: number;
    avg_processing_time?: number;
  };
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
        // Get user stats
        const { data: userData, error: userError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userError) throw userError;

        // Check if user is in a group - don't use single() here
        const { data: groupData, error: groupError } = await supabase
          .from('group_members')
          .select(`
            groups (
              id,
              name,
              image_limit
            )
          `)
          .eq('user_id', user.id);

        if (groupError) throw groupError;

        // If user is in a group, get group stats
        let groupStats = null;
        if (groupData && groupData.length > 0 && groupData[0].groups) {
          const { data: stats, error: statsError } = await supabase
            .rpc('get_group_stats', { p_group_id: groupData[0].groups.id });

          if (statsError) throw statsError;

          groupStats = {
            ...groupData[0].groups,
            ...stats
          };
        }

        setUserStats({
          ...userData,
          group: groupStats
        });
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

  const formatLongTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0 || hours > 0) {
      parts.push(`${minutes}m`);
    }
    if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) {
      parts.push(`${remainingSeconds}s`);
    }

    return parts.join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
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
          <button 
            onClick={onClose} 
            className="relative btn-icon hover:bg-white/10 transition-colors duration-300"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Main Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {userStats?.group ? (
              <>
                <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 col-span-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-medium text-gray-200">
                      Groupe {userStats.group.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Images traitées (groupe)</div>
                      <div className="text-2xl font-semibold text-emerald-500">
                        {userStats.group.total_processed} / {userStats.group.image_limit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Images traitées (vous)</div>
                      <div className="text-2xl font-semibold text-emerald-500">
                        {userStats.processed_images}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Taux de réussite</div>
                      <div className="text-2xl font-semibold text-emerald-500">
                        {userStats.group.success_rate?.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Temps moyen</div>
                      <div className="text-2xl font-semibold text-emerald-500">
                        {formatTime(userStats.group.avg_processing_time || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-medium text-gray-400">Images traitées</h3>
                  </div>
                  <p className="text-2xl font-semibold text-emerald-500">
                    {stats.processedImages}
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-medium text-gray-400">Taux de réussite</h3>
                  </div>
                  <p className="text-2xl font-semibold text-emerald-500">
                    {stats.successRate.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-medium text-gray-400">Temps moyen</h3>
                  </div>
                  <p className="text-2xl font-semibold text-emerald-500">
                    {formatTime(stats.averageProcessingTime)}
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-medium text-gray-400">Temps total</h3>
                  </div>
                  <p className="text-2xl font-semibold text-emerald-500">
                    {formatLongTime(stats.totalProcessingTime)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Detailed Stats */}
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
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-emerald-500">
                      {formatLongTime(stats.totalProcessingTime)}
                    </span>
                  </div>
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