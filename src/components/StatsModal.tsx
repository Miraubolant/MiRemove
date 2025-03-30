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
  Info
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
      className="bg-slate-800/90 rounded-lg overflow-hidden shadow-md animate-in fade-in"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="border-b border-slate-700/50">
        <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
          <Icon className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <p className={`text-xl font-semibold ${valueClassName}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 border border-gray-700 rounded-full px-2 py-1 bg-slate-800/50">{subtitle}</p>
        )}
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
    className="flex items-center justify-between py-2.5 border-b border-slate-700/30 last:border-0 animate-in fade-in"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex items-center gap-2.5">
      <div className={`p-1.5 rounded-md bg-slate-700`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      <span className="text-sm text-gray-300">{title}</span>
    </div>
    <span className={`text-sm font-medium ${valueColor} bg-slate-800 px-2.5 py-1 rounded-md`}>{value}</span>
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

export function StatsModal({ onClose, stats }: StatsModalProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
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

  const GroupSection = ({ group }: { group: GroupData }) => (
    <div className="bg-slate-800/90 rounded-lg shadow-md overflow-hidden animate-in fade-in">
      <div className="bg-slate-800 px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-medium text-gray-200">
              Groupe {group.name}
            </h2>
            <p className="text-xs text-gray-400">Statistiques collectives</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-slate-900/40 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Image className="w-3.5 h-3.5 text-emerald-400" />
                <div className="text-sm text-gray-300">Images groupe</div>
              </div>
              <div className="text-xs text-gray-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {Math.min(100, Math.round((group.total_processed || 0) / group.image_limit * 100))}% utilisé
              </div>
            </div>
            <div className="flex justify-between items-end mb-2">
              <div className="text-xl font-semibold text-emerald-400">
                {group.total_processed}
              </div>
              <div className="text-xs text-gray-400">
                sur {group.image_limit}
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (group.total_processed || 0) / group.image_limit * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-slate-900/40 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-3.5 h-3.5 text-blue-400" />
              <div className="text-sm text-gray-300">Vos images</div>
            </div>
            <div className="text-xl font-semibold text-blue-400">
              {userStats?.processed_images}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {userStats?.processed_images && group.total_processed ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${Math.round(userStats.processed_images / group.total_processed * 100)}%` }}
                    ></div>
                  </div>
                  <span className="min-w-[40px] text-right">{Math.round(userStats.processed_images / group.total_processed * 100)}%</span>
                </div>
              ) : ''}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/40 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <div className="text-sm text-gray-300">Taux de réussite</div>
            </div>
            <div className="text-xl font-semibold text-yellow-400">
              {group.success_rate?.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-400 bg-slate-800 px-2 py-0.5 rounded-full">Performance collective</span>
            </div>
          </div>
          
          <div className="bg-slate-900/40 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <div className="text-sm text-gray-300">Temps moyen</div>
            </div>
            <div className="text-xl font-semibold text-purple-400">
              {formatTime(group.avg_processing_time || 0)}
            </div>
            <div className="text-xs text-gray-400 mt-2 bg-slate-800 px-2 py-0.5 rounded-full w-fit">
              par image
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-auto">
      <div className="bg-slate-900 rounded-lg shadow-2xl border border-slate-800/50 w-full max-w-3xl animate-in fade-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">
                Statistiques
              </h2>
              <p className="text-xs text-gray-400">Analyse de performance</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-slate-800 transition-all duration-300 p-2 rounded-full"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/90">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="text-emerald-400">Chargement des statistiques...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {userStats?.group ? (
                <GroupSection group={userStats.group} />
              ) : null}

              <div className="bg-slate-800/90 rounded-lg shadow-md overflow-hidden">
                <div className="bg-slate-800 px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg">
                      <Info className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h2 className="font-medium text-gray-200">
                      Statistiques générales
                    </h2>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                      icon={Image} 
                      title="Images traitées" 
                      value={stats.processedImages} 
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
                    <StatCard 
                      icon={Zap} 
                      title="Temps moyen" 
                      value={formatTime(stats.averageProcessingTime)} 
                      subtitle="par image"
                      valueClassName="text-blue-400"
                      index={2}
                    />
                    <StatCard 
                      icon={Timer} 
                      title="Temps total" 
                      value={formatLongTime(stats.totalProcessingTime)} 
                      subtitle="de traitement"
                      valueClassName="text-purple-400"
                      index={3}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-slate-800/90 rounded-lg shadow-md overflow-hidden">
                  <div className="bg-slate-800 px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h3 className="font-medium text-gray-200">
                        Détails des traitements
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <DetailRow 
                      icon={CheckCircle2} 
                      title="Réussis" 
                      value={stats.successCount} 
                      index={0}
                    />
                    <DetailRow 
                      icon={XCircle} 
                      title="Échoués" 
                      value={stats.failureCount} 
                      iconColor="text-red-400" 
                      valueColor="text-red-400" 
                      index={1}
                    />
                    <DetailRow 
                      icon={Activity} 
                      title="Taux de conversion" 
                      value={`${(stats.successCount / (stats.successCount + stats.failureCount) * 100).toFixed(1)}%`} 
                      iconColor="text-blue-400" 
                      valueColor="text-blue-400" 
                      index={2}
                    />
                  </div>
                </div>

                <div className="bg-slate-800/90 rounded-lg shadow-md overflow-hidden">
                  <div className="bg-slate-800 px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded-lg">
                        <Timer className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h3 className="font-medium text-gray-200">
                        Temps de traitement
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <DetailRow 
                      icon={Timer} 
                      title="Total" 
                      value={formatLongTime(stats.totalProcessingTime)}
                      index={0}
                    />
                    <DetailRow 
                      icon={Clock} 
                      title="Moyenne" 
                      value={formatTime(stats.averageProcessingTime)} 
                      valueColor="text-blue-400"
                      iconColor="text-blue-400"
                      index={1}
                    />
                    <DetailRow 
                      icon={TrendingUp} 
                      title="Efficacité" 
                      value={stats.successRate > 70 ? "Optimale" : (stats.successRate > 50 ? "Correcte" : "À améliorer")}
                      iconColor="text-yellow-400"
                      valueColor="text-yellow-400"
                      index={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900">
          <Link 
            to="/"
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-md flex items-center gap-2 transition-all duration-300"
          >
            Retour à l'accueil
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}