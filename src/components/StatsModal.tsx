import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity,
  Maximize2,
  Wand2,
  Scissors,
  Sparkles,
  Users,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import { useAdminService } from '../services/adminService';

interface GroupData {
  id: string;
  name: string;
  operations?: {
    resize: { count: number; time: number };
    ai: { count: number; time: number };
    crop_head: { count: number; time: number };
    all: { count: number; time: number };
  };
}

interface UserStats {
  id: string;
  email: string;
  processed_images: number;
  success_count: number;
  failure_count: number;
  total_processing_time: number;
  is_admin: boolean;
  group?: GroupData;
  resize_count: number;
  ai_count: number;
  crop_head_count: number;
  all_processing_count: number;
  resize_processing_time: number;
  ai_processing_time: number;
  crop_head_processing_time: number;
  all_processing_time: number;
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

interface OperationCardProps {
  icon: React.ElementType;
  name: string;
  count: number;
  time: number; // Kept for compatibility with existing code
  color: string;
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
};

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType, title: string }) => (
  <div className="flex items-center gap-3 mb-2">
    <Icon className="w-5 h-5 text-emerald-400" />
    <h2 className="font-medium text-gray-200 text-lg">{title}</h2>
  </div>
);

const OperationCard = ({ icon: Icon, name, count, time, color }: OperationCardProps) => (
  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700/30">
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="text-sm text-gray-300">{name}</div>
    </div>
    <div className="flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl font-bold text-gray-200">{count}</div>
        <div className="text-xs text-gray-400">images traitées</div>
      </div>
    </div>
  </div>
);

export function StatsModal({ onClose, stats }: StatsModalProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const [showAnimation, setShowAnimation] = useState(false);
  const adminService = useAdminService();
  
  useEffect(() => {
    setShowAnimation(true);
    
    async function loadUserStats() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: userData, error: userError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userError) throw userError;

        const { data: groupData, error: groupError } = await supabase
          .from('group_members')
          .select(`
            groups (
              id,
              name
            )
          `)
          .eq('user_id', user.id);

        if (groupError) throw groupError;

        let groupStats = null;
        if (groupData && groupData.length > 0 && groupData[0].groups) {
          const stats = await adminService.loadGroupOperationStats(groupData[0].groups.id);
          
          groupStats = {
            ...groupData[0].groups,
            operations: stats
          };
        }

        setUserStats({
          ...userData,
          group: groupStats
        });
      } catch (err) {
        console.error('Error loading user stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserStats();
  }, [user]);

  const handleClose = () => {
    setShowAnimation(false);
    setTimeout(() => onClose(), 300);
  };

  const getUserOperations = () => {
    if (!userStats) return [];

    return [
      {
        icon: Maximize2,
        name: 'Redimensionnement',
        count: userStats.resize_count,
        time: userStats.resize_processing_time,
        color: 'text-blue-400'
      },
      {
        icon: Wand2,
        name: 'Traitement IA',
        count: userStats.ai_count,
        time: userStats.ai_processing_time,
        color: 'text-purple-400'
      },
      {
        icon: Scissors,
        name: 'Suppression tête',
        count: userStats.crop_head_count,
        time: userStats.crop_head_processing_time,
        color: 'text-red-400'
      },
      {
        icon: Sparkles,
        name: 'Tous les traitements',
        count: userStats.all_processing_count,
        time: userStats.all_processing_time,
        color: 'text-amber-400'
      }
    ];
  };

  const getGroupOperations = () => {
    if (!userStats?.group?.operations) return [];

    const operations = [];
    const icons = {
      resize: Maximize2,
      ai: Wand2,
      crop_head: Scissors,
      all: Sparkles
    };
    const colors = {
      resize: 'text-blue-400',
      ai: 'text-purple-400',
      crop_head: 'text-red-400',
      all: 'text-amber-400'
    };
    const names = {
      resize: 'Redimensionnement',
      ai: 'Traitement IA',
      crop_head: 'Suppression tête',
      all: 'Tous les traitements'
    };

    for (const [type, data] of Object.entries(userStats.group.operations)) {
      operations.push({
        icon: icons[type],
        name: names[type],
        count: data.count,
        time: data.time,
        color: colors[type]
      });
    }

    return operations;
  };

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto ${showAnimation ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <div className={`bg-slate-900 rounded-xl border border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col ${showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} transition-all duration-300`}>
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10 bg-slate-900">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-medium text-white">Statistiques</h2>
          </div>
          <button 
            onClick={handleClose} 
            className="hover:bg-slate-800 p-2 rounded-full"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="w-10 h-10 border-4 border-slate-700/30 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="text-emerald-400">Chargement des statistiques...</div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* User Operations Stats */}
              <div>
                <SectionHeader 
                  icon={Activity} 
                  title="Vos statistiques par type d'opération" 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {getUserOperations().map(op => (
                    <OperationCard
                      key={op.name}
                      icon={op.icon}
                      name={op.name}
                      count={op.count}
                      time={op.time}
                      color={op.color}
                    />
                  ))}
                </div>
              </div>

              {/* Group Operations Stats */}
              {userStats?.group && (
                <div>
                  <SectionHeader 
                    icon={Users} 
                    title={`Statistiques du groupe ${userStats.group.name}`} 
                  />
                  
                  {/* Total Group Images */}
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700/30 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <div className="text-sm text-gray-300">Total du groupe</div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400">
                          {userStats.group.operations?.all?.count || 0}
                        </div>
                        <div className="text-xs text-gray-400">images traitées</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {getGroupOperations().map(op => (
                      <OperationCard
                        key={op.name}
                        icon={op.icon}
                        name={op.name}
                        count={op.count}
                        time={op.time}
                        color={op.color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-800 flex justify-end sticky bottom-0 bg-slate-900">
          <Link 
            to="/"
            onClick={handleClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all font-medium"
          >
            Retour à l'accueil
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}