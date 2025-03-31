import React, { useEffect, useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Timer, 
  Users,
  Activity,
  Award,
  Zap,
  Image,
  ChevronRight,
  Clock,
  TrendingUp,
  Info,
  ArrowUpRight,
  BarChart3,
  Maximize2,
  Wand2,
  Scissors,
  Sparkles,
  Layers
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';

interface GroupData {
  id: string;
  name: string;
  image_limit: number;
  total_processed?: number;
  success_rate?: number;
  avg_processing_time?: number;
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

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  valueClassName = "text-emerald-400",
  subtitle,
  index = 0
}: { 
  icon: React.ElementType, 
  title: string, 
  value: string | number, 
  valueClassName?: string,
  subtitle?: string,
  index?: number
}) => {
  return (
    <div 
      className="bg-slate-800 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-emerald-500/10 hover:translate-y-px duration-300 animate-in fade-in"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="px-5 py-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-slate-700/50 p-2 rounded-lg">
            <Icon className={`w-4 h-4 ${valueClassName}`} />
          </div>
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <p className={`text-2xl font-bold ${valueClassName}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 border border-gray-700 rounded-full px-2 py-0.5 bg-slate-800/50 mt-3 w-fit">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ 
  icon: Icon, 
  title, 
  value, 
  iconColor = "text-emerald-400", 
  valueColor = "text-emerald-400",
  index = 0
}: { 
  icon: React.ElementType, 
  title: string, 
  value: string | number, 
  iconColor?: string, 
  valueColor?: string,
  index?: number
}) => (
  <div 
    className="flex items-center justify-between py-3 animate-in fade-in group hover:bg-slate-800/30 px-3 rounded-lg transition-all duration-300"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-slate-800 flex-shrink-0 group-hover:bg-slate-700 transition-all duration-300`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <span className="text-sm text-gray-300">{title}</span>
    </div>
    <span className={`text-sm font-medium ${valueColor} bg-slate-800 px-3 py-1.5 rounded-lg ml-2 whitespace-nowrap group-hover:shadow-md group-hover:shadow-${valueColor.split('-')[1]}-500/10 transition-all duration-300`}>
      {value}
    </span>
  </div>
);

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
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
};

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2.5 rounded-xl">
      <Icon className="w-5 h-5 text-emerald-400" />
    </div>
    <div>
      <h2 className="font-medium text-gray-200 text-lg">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

export function StatsModal({ onClose, stats }: StatsModalProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const [showAnimation, setShowAnimation] = useState(false);

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
              name,
              image_limit
            )
          `)
          .eq('user_id', user.id);

        if (groupError) throw groupError;

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

  const getOperationStats = () => {
    if (!userStats) return null;

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

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-auto ${showAnimation ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <div className={`bg-gradient-to-b from-slate-900 to-slate-900/95 rounded-xl shadow-2xl border border-slate-800/50 w-full max-w-[90vw] max-h-[90vh] flex flex-col ${showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} transition-all duration-300`}>
        <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2.5 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Statistiques</h2>
              <p className="text-xs text-gray-400">Analyse de performance</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="hover:bg-slate-800 transition-all duration-300 p-2 rounded-full"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="w-10 h-10 border-4 border-slate-700/30 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="text-emerald-400 animate-pulse">Chargement des statistiques...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="bg-gradient-to-b from-slate-800 to-slate-800/80 rounded-xl shadow-xl border border-slate-700/10">
                  <div className="bg-slate-700/20 backdrop-blur px-6 py-4 border-b border-slate-700/30">
                    <SectionHeader 
                      icon={Info} 
                      title="Statistiques globales" 
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <StatCard 
                        icon={Image} 
                        title="Images traitées" 
                        value={stats.processedImages.toLocaleString()} 
                        subtitle="Total"
                        index={0}
                      />
                      <StatCard 
                        icon={Award} 
                        title="Taux de réussite" 
                        value={`${stats.successRate.toFixed(1)}%`} 
                        subtitle={stats.successRate > 80 ? "Excellent" : (stats.successRate < 50 ? "À améliorer" : "Acceptable")}
                        valueClassName={stats.successRate > 80 ? "text-emerald-400" : (stats.successRate < 50 ? "text-red-400" : "text-yellow-400")}
                        index={1}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-slate-800 to-slate-800/80 rounded-xl shadow-xl border border-slate-700/10">
                  <div className="bg-slate-700/20 backdrop-blur px-6 py-4 border-b border-slate-700/30">
                    <SectionHeader 
                      icon={Timer} 
                      title="Temps de traitement" 
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <StatCard 
                        icon={Zap} 
                        title="Temps moyen" 
                        value={formatTime(stats.averageProcessingTime)} 
                        subtitle="par image"
                        valueClassName="text-blue-400"
                        index={2}
                      />
                      <StatCard 
                        icon={Clock} 
                        title="Temps total" 
                        value={formatLongTime(stats.totalProcessingTime)} 
                        subtitle="de traitement"
                        valueClassName="text-purple-400"
                        index={3}
                      />
                    </div>
                  </div>
                </div>

                {userStats?.group && (
                  <div className="bg-gradient-to-b from-slate-800 to-slate-800/80 rounded-xl shadow-xl border border-slate-700/10">
                    <div className="bg-slate-700/20 backdrop-blur px-6 py-4 border-b border-slate-700/30">
                      <SectionHeader 
                        icon={Users} 
                        title={`Groupe ${userStats.group.name}`} 
                        subtitle="Statistiques collectives" 
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-6">
                        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-5 shadow-md border border-slate-700/20">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-slate-700/70 p-2 rounded-lg">
                                <Image className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div className="text-sm text-gray-300 font-medium">Images groupe</div>
                            </div>
                            <div className="text-xs text-gray-400 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/30">
                              {Math.min(100, Math.round((userStats.group.total_processed || 0) / userStats.group.image_limit * 100))}% utilisé
                            </div>
                          </div>
                          <div className="flex justify-between items-end mb-4">
                            <div className="text-2xl font-bold text-emerald-400">
                              {userStats.group.total_processed}
                            </div>
                            <div className="text-xs text-gray-400 bg-slate-700/30 px-2 py-1 rounded-lg">
                              Limite: {userStats.group.image_limit}
                            </div>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2.5 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min(100, (userStats.group.total_processed || 0) / userStats.group.image_limit * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-5 shadow-md border border-slate-700/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-slate-700/70 p-2 rounded-lg">
                              <Image className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="text-sm text-gray-300 font-medium">Votre contribution</div>
                          </div>
                          <div className="text-2xl font-bold text-blue-400 mb-4">
                            {userStats.processed_images}
                          </div>
                          {userStats.processed_images && userStats.group.total_processed ? (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
                                  style={{ width: `${Math.round(userStats.processed_images / userStats.group.total_processed * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-blue-300 whitespace-nowrap bg-slate-700/30 px-2 py-1 rounded-lg">
                                {Math.round(userStats.processed_images / userStats.group.total_processed * 100)}% du groupe
                              </span>
                            </div>
                          ) : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                {userStats && (
                  <div className="bg-gradient-to-b from-slate-800 to-slate-800/80 rounded-xl shadow-xl border border-slate-700/10">
                    <div className="bg-slate-700/20 backdrop-blur px-6 py-4 border-b border-slate-700/30">
                      <SectionHeader 
                        icon={Layers} 
                        title="Statistiques par type d'opération" 
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        {getOperationStats()?.map((op, index) => (
                          <div key={op.name} className="bg-slate-800/80 backdrop-blur rounded-xl p-5 shadow-md border border-slate-700/20">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="bg-slate-700/70 p-2 rounded-lg">
                                <op.icon className={`w-4 h-4 ${op.color}`} />
                              </div>
                              <div className="text-sm text-gray-300 font-medium">{op.name}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-2xl font-bold mb-1 text-gray-200">
                                  {op.count}
                                </div>
                                <div className="text-xs text-gray-400">
                                  images traitées
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-medium ${op.color}`}>
                                  {formatTime(op.time / (op.count || 1))}
                                </div>
                                <div className="text-xs text-gray-400">
                                  temps moyen
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-800/50 flex justify-end sticky bottom-0 z-10 backdrop-blur bg-slate-900/90">
          <Link 
            to="/"
            onClick={handleClose}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 font-medium"
          >
            Retour à l'accueil
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}