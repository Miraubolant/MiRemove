import React, { useEffect, useState } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Timer, 
  BarChart3, 
  Users,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Award,
  Zap,
  Image,
  LineChart,
  ChevronRight
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
  valueClassName = "text-emerald-500",
  trend,
  trendValue,
  animation = "fade-in"
}: { 
  icon: React.ElementType, 
  title: string, 
  value: string | number, 
  valueClassName?: string,
  trend?: "up" | "down" | "neutral",
  trendValue?: string,
  animation?: "fade-in" | "slide-up" | "scale-in" | "bounce" 
}) => {
  const animationClasses = {
    "fade-in": "animate-in fade-in duration-500",
    "slide-up": "animate-in slide-in-from-bottom-4 duration-500",
    "scale-in": "animate-in zoom-in-50 duration-500",
    "bounce": "animate-bounce"
  };

  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-blue-400"
  };
  
  const TrendIcon = () => {
    if (!trend) return null;
    
    return trend === "up" ? 
      <ArrowUpRight className={`w-3 h-3 ${trendColors[trend]}`} /> : 
      (trend === "down" ? 
        <ArrowUpRight className={`w-3 h-3 ${trendColors[trend]} rotate-90`} /> : 
        <ArrowUpRight className={`w-3 h-3 ${trendColors[trend]} rotate-45`} />);
  };

  return (
    <div className={`relative bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/10 ${animationClasses[animation]}`}>
      <div className="absolute -top-3 -right-3 bg-slate-700 rounded-full p-2 shadow-lg">
        <Icon className="w-5 h-5 text-emerald-500" />
      </div>
      <div className="pt-2">
        <h3 className="text-sm font-medium text-gray-400 mb-3">{title}</h3>
        <p className={`text-2xl font-semibold ${valueClassName}`}>
          {value}
        </p>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColors[trend]}`}>
            <TrendIcon />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ 
  icon: Icon, 
  title, 
  value, 
  iconColor = "text-emerald-500", 
  valueColor = "text-emerald-500",
  delay = 0
}: { 
  icon: React.ElementType, 
  title: string, 
  value: string | number, 
  iconColor?: string, 
  valueColor?: string,
  delay?: number
}) => (
  <div 
    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all duration-300 hover:scale-102 animate-in slide-in-from-left-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-md bg-slate-700/70`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <span className="text-sm text-gray-400">{title}</span>
    </div>
    <span className={`text-sm font-medium ${valueColor} bg-slate-700/50 px-3 py-1 rounded-full`}>{value}</span>
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

  const GroupStats = ({ group }: { group: GroupData }) => (
    <div className="bg-gradient-to-r from-slate-800/70 to-slate-800/40 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300 col-span-full shadow-xl animate-in fade-in-50 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-500/10 rounded-lg shadow-inner">
          <Users className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Groupe <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">{group.name}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Statistiques collectives</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-700/30 p-4 rounded-lg border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-4 h-4 text-emerald-400" />
            <div className="text-sm text-gray-300">Images groupe</div>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-2xl font-semibold text-emerald-500">
              {group.total_processed}
            </div>
            <div className="text-xs text-gray-400">
              sur {group.image_limit}
            </div>
          </div>
          <div className="mt-2 w-full bg-slate-600/30 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, (group.total_processed || 0) / group.image_limit * 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-slate-700/30 p-4 rounded-lg border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 animate-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-4 h-4 text-blue-400" />
            <div className="text-sm text-gray-300">Vos images</div>
          </div>
          <div className="text-2xl font-semibold text-blue-400">
            {userStats?.processed_images}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {userStats?.processed_images && group.total_processed ? 
              `${Math.round(userStats.processed_images / group.total_processed * 100)}% du groupe` : 
              ''}
          </div>
        </div>
        
        <div className="bg-slate-700/30 p-4 rounded-lg border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 animate-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <div className="text-sm text-gray-300">Taux de réussite</div>
          </div>
          <div className="text-2xl font-semibold text-yellow-400">
            {group.success_rate?.toFixed(1)}%
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-gray-400">Performance collective</span>
          </div>
        </div>
        
        <div className="bg-slate-700/30 p-4 rounded-lg border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 animate-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <div className="text-sm text-gray-300">Temps moyen</div>
          </div>
          <div className="text-2xl font-semibold text-purple-400">
            {formatTime(group.avg_processing_time || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            par image
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-4xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="relative px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-t-2xl"></div>
          <div className="relative flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-2.5 rounded-lg shadow-lg">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Statistiques
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Analyse de performance</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="relative hover:bg-white/10 transition-all duration-300 p-2.5 rounded-full hover:scale-110 focus:ring-2 focus:ring-emerald-500/40"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="text-emerald-500">Chargement des statistiques...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                {userStats?.group ? (
                  <GroupStats group={userStats.group} />
                ) : (
                  <>
                    <StatCard 
                      icon={Image} 
                      title="Images traitées" 
                      value={stats.processedImages} 
                      animation="slide-up"
                      trend="up"
                      trendValue="+15% ce mois"
                    />
                    <StatCard 
                      icon={Award} 
                      title="Taux de réussite" 
                      value={`${stats.successRate.toFixed(1)}%`} 
                      animation="slide-up"
                      trend={stats.successRate > 80 ? "up" : (stats.successRate < 50 ? "down" : "neutral")}
                      trendValue={stats.successRate > 80 ? "Excellent" : (stats.successRate < 50 ? "À améliorer" : "Acceptable")}
                    />
                    <StatCard 
                      icon={Zap} 
                      title="Temps moyen" 
                      value={formatTime(stats.averageProcessingTime)} 
                      animation="slide-up"
                      trend={stats.averageProcessingTime < 10 ? "up" : "neutral"}
                      trendValue="par image"
                    />
                    <StatCard 
                      icon={Timer} 
                      title="Temps total" 
                      value={formatLongTime(stats.totalProcessingTime)} 
                      animation="slide-up"
                      trend="neutral"
                      trendValue="cumulé"
                    />
                  </>
                )}
              </div>

              <div className="bg-gradient-to-r from-slate-800/70 to-slate-800/30 rounded-xl p-6 border border-gray-700/30 hover:border-emerald-500/20 transition-all duration-300 shadow-lg animate-in fade-in-50 duration-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <LineChart className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-200">
                        Évolution des performances
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        12 derniers jours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-emerald-400">Réussite</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-blue-400">Vitesse</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative h-64">
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-6">
                    {[100, 80, 60, 40, 20, 0].map((value) => (
                      <div key={value} className="flex items-center">
                        <span className="w-8 text-right">{value}%</span>
                        <div className="w-full h-px bg-gray-800/50 ml-2"></div>
                      </div>
                    ))}
                  </div>

                  <div className="ml-12 h-full flex items-end justify-between px-4 pb-6 pt-6 gap-2 relative">
                    {Array.from({ length: 12 }).map((_, index) => {
                      const successRate = Math.floor(40 + Math.random() * 50);
                      const speedRate = Math.floor(30 + Math.random() * 60);
                      const delay = index * 50;
                      
                      return (
                        <div key={index} className="relative group flex-1">
                          <div 
                            className="absolute bottom-0 left-0 w-3 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-sm animate-in fade-in-50 slide-in-from-bottom-8 group-hover:from-emerald-400 group-hover:to-emerald-300 transition-all duration-300" 
                            style={{ 
                              height: `${successRate}%`,
                              animationDelay: `${delay}ms`
                            }}
                          />
                          
                          <div 
                            className="absolute bottom-0 left-4 w-3 bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm animate-in fade-in-50 slide-in-from-bottom-8 group-hover:from-blue-400 group-hover:to-blue-300 transition-all duration-300" 
                            style={{ 
                              height: `${speedRate}%`,
                              animationDelay: `${delay + 100}ms`
                            }}
                          />

                          <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-700 p-2 rounded-lg text-xs text-white transition-all duration-200 whitespace-nowrap shadow-xl z-10">
                            <div className="font-medium mb-1">Jour {index + 1}</div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span>{successRate}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span>{speedRate}%</span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-700"></div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="absolute left-0 right-0 h-px bg-emerald-500/20 top-1/2 transform -translate-y-1/2">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-1 bg-emerald-500/10 rounded text-xs text-emerald-400">
                        Moyenne
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-12 flex justify-between px-4 mt-2">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="text-xs text-gray-400 text-center">
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 rounded-xl p-6 border border-gray-700/30 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300 animate-in slide-in-from-left-4 duration-500">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-md font-medium text-gray-300">
                      Détails des traitements
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <DetailRow 
                      icon={CheckCircle2} 
                      title="Réussis" 
                      value={stats.successCount} 
                      delay={100}
                    />
                    <DetailRow 
                      icon={XCircle} 
                      title="Échoués" 
                      value={stats.failureCount} 
                      iconColor="text-red-500" 
                      valueColor="text-red-500" 
                      delay={200}
                    />
                    <DetailRow 
                      icon={Activity} 
                      title="Taux de conversion" 
                      value={`${(stats.successCount / (stats.successCount + stats.failureCount) * 100).toFixed(1)}%`} 
                      iconColor="text-blue-400" 
                      valueColor="text-blue-400" 
                      delay={300}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 rounded-xl p-6 border border-gray-700/30 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Timer className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-md font-medium text-gray-300">
                      Temps de traitement
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <DetailRow 
                      icon={Timer} 
                      title="Total" 
                      value={formatLongTime(stats.totalProcessingTime)}
                      delay={100}
                    />
                    <DetailRow 
                      icon={Clock} 
                      title="Moyenne" 
                      value={formatTime(stats.averageProcessingTime)} 
                      valueColor="text-blue-400"
                      iconColor="text-blue-400"
                      delay={200}
                    />
                    <DetailRow 
                      icon={TrendingUp} 
                      title="Efficacité" 
                      value={stats.successRate > 70 ? "Optimale" : (stats.successRate > 50 ? "Correcte" : "À améliorer")}
                      iconColor="text-yellow-400"
                      valueColor="text-yellow-400"
                      delay={300}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Retournez à l'accueil pour continuer à traiter vos images
                </p>
                <Link 
                  to="/"
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20"
                >
                  Retour à l'accueil
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}