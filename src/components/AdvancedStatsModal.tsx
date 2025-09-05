import React, { useEffect, useState } from 'react';
import { 
  X, Activity, Users, TrendingUp, Clock, Target, Award,
  Maximize2, Wand2, Scissors, Sparkles, BarChart3, 
  Calendar, Zap, Gauge, RefreshCw, Download, Share2,
  Layers, User, Group, PieChart, Database
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

interface UserDetailedStats {
  // Compteurs par opération
  bg_removal_count: number;
  resize_count: number;
  head_crop_count: number;
  
  // Temps par opération (en ms)
  bg_removal_time: number;
  resize_time: number;
  head_crop_time: number;
  
  // Statistiques générales
  total_operations: number;
  success_count: number;
  failure_count: number;
  success_rate: number;
  total_time: number;
  average_time: number;
  
  // Quota
  image_limit: number;
  remaining: number;
  
  // Groupe
  group?: {
    id: string;
    name: string;
    limit: number;
    members_count: number;
    total_usage: number;
    personal_contribution: number;
  };
}

interface AdvancedStatsModalProps {
  onClose: () => void;
  stats: any;
}

const MetricCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = 'emerald',
  trend,
  percentage,
  glow = false
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  color?: string;
  trend?: { value: number; type: 'up' | 'down' };
  percentage?: number;
  glow?: boolean;
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    pink: 'bg-pink-500/10 text-pink-500 border-pink-500/20'
  };

  const glowClasses = {
    emerald: 'shadow-emerald-500/20',
    blue: 'shadow-blue-500/20',
    purple: 'shadow-purple-500/20',
    amber: 'shadow-amber-500/20',
    red: 'shadow-red-500/20',
    cyan: 'shadow-cyan-500/20',
    pink: 'shadow-pink-500/20'
  };

  return (
    <div className={`bg-slate-800/40 border border-gray-700/50 rounded-xl p-6 hover:bg-slate-800/60 transition-all duration-200 group ${glow ? `shadow-xl ${glowClasses[color as keyof typeof glowClasses]}` : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            trend.type === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend.type === 'down' ? 'rotate-180' : ''}`} />
            {trend.value}%
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      
      {percentage !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Progression</span>
            <span className="text-xs text-gray-300">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 bg-gradient-to-r ${
                percentage > 80 ? 'from-red-500 to-red-400' :
                percentage > 60 ? 'from-amber-500 to-amber-400' :
                'from-emerald-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const OperationChart = ({ stats }: { stats: UserDetailedStats | null }) => {
  if (!stats) return null;

  const operations = [
    { 
      key: 'bg_removal', 
      label: 'Suppression fond', 
      count: stats.bg_removal_count, 
      time: stats.bg_removal_time,
      icon: Wand2, 
      color: 'purple' 
    },
    { 
      key: 'resize', 
      label: 'Redimensionnement', 
      count: stats.resize_count, 
      time: stats.resize_time,
      icon: Maximize2, 
      color: 'blue' 
    },
    { 
      key: 'head_crop', 
      label: 'Recadrage tête', 
      count: stats.head_crop_count, 
      time: stats.head_crop_time,
      icon: Scissors, 
      color: 'red' 
    }
  ];

  const total = operations.reduce((sum, op) => sum + op.count, 0);

  return (
    <div className="bg-slate-800/40 border border-gray-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-emerald-400" />
        Répartition de vos opérations
      </h3>
      
      <div className="space-y-3">
        {operations.filter(op => op.count > 0).map(operation => {
          const percentage = total > 0 ? (operation.count / total) * 100 : 0;
          const avgTime = operation.count > 0 ? operation.time / operation.count / 1000 : 0;
          
          return (
            <div key={operation.key} className="group">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-300 group-hover:scale-[1.02]">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2.5 rounded-lg ${
                    operation.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                    operation.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    operation.color === 'red' ? 'bg-red-500/20 text-red-400' :
                    operation.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                    operation.color === 'pink' ? 'bg-pink-500/20 text-pink-400' :
                    'bg-amber-500/20 text-amber-400'
                  } group-hover:scale-110 transition-transform`}>
                    <operation.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{operation.label}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-300 font-semibold">{operation.count}</span>
                        <span className="text-gray-500">{percentage.toFixed(1)}%</span>
                        {avgTime > 0 && (
                          <span className="text-xs text-gray-500 bg-slate-600/50 px-2 py-1 rounded-full">
                            ~{avgTime.toFixed(1)}s
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-slate-600/50 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-1000 bg-gradient-to-r ${
                            operation.color === 'purple' ? 'from-purple-500 to-purple-400' :
                            operation.color === 'blue' ? 'from-blue-500 to-blue-400' :
                            operation.color === 'red' ? 'from-red-500 to-red-400' :
                            operation.color === 'cyan' ? 'from-cyan-500 to-cyan-400' :
                            operation.color === 'pink' ? 'from-pink-500 to-pink-400' :
                            'from-amber-500 to-amber-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {total === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune opération enregistrée</p>
            <p className="text-xs mt-1">Commencez à traiter des images pour voir vos statistiques</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GroupSection = ({ stats }: { stats: UserDetailedStats | null }) => {
  if (!stats?.group) return null;

  const usagePercentage = (stats.group.total_usage / stats.group.limit) * 100;
  const contributionPercentage = stats.group.total_usage > 0 
    ? (stats.group.personal_contribution / stats.group.total_usage) * 100 
    : 0;

  return (
    <div className="bg-slate-800/40 border border-gray-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Group className="w-5 h-5 text-blue-400" />
        Groupe "{stats.group.name}"
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500/10 rounded-lg p-4 text-center border border-blue-500/20">
          <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.group.members_count}</p>
          <p className="text-xs text-gray-400">Membres</p>
        </div>
        
        <div className="bg-emerald-500/10 rounded-lg p-4 text-center border border-emerald-500/20">
          <Database className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.group.limit.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Quota partagé</p>
        </div>
        
        <div className="bg-purple-500/10 rounded-lg p-4 text-center border border-purple-500/20">
          <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.group.total_usage.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Utilisé par le groupe</p>
        </div>
        
        <div className="bg-amber-500/10 rounded-lg p-4 text-center border border-amber-500/20">
          <User className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.group.personal_contribution}</p>
          <p className="text-xs text-gray-400">Votre contribution</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Utilisation du quota groupe</span>
            <span className="text-sm font-medium text-white">
              {stats.group.total_usage.toLocaleString()} / {stats.group.limit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r ${
                usagePercentage > 80 ? 'from-red-500 to-red-400' :
                usagePercentage > 60 ? 'from-amber-500 to-amber-400' :
                'from-emerald-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">{usagePercentage.toFixed(1)}% utilisé</span>
            <span className="text-xs text-gray-500">
              {(stats.group.limit - stats.group.total_usage).toLocaleString()} restants
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Votre part dans le groupe</span>
            <span className="text-sm font-medium text-amber-400">
              {contributionPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 rounded-full transition-all duration-1000 bg-gradient-to-r from-amber-500 to-amber-400"
              style={{ width: `${Math.min(100, contributionPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-xs text-blue-300">
          <span className="font-semibold">Info:</span> Tous les membres partagent le quota de {stats.group.limit.toLocaleString()} images. 
          Chaque traitement d'un membre est décompté du quota commun.
        </p>
      </div>
    </div>
  );
};

export function AdvancedStatsModal({ onClose, stats: initialStats }: AdvancedStatsModalProps) {
  const [stats, setStats] = useState<UserDetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Récupérer la limite par défaut depuis admin_settings
      const { data: adminSettings } = await supabase
        .from('admin_settings')
        .select('free_user_max_images')
        .single();
      
      const defaultUserLimit = adminSettings?.free_user_max_images || 10;

      // Loading user statistics

      // Charger seulement les infos disponibles depuis user_stats
      let profile = null;
      let profileError = null;
      
      // Essayer user_profiles d'abord (si existe)
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_id, email, user_level')
          .eq('user_id', user.id)
          .single();
        profile = data;
        profileError = error;
      } catch {
        // Si user_profiles n'existe pas, utiliser des valeurs par défaut
      }

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      // Charger les vraies statistiques depuis processing_logs
      const { data: logs, error: logsError } = await supabase
        .from('processing_logs')
        .select('operation_type, operations_count, processing_time_ms, success, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (logsError) {
        console.error('Logs error:', logsError);
      }

      // Processing logs loaded

      let userStats = {
        bg_removal_count: 0,
        resize_count: 0,
        head_crop_count: 0,
        bg_removal_time: 0,
        resize_time: 0,
        head_crop_time: 0,
        total_operations: 0,
        success_count: 0,
        failure_count: 0,
        total_time: 0,
        image_limit: defaultUserLimit, // Sera remplacé par la vraie limite (groupe ou utilisateur)
        remaining: 0,
        success_rate: 100,
        average_time: 0
      };

      if (logs && logs.length > 0) {
        logs.forEach(log => {
          const count = log.operations_count || 1;
          const time = log.processing_time_ms || 0;
          
          // Seuls les traitements réussis comptent dans les opérations totales
          if (log.success) {
            userStats.total_operations += count;
            userStats.success_count += count;
          } else {
            userStats.failure_count += count;
          }
          
          userStats.total_time += time;
          
          // Compter par type d'opération uniquement si succès
          if (log.success) {
            switch(log.operation_type) {
              case 'resize':
                userStats.resize_count += count;
                userStats.resize_time += time;
                break;
              case 'bg_removal':
                userStats.bg_removal_count += count;
                userStats.bg_removal_time += time;
                break;
              case 'head_crop':
                userStats.head_crop_count += count;
                userStats.head_crop_time += time;
                break;
            }
          }
        });
      }

      const totalAttempts = userStats.success_count + userStats.failure_count;
      userStats.success_rate = totalAttempts > 0 
        ? Math.round((userStats.success_count / totalAttempts) * 100) 
        : 100;
      
      userStats.average_time = userStats.total_operations > 0 
        ? userStats.total_time / userStats.total_operations 
        : 0;

      // User statistics calculated

      // Charger le profil utilisateur pour avoir sa limite personnelle
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('image_limit')
        .eq('user_id', user.id)
        .single();

      const userLimit = userProfile?.image_limit || defaultUserLimit; // Limite depuis admin_settings

      // Charger les infos du groupe si l'utilisateur en fait partie
      const { data: groupMember } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            name,
            image_limit,
            current_month_operations
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (groupMember?.groups) {
        const groupId = groupMember.groups.id;
        
        // Récupérer tous les membres du groupe
        const { data: members } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', groupId);

        const memberIds = members?.map(m => m.user_id) || [];
        
        // Utiliser current_month_operations du groupe au lieu de recalculer
        const totalGroupUsage = groupMember.groups.current_month_operations || 0;

        // Si dans un groupe, la limite effective est celle du groupe
        userStats.image_limit = groupMember.groups.image_limit;
        userStats.remaining = Math.max(0, groupMember.groups.image_limit - totalGroupUsage);
        
        (userStats as any).group = {
          id: groupMember.groups.id,
          name: groupMember.groups.name,
          limit: groupMember.groups.image_limit,
          members_count: memberIds.length,
          total_usage: totalGroupUsage,
          personal_contribution: userStats.total_operations
        };

        // Group statistics loaded
      } else {
        // Pas de groupe, utiliser la limite personnelle
        userStats.image_limit = userLimit;
        userStats.remaining = Math.max(0, userLimit - userStats.total_operations);
      }

      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportStats = () => {
    const exportData = {
      user_stats: stats,
      exported_at: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `miremover-stats-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement de vos statistiques...</p>
        </div>
      </div>
    );
  }

  const totalTime = stats ? stats.total_time / 1000 : 0; // Convertir en secondes
  const avgTime = stats ? stats.average_time / 1000 : 0; // Convertir en secondes
  // Pour un groupe, utiliser l'usage du groupe, sinon l'usage personnel
  const currentUsage = stats?.group ? stats.group.total_usage : (stats?.total_operations || 0);
  const usagePercentage = stats ? (currentUsage / stats.image_limit) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-7xl h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800/50 bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl p-3 shadow-lg">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
                <p className="text-emerald-400/90 text-sm">Statistiques détaillées en temps réel</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={exportStats}
                className="bg-slate-800/70 text-gray-200 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600/50 flex items-center gap-2 hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              
              <button
                onClick={loadUserStats}
                disabled={loading}
                className="bg-slate-800/70 text-gray-200 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600/50 flex items-center gap-2 hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Target}
              title="Total des opérations"
              value={currentUsage}
              subtitle={stats?.group ? "usage du groupe" : "usage personnel"}
              color="emerald"
              percentage={usagePercentage}
              glow={true}
            />
            
            <MetricCard
              icon={Clock}
              title="Temps total"
              value={totalTime > 60 ? `${(totalTime / 60).toFixed(1)}min` : `${totalTime.toFixed(1)}s`}
              subtitle="temps cumulé"
              color="blue"
            />
            
            <MetricCard
              icon={Zap}
              title="Temps moyen"
              value={`${avgTime.toFixed(1)}s`}
              subtitle="par opération"
              color="purple"
            />
            
            <MetricCard
              icon={Award}
              title="Taux de succès"
              value={`${stats?.success_rate || 100}%`}
              subtitle={`${stats?.success_count || 0} réussies / ${stats?.failure_count || 0} échecs`}
              color="amber"
              percentage={stats?.success_rate || 100}
            />
          </div>

          {/* Quota et utilisation */}
          <div className="bg-slate-800/40 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-cyan-400" />
              Quota et utilisation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-cyan-400 mb-2">{stats?.image_limit.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-400">Quota total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400 mb-2">{currentUsage || 0}</p>
                <p className="text-sm text-gray-400">Utilisé {stats?.group ? '(groupe)' : '(personnel)'}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400 mb-2">{stats?.remaining || 0}</p>
                <p className="text-sm text-gray-400">Restant</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Utilisation</span>
                <span className="text-sm font-medium text-white">
                  {usagePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r ${
                    usagePercentage > 80 ? 'from-red-500 to-red-400' :
                    usagePercentage > 60 ? 'from-amber-500 to-amber-400' :
                    'from-emerald-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, usagePercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Graphiques et détails */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OperationChart stats={stats} />
            
            {/* Statistiques de performance */}
            <div className="bg-slate-800/40 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Performance
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-gray-300">Opérations réussies</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-400">{stats?.success_count || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                    </div>
                    <span className="text-gray-300">Opérations échouées</span>
                  </div>
                  <span className="text-xl font-bold text-red-400">{stats?.failure_count || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-gray-300">Temps le plus rapide</span>
                  </div>
                  <span className="text-xl font-bold text-blue-400">~2s</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Efficacité</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-6 rounded-full ${
                            i < Math.round((stats?.success_rate || 0) / 20)
                              ? 'bg-gradient-to-t from-purple-500 to-purple-400'
                              : 'bg-slate-600/50'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">{stats?.success_rate || 100}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques de groupe */}
          <GroupSection stats={stats} />
        </div>
      </div>
    </div>
  );
}