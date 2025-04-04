import React, { useEffect, useState } from 'react';
import { 
  X, Activity, Users, ArrowUpRight, 
  Maximize2, Wand2, Scissors, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';

interface GroupData {
  id: string;
  name: string;
  image_limit: number;
  total_processed?: number;
}

interface UserStats {
  id: string;
  email: string;
  processed_images: number;
  success_count: number;
  failure_count: number;
  total_processing_time: number;
  is_admin: boolean;
  image_limit: number;
  resize_count: number;
  ai_count: number;
  crop_head_count: number;
  all_processing_count: number;
  resize_processing_time: number;
  ai_processing_time: number;
  crop_head_processing_time: number;
  all_processing_time: number;
  group?: GroupData;
}

interface Stats {
  processedImages: number;
  successRate: number;
  averageProcessingTime: number;
  totalProcessingTime: number;
  successCount: number;
  failureCount: number;
}

interface StatsModalProps {
  onClose: () => void;
  stats: Stats;
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
};

const StatCard = ({ icon: Icon, title, count, time, color, bgColor }: { 
  icon: React.ElementType;
  title: string;
  count: number;
  time: number;
  color: string;
  bgColor: string;
}) => (
  <div className={`bg-slate-800 rounded-xl shadow-lg p-4 transition-all duration-300 hover:scale-105 border border-slate-700/30`}>
    <div className="flex items-center gap-2 mb-3">
      <div className={`${color} bg-opacity-20 rounded-lg p-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-white truncate">{title}</span>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-2xl font-bold text-white">{count}</p>
        <p className="text-xs font-medium text-gray-400">images traitées</p>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-white">{formatTime(time / count || 0)}</p>
        <p className="text-xs font-medium text-gray-400">temps moyen</p>
      </div>
    </div>
  </div>
);

export function StatsModal({ onClose, stats }: StatsModalProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [groupStats, setGroupStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadStats() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Load user stats
        const { data: userData, error: userError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userError) throw userError;
        setUserStats(userData);

        // Load group stats if user is in a group
        const { data: groupData, error: groupError } = await supabase
          .from('group_members')
          .select(`
            groups (
              id,
              name,
              image_limit
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (groupError) throw groupError;

        if (groupData?.groups) {
          // Get group operation stats
          const { data: operationStats, error: statsError } = await supabase
            .rpc('get_group_operation_stats', { p_group_id: groupData.groups.id });

          if (statsError) throw statsError;

          // Calculate total processed images
          const totalProcessed = (operationStats.resize?.count || 0) +
                               (operationStats.ai?.count || 0) +
                               (operationStats.crop_head?.count || 0) +
                               (operationStats.all?.count || 0);

          setGroupStats({
            ...groupData.groups,
            ...operationStats,
            total_processed: totalProcessed
          });
        }
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [user]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-auto">
      <div className="bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-800/50">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-800/50 bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 rounded-full p-3 shadow-lg shadow-emerald-500/10">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Tableau de Performance</h2>
              <span className="text-sm font-medium text-emerald-500/90">Statistiques détaillées de traitement</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-emerald-500 p-2 rounded-full hover:bg-slate-800 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-900">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-10 h-10 border-3 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* User Stats */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 rounded-lg p-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">Vos statistiques par type de traitement</h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/30">Temps réel</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={Maximize2}
                    title="Redimensionnement"
                    count={userStats?.resize_count || 0}
                    time={userStats?.resize_processing_time || 0}
                    color="text-blue-400"
                    bgColor=""
                  />
                  <StatCard
                    icon={Wand2}
                    title="Traitement IA"
                    count={userStats?.ai_count || 0}
                    time={userStats?.ai_processing_time || 0}
                    color="text-purple-400"
                    bgColor=""
                  />
                  <StatCard
                    icon={Scissors}
                    title="Suppression tête"
                    count={userStats?.crop_head_count || 0}
                    time={userStats?.crop_head_processing_time || 0}
                    color="text-red-400"
                    bgColor=""
                  />
                  <StatCard
                    icon={Sparkles}
                    title="Tous les traitements"
                    count={userStats?.all_processing_count || 0}
                    time={userStats?.all_processing_time || 0}
                    color="text-amber-400"
                    bgColor=""
                  />
                </div>
              </div>

              {/* Group Stats */}
              {groupStats && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/20 rounded-lg p-2">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <h3 className="text-base font-bold text-white">Statistiques du groupe {groupStats.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-800 rounded-full h-2 w-32 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full"
                          style={{ width: `${Math.min(100, (groupStats.total_processed || 0) / groupStats.image_limit * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-300 whitespace-nowrap">
                        {groupStats.total_processed || 0} / {groupStats.image_limit} images
                      </span>
                      <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/30">Collaboratif</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      icon={Maximize2}
                      title="Redimensionnement"
                      count={groupStats.resize?.count || 0}
                      time={groupStats.resize?.time || 0}
                      color="text-blue-400"
                      bgColor=""
                    />
                    <StatCard
                      icon={Wand2}
                      title="Traitement IA"
                      count={groupStats.ai?.count || 0}
                      time={groupStats.ai?.time || 0}
                      color="text-purple-400"
                      bgColor=""
                    />
                    <StatCard
                      icon={Scissors}
                      title="Suppression tête"
                      count={groupStats.crop_head?.count || 0}
                      time={groupStats.crop_head?.time || 0}
                      color="text-red-400"
                      bgColor=""
                    />
                    <StatCard
                      icon={Sparkles}
                      title="Tous les traitements"
                      count={groupStats.all?.count || 0}
                      time={groupStats.all?.time || 0}
                      color="text-amber-400"
                      bgColor=""
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800/50 flex justify-end bg-slate-900">
          <Link 
            to="/"
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Retour à l'accueil
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}