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

const StatCard = ({ icon: Icon, title, count, time, color }: { 
  icon: React.ElementType;
  title: string;
  count: number;
  time: number;
  color: string;
}) => (
  <div className="bg-slate-800 rounded-md border border-slate-700/50 p-3 hover:border-slate-600 transition-colors">
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-gray-300 truncate">{title}</span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-xl font-medium text-white">{count}</p>
        <p className="text-xs text-gray-500">images traitées</p>
      </div>
      <div>
        <p className="text-xl font-medium text-white">{formatTime(time / count || 0)}</p>
        <p className="text-xs text-gray-500">temps moyen</p>
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
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 overflow-auto">
      <div className="bg-slate-900 rounded-md w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-base font-medium text-white">Statistiques</h2>
              <span className="text-xs text-gray-500">Analyse de performance</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 border-3 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* User Stats */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-medium text-white">Vos statistiques par type de traitement</h3>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full">Temps réel</span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={Maximize2}
                    title="Redimensionnement"
                    count={userStats?.resize_count || 0}
                    time={userStats?.resize_processing_time || 0}
                    color="text-blue-400"
                  />
                  <StatCard
                    icon={Wand2}
                    title="Traitement IA"
                    count={userStats?.ai_count || 0}
                    time={userStats?.ai_processing_time || 0}
                    color="text-purple-400"
                  />
                  <StatCard
                    icon={Scissors}
                    title="Suppression tête"
                    count={userStats?.crop_head_count || 0}
                    time={userStats?.crop_head_processing_time || 0}
                    color="text-red-400"
                  />
                  <StatCard
                    icon={Sparkles}
                    title="Tous les traitements"
                    count={userStats?.all_processing_count || 0}
                    time={userStats?.all_processing_time || 0}
                    color="text-amber-400"
                  />
                </div>
              </div>

              {/* Group Stats */}
              {groupStats && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <h3 className="text-sm font-medium text-white">Statistiques du groupe {groupStats.name}</h3>
                      <div className="ml-2 bg-slate-800 rounded-full h-1.5 w-32 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full"
                          style={{ width: `${Math.min(100, (groupStats.total_processed || 0) / groupStats.image_limit * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{groupStats.total_processed || 0} / {groupStats.image_limit} images</span>
                    </div>
                    <span className="text-xs text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">Collaboratif</span>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={Maximize2}
                      title="Redimensionnement"
                      count={groupStats.resize?.count || 0}
                      time={groupStats.resize?.time || 0}
                      color="text-blue-400"
                    />
                    <StatCard
                      icon={Wand2}
                      title="Traitement IA"
                      count={groupStats.ai?.count || 0}
                      time={groupStats.ai?.time || 0}
                      color="text-purple-400"
                    />
                    <StatCard
                      icon={Scissors}
                      title="Suppression tête"
                      count={groupStats.crop_head?.count || 0}
                      time={groupStats.crop_head?.time || 0}
                      color="text-red-400"
                    />
                    <StatCard
                      icon={Sparkles}
                      title="Tous les traitements"
                      count={groupStats.all?.count || 0}
                      time={groupStats.all?.time || 0}
                      color="text-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <Link 
            to="/"
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm px-4 py-2 rounded flex items-center gap-2 transition-all"
          >
            Retour à l'accueil
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}