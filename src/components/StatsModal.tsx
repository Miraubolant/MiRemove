import React, { useEffect, useState } from 'react';
import { X, Sparkles, Clock, CheckCircle2, XCircle, Timer, BarChart3, Settings, Users } from 'lucide-react';
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
  const [allUserStats, setAllUserStats] = useState<UserStats[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadStats() {
      if (!user) return;

      try {
        // Vérifier si l'utilisateur est admin
        const { data: userStats, error: userError } = await supabase
          .from('user_stats')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();

        if (userError) throw userError;
        setIsAdmin(userStats?.is_admin || false);

        if (userStats?.is_admin) {
          // Récupérer les statistiques de tous les utilisateurs
          const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .order('processed_images', { ascending: false });

          if (error) throw error;
          setAllUserStats(data || []);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }

    loadStats();
  }, [user]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-200">
              {isAdmin ? 'Statistiques globales' : 'Statistiques'}
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-colors group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-sm text-gray-400">Images traitées</div>
              </div>
              <div className="text-3xl font-semibold text-emerald-500">
                {stats.processedImages}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-colors group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-sm text-gray-400">Taux de réussite</div>
              </div>
              <div className="text-3xl font-semibold text-emerald-500">
                {stats.successRate}%
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-colors group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-sm text-gray-400">Temps moyen</div>
              </div>
              <div className="text-3xl font-semibold text-emerald-500">
                {stats.averageProcessingTime.toFixed(1)}s
              </div>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Détails des traitements</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-400">Réussis</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">{stats.successCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-400">Échoués</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">{stats.failureCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Temps de traitement</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-400">Total</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {formatTime(stats.totalProcessingTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
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

          {/* Statistiques des utilisateurs (admin uniquement) */}
          {isAdmin && allUserStats.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-200">
                  Statistiques par utilisateur
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Utilisateur</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Images traitées</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Réussites</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Échecs</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Temps total</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Temps moyen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUserStats.map((userStat) => (
                      <tr key={userStat.id} className="border-b border-gray-800/50 hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {userStat.email}
                          {userStat.is_admin && (
                            <span className="ml-2 text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300 text-right">{userStat.processed_images}</td>
                        <td className="py-3 px-4 text-sm text-emerald-500 text-right">{userStat.success_count}</td>
                        <td className="py-3 px-4 text-sm text-red-500 text-right">{userStat.failure_count}</td>
                        <td className="py-3 px-4 text-sm text-gray-300 text-right">
                          {formatTime(userStat.total_processing_time)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300 text-right">
                          {formatTime(userStat.total_processing_time / (userStat.processed_images || 1))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!user && (
            <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-gray-700/30">
              <p className="text-sm text-gray-400">
                Ces statistiques sont réinitialisées à chaque nouvelle session. Pour accéder à l'historique complet, veuillez vous connecter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}