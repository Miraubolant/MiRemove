import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Shield, Activity, BarChart3, Users,
  Maximize2, Wand2, Scissors, Sparkles,
  Search, User, Settings, Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { diagnosticService } from '../../services/diagnosticService';
import { GroupManagement } from './GroupManagement';
import { UserManagement } from './UserManagement';
import { AdminSettings } from './AdminSettings';
import { MonthlyUsageManager } from './MonthlyUsageManager';

// Types
interface AdminSettingsModalProps {
  onClose: () => void;
}

interface Group {
  id: string;
  name: string;
  image_limit: number;
  member_count?: number;
  total_processed?: number;
  created_at: string;
  stats?: {
    resize?: { count: number; time: number };
    ai?: { count: number; time: number };
    crop_head?: { count: number; time: number };
    all?: { count: number; time: number };
  };
}

interface GlobalStats {
  totalMembers: number;
  totalImages: number;
  totalLimit: number;
  operations: {
    resize: { count: number; time: number };
    ai: { count: number; time: number };
    cropHead: { count: number; time: number };
    both: { count: number; time: number };
    cropHeadResize: { count: number; time: number };
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
  resize_count: number;
  ai_count: number;
  crop_head_count: number;
  both_count: number;
  crop_head_resize_count: number;
  all_processing_count: number;
  resize_processing_time: number;
  ai_processing_time: number;
  crop_head_processing_time: number;
  both_time: number;
  crop_head_resize_time: number;
  all_processing_time: number;
}

// Helper Components and Functions
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
};

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  count: number;
  time: number;
  color?: string;
  bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  title, 
  count, 
  time, 
  color = "text-emerald-500",
  bgColor = "bg-emerald-500/10"
}) => {
  const avgTime = count > 0 ? time / count : 0;
  const efficiency = count > 0 && avgTime > 0 ? Math.min(100, Math.max(0, 100 - (avgTime / 10000))) : 0;
  
  return (
    <div className="group bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/60 p-6 transition-all duration-300 hover:border-slate-600/80 hover:shadow-lg hover:shadow-black/20 transform hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${bgColor} p-3 rounded-xl border border-gray-600/30 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform duration-300`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{title}</p>
            <p className="text-xs text-gray-500">Opération de traitement</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-1">{count.toLocaleString()}</p>
            <p className="text-xs text-gray-400">images traitées</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-1">{formatTime(avgTime / 1000)}</p>
            <p className="text-xs text-gray-400">temps moyen</p>
          </div>
        </div>
        
        {count > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Efficacité</span>
              <span className={`text-xs font-bold ${
                efficiency > 80 ? color.replace('text-', 'text-') :
                efficiency > 60 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {efficiency.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-1000 ${
                  efficiency > 80 ? `bg-gradient-to-r ${bgColor.replace('bg-', 'from-').replace('/10', '-500')} to-${color.replace('text-', '').replace('-500', '-400')}` :
                  efficiency > 60 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${efficiency}%` }}
              />
            </div>
          </div>
        )}
        
        {count === 0 && (
          <div className="text-center py-2">
            <p className="text-xs text-gray-500 italic">Aucune opération enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  iconColor?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  iconColor = "text-emerald-500" 
}) => (
  <div className="group bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/60 p-6 transition-all duration-300 hover:border-slate-600/80 hover:shadow-lg hover:shadow-black/20 transform hover:scale-[1.02]">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2.5 rounded-xl border border-gray-600/30 group-hover:scale-110 transition-all duration-300 shadow-md ${
        iconColor.includes('emerald') ? 'bg-emerald-500/10' :
        iconColor.includes('blue') ? 'bg-blue-500/10' :
        iconColor.includes('purple') ? 'bg-purple-500/10' :
        iconColor.includes('amber') ? 'bg-amber-500/10' :
        iconColor.includes('red') ? 'bg-red-500/10' :
        'bg-gray-500/10'
      }`}>
        <Icon className={`w-5 h-5 ${iconColor} group-hover:scale-110 transition-transform duration-300`} />
      </div>
      <div>
        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{title}</span>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
    <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300">{value}</p>
  </div>
);

// Main Component
export function AdminSettingsModal({ onClose }: AdminSettingsModalProps) {
  // State
  const [activeTab, setActiveTab] = useState<'stats' | 'groups' | 'users' | 'settings' | 'monthly'>('stats');
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Computed values - Statistiques globales basées sur les vraies données utilisateur (EXCLUT LES ADMINS)
  const globalStats = useMemo(() => {
    // Filtrer d'abord pour exclure les administrateurs des statistiques
    const nonAdminUsers = users.filter(user => !user.is_admin);
    
    return nonAdminUsers.reduce((acc, user) => {
      return {
        totalMembers: nonAdminUsers.length, // Seulement les non-admins
        totalImages: acc.totalImages + (user.processed_images || 0),
        totalLimit: acc.totalLimit + (user.image_limit || 0),
        operations: {
          resize: {
            count: acc.operations.resize.count + (user.resize_count || 0),
            time: acc.operations.resize.time + (user.resize_processing_time || 0)
          },
          ai: {
            count: acc.operations.ai.count + (user.ai_count || 0),
            time: acc.operations.ai.time + (user.ai_processing_time || 0)
          },
          cropHead: {
            count: acc.operations.cropHead.count + (user.crop_head_count || 0),
            time: acc.operations.cropHead.time + (user.crop_head_processing_time || 0)
          },
          both: {
            count: acc.operations.both.count + (user.both_count || 0),
            time: acc.operations.both.time + (user.both_time || 0)
          },
          cropHeadResize: {
            count: acc.operations.cropHeadResize.count + (user.crop_head_resize_count || 0),
            time: acc.operations.cropHeadResize.time + (user.crop_head_resize_time || 0)
          },
          all: {
            count: acc.operations.all.count + (user.all_processing_count || 0),
            time: acc.operations.all.time + (user.all_processing_time || 0)
          }
        }
      };
    }, {
      totalMembers: nonAdminUsers.length, // Utiliser la longueur des non-admins
      totalImages: 0,
      totalLimit: 0,
      operations: {
        resize: { count: 0, time: 0 },
        ai: { count: 0, time: 0 },
        cropHead: { count: 0, time: 0 },
        both: { count: 0, time: 0 },
        cropHeadResize: { count: 0, time: 0 },
        all: { count: 0, time: 0 }
      }
    } as GlobalStats);
  }, [users]);

  const filteredUsers = useMemo(() => 
    searchTerm
      ? users.filter(user => 
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : users,
    [users, searchTerm]
  );

  // Effects
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadGroups(), loadUsers()]);
    };
    loadData();
  }, []);

  // Fonction pour actualiser toutes les données
  const refreshAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadGroups(), loadUsers()]);
    } finally {
      setLoading(false);
    }
  };

  // Data fetching
  const loadGroups = async () => {
    try {
      setLoading(true);
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (groupsError) throw groupsError;

      const groupsWithStats = await Promise.all((groupsData || []).map(async (group) => {
        try {
          // Récupérer les membres du groupe
          const { data: members, error: membersError } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', group.id);

          if (membersError) {
            console.warn(`Error getting members for group ${group.id}:`, membersError);
            return {
              ...group,
              member_count: 0,
              total_processed: 0,
              stats: { 
                resize: { count: 0, time: 0 }, 
                ai: { count: 0, time: 0 }, 
                crop_head: { count: 0, time: 0 }, 
                both: { count: 0, time: 0 }, 
                'crop-head-resize': { count: 0, time: 0 }, 
                all: { count: 0, time: 0 } 
              }
            };
          }

          const memberIds = members?.map(m => m.user_id) || [];
          
          let totalProcessed = 0;
          let stats = {
            resize: { count: 0, time: 0 },
            ai: { count: 0, time: 0 },
            crop_head: { count: 0, time: 0 },
            both: { count: 0, time: 0 },
            'crop-head-resize': { count: 0, time: 0 },
            all: { count: 0, time: 0 }
          };

          if (memberIds.length > 0) {
            // Récupérer les logs de traitement pour tous les membres du groupe
            const { data: logs, error: logsError } = await supabase
              .from('processing_logs')
              .select('operation_type, operations_count, processing_time_ms, success')
              .in('user_id', memberIds);

            if (!logsError && logs) {
              // Calculer les statistiques réelles
              logs.forEach(log => {
                if (log.success) {
                  const count = log.operations_count || 1;
                  totalProcessed += count;
                  
                  const type = log.operation_type;
                  const time = log.processing_time_ms || 0;
                  
                  // Mapper les types d'opération
                  switch(type) {
                    case 'resize':
                      stats.resize.count += count;
                      stats.resize.time += time;
                      break;
                    case 'bg_removal':
                      stats.ai.count += count;
                      stats.ai.time += time;
                      break;
                    case 'head_crop':
                      stats.crop_head.count += count;
                      stats.crop_head.time += time;
                      break;
                    case 'both':
                      stats.both.count += count;
                      stats.both.time += time;
                      break;
                    case 'crop-head-resize':
                      stats['crop-head-resize'].count += count;
                      stats['crop-head-resize'].time += time;
                      break;
                    case 'all':
                      stats.all.count += count;
                      stats.all.time += time;
                      break;
                  }
                }
              });
            }
          }
          
          return {
            ...group,
            member_count: memberIds.length,
            total_processed: totalProcessed,
            stats
          };
        } catch (err) {
          console.warn(`Error processing group ${group.id}:`, err);
          return {
            ...group,
            member_count: 0,
            total_processed: 0,
            stats: { 
              resize: { count: 0, time: 0 }, 
              ai: { count: 0, time: 0 }, 
              crop_head: { count: 0, time: 0 }, 
              both: { count: 0, time: 0 }, 
              'crop-head-resize': { count: 0, time: 0 }, 
              all: { count: 0, time: 0 } 
            }
          };
        }
      }));

      setGroups(groupsWithStats);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Charger les profils utilisateur et leurs statistiques
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, email, user_level, image_limit, created_at');

      if (profilesError) throw profilesError;

      // Charger les statistiques utilisateur
      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select('*');

      if (statsError) throw statsError;

      // Pour chaque utilisateur, récupérer les vraies stats depuis processing_logs
      const processedUsers = await Promise.all((userProfiles || []).map(async (profile) => {
        const stats = (userStats || []).find(stat => stat.user_id === profile.user_id) || {};
        
        // Récupérer les logs de traitement pour cet utilisateur
        const { data: logs, error: logsError } = await supabase
          .from('processing_logs')
          .select('operation_type, operations_count, processing_time_ms, success')
          .eq('user_id', profile.user_id);

        let userOperations = {
          resize_count: 0,
          ai_count: 0,
          crop_head_count: 0,
          both_count: 0,
          crop_head_resize_count: 0,
          all_processing_count: 0,
          resize_processing_time: 0,
          ai_processing_time: 0,
          crop_head_processing_time: 0,
          both_time: 0,
          crop_head_resize_time: 0,
          all_processing_time: 0,
          total_operations: 0,
          total_processing_time: 0,
          success_count: 0,
          failure_count: 0
        };

        if (!logsError && logs) {
          logs.forEach(log => {
            const count = log.operations_count || 1;
            const time = log.processing_time_ms || 0;
            
            userOperations.total_operations += count;
            userOperations.total_processing_time += time;
            
            if (log.success) {
              userOperations.success_count += count;
            } else {
              userOperations.failure_count += count;
            }
            
            // Mapper les types d'opération
            switch(log.operation_type) {
              case 'resize':
                userOperations.resize_count += count;
                userOperations.resize_processing_time += time;
                break;
              case 'bg_removal':
                userOperations.ai_count += count;
                userOperations.ai_processing_time += time;
                break;
              case 'head_crop':
                userOperations.crop_head_count += count;
                userOperations.crop_head_processing_time += time;
                break;
              case 'both':
                userOperations.both_count += count;
                userOperations.both_time += time;
                break;
              case 'crop-head-resize':
                userOperations.crop_head_resize_count += count;
                userOperations.crop_head_resize_time += time;
                break;
              case 'all':
                userOperations.all_processing_count += count;
                userOperations.all_processing_time += time;
                break;
            }
          });
        }
        
        return {
          id: profile.user_id,
          user_id: profile.user_id,
          email: profile.email || 'Email non disponible',
          user_level: profile.user_level || 'free',
          image_limit: profile.image_limit || 100,
          processed_images: userOperations.total_operations,
          success_count: userOperations.success_count,
          failure_count: userOperations.failure_count,
          total_processing_time: userOperations.total_processing_time,
          is_admin: profile.user_level === 'admin',
          resize_count: userOperations.resize_count,
          ai_count: userOperations.ai_count,
          crop_head_count: userOperations.crop_head_count,
          both_count: userOperations.both_count,
          crop_head_resize_count: userOperations.crop_head_resize_count,
          all_processing_count: userOperations.all_processing_count,
          resize_processing_time: userOperations.resize_processing_time,
          ai_processing_time: userOperations.ai_processing_time,
          crop_head_processing_time: userOperations.crop_head_processing_time,
          both_time: userOperations.both_time,
          crop_head_resize_time: userOperations.crop_head_resize_time,
          all_processing_time: userOperations.all_processing_time,
          created_at: profile.created_at
        };
      }));

      setUsers(processedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Erreur lors du chargement des utilisateurs');
    }
  };

  // Event handlers
  const handleCreateGroup = async (name: string, limit: number) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name,
          image_limit: limit
        }])
        .select()
        .single();

      if (error) throw error;

      await loadGroups();
      showSuccessMessage(`Groupe "${name}" créé avec succès`);
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Erreur lors de la création du groupe');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) return;

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      setGroups(prev => prev.filter(g => g.id !== groupId));
      showSuccessMessage('Groupe supprimé avec succès');
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Erreur lors de la suppression du groupe');
    }
  };

  const handleUpdateGroupLimit = async (groupId: string, newLimit: number) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('groups')
        .update({ image_limit: newLimit })
        .eq('id', groupId);

      if (error) throw error;

      // Mettre à jour l'état local
      setGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, image_limit: newLimit } : g
      ));
      
      showSuccessMessage(`Limite du groupe mise à jour à ${newLimit} images`);
    } catch (err) {
      console.error('Error updating group limit:', err);
      setError('Erreur lors de la mise à jour de la limite');
    }
  };

  const handleAddMember = async (groupId: string, userId: string) => {
    try {
      setError(null);
      
      // Diagnostic préliminaire
      
      
      // Test préliminaire avec dry-run
      const testResult = await diagnosticService.testGroupMemberAddition(groupId, userId, true);
      
      if (testResult) {
        
        
        if (!testResult.group_exists) {
          setError('Le groupe spécifié n\'existe pas');
          return;
        }
        
        if (!testResult.user_exists) {
          setError('L\'utilisateur spécifié n\'existe pas');
          return;
        }
        
        if (testResult.member_already_exists) {
          setError('Cet utilisateur est déjà membre du groupe');
          return;
        }
      }
      
      // S'assurer que les stats utilisateur existent
      const statsResult = await diagnosticService.ensureUserStatsExist(userId);
      if (statsResult?.created) {
        
      }
      
      // Vérifier d'abord la structure de la table group_members
      const { data: tableInfo } = await supabase
        .from('group_members')
        .select('*')
        .limit(1);
      
      
      
      // Ajouter le membre au groupe (sans la colonne 'role' qui n'existe pas)
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: userId
        }]);
      
      if (error) {
        console.error('❌ Erreur lors de l\'insertion du membre:', error);
        
        // Gestion des erreurs spécifiques avec diagnostic
        if (error.code === '23505') { // Unique constraint violation
          setError('Cet utilisateur est déjà membre du groupe');
          return;
        } else if (error.code === '23503') { // Foreign key constraint violation
          setError('Utilisateur ou groupe introuvable');
          return;
        } else {
          // Lancer un diagnostic complet en cas d'erreur inattendue
          await diagnosticService.logDiagnosticReport();
          throw error;
        }
      }
      
      // RÉINITIALISATION DES DONNÉES DE TRAITEMENT UTILISATEUR
      // Quand un utilisateur rejoint un groupe, on repart à zéro
      try {
        console.log(`🔄 Réinitialisation des données de traitement pour l'utilisateur ${userId}...`);
        
        // 1. Supprimer tous les logs de traitement de l'utilisateur
        const { error: deleteLogsError } = await supabase
          .from('processing_logs')
          .delete()
          .eq('user_id', userId);
        
        if (deleteLogsError) {
          console.warn('⚠️ Erreur lors de la suppression des logs:', deleteLogsError);
        } else {
          console.log('✅ Logs de traitement supprimés');
        }
        
        // 2. Réinitialiser les compteurs dans user_stats (uniquement les colonnes qui existent)
        const { error: resetStatsError } = await supabase
          .from('user_stats')
          .update({
            total_operations: 0,
            bg_removal_count: 0,
            resize_count: 0,
            head_crop_count: 0
          })
          .eq('user_id', userId);
        
        if (resetStatsError) {
          console.warn('⚠️ Erreur lors de la réinitialisation des stats (normal si colonnes n\'existent pas):', resetStatsError);
        } else {
          console.log('✅ Statistiques utilisateur réinitialisées');
        }
        
        console.log('🎉 Réinitialisation terminée - L\'utilisateur repart avec un compteur à zéro dans le groupe');
        
      } catch (resetError) {
        console.warn('⚠️ Erreur lors de la réinitialisation des données:', resetError);
        // On continue malgré l'erreur de réinitialisation
      }
      
      // Vérifier que l'ajout a bien fonctionné et que les triggers se sont bien exécutés
      setTimeout(async () => {
        const userInfo = await diagnosticService.getUserDetailedInfo(userId);
        if (userInfo) {
          
          
          // Vérifier si la limite a été mise à jour
          if (testResult && userInfo.user_stats?.image_limit !== testResult.expected_new_limit) {
            console.warn('⚠️ La limite utilisateur n\'a pas été mise à jour automatiquement');
            console.warn('Limite actuelle:', userInfo.user_stats?.image_limit);
            console.warn('Limite attendue:', testResult.expected_new_limit);
          }
        }
      }, 1000);
      
      // Recharger les données pour afficher les changements
      await Promise.all([loadGroups(), loadUsers()]);
      
      showSuccessMessage('Membre ajouté avec succès au groupe. Données de traitement réinitialisées à zéro.');
      
      
    } catch (err) {
      console.error('❌ Erreur lors de l\'ajout du membre:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      
      // Messages d'erreur personnalisés selon le type d'erreur
      if (errorMessage.includes('trigger')) {
        setError('Erreur lors de la mise à jour automatique du quota utilisateur. Vérifiez que les triggers sont activés.');
        // Auto-diagnostic en cas d'erreur de trigger
        diagnosticService.logDiagnosticReport();
      } else if (errorMessage.includes('user_stats')) {
        setError('Erreur lors de la création des statistiques utilisateur. Les statistiques ont été créées automatiquement, réessayez.');
      } else if (errorMessage.includes('permission')) {
        setError('Permissions insuffisantes pour effectuer cette action.');
      } else if (errorMessage.includes('function') || errorMessage.includes('procedure')) {
        setError('Erreur de configuration de la base de données. Vérifiez que toutes les migrations ont été appliquées.');
        diagnosticService.logDiagnosticReport();
      } else {
        setError(`Erreur lors de l'ajout du membre: ${errorMessage}`);
      }
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      // RÉINITIALISATION DES DONNÉES LORS DU RETRAIT DU GROUPE
      // L'utilisateur repasse en quota personnel avec compteurs à zéro
      try {
        console.log(`🔄 Réinitialisation des données pour le retrait de l'utilisateur ${userId} du groupe...`);
        
        // 1. Supprimer tous les logs de traitement de l'utilisateur
        const { error: deleteLogsError } = await supabase
          .from('processing_logs')
          .delete()
          .eq('user_id', userId);
        
        if (deleteLogsError) {
          console.warn('⚠️ Erreur lors de la suppression des logs:', deleteLogsError);
        } else {
          console.log('✅ Logs de traitement supprimés');
        }
        
        // 2. Réinitialiser les compteurs dans user_stats (uniquement les colonnes qui existent)
        const { error: resetStatsError } = await supabase
          .from('user_stats')
          .update({
            total_operations: 0,
            bg_removal_count: 0,
            resize_count: 0,
            head_crop_count: 0
          })
          .eq('user_id', userId);
        
        if (resetStatsError) {
          console.warn('⚠️ Erreur lors de la réinitialisation des stats:', resetStatsError);
        } else {
          console.log('✅ Statistiques utilisateur réinitialisées');
        }
        
        console.log('🎉 Réinitialisation terminée - L\'utilisateur repasse en mode quota personnel à zéro');
        
      } catch (resetError) {
        console.warn('⚠️ Erreur lors de la réinitialisation:', resetError);
      }

      await loadGroups();
      showSuccessMessage('Membre retiré avec succès. Données réinitialisées pour le quota personnel.');
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Erreur lors du retrait du membre');
    }
  };

  // Helper function for showing temporary success messages
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-7xl h-[90vh] flex animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Sidebar Navigation */}
        <div className="flex-shrink-0 w-64 bg-slate-800/60 backdrop-blur-sm border-r border-gray-700/50 rounded-l-2xl">
          {/* Header du sidebar */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-emerald-500/20 via-emerald-500/30 to-emerald-400/20 p-3 rounded-xl border border-emerald-500/30 shadow-lg">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Administration</h2>
                <p className="text-xs text-emerald-400/80 mt-0.5">Panneau de contrôle</p>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="w-full group bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white px-3 py-2 rounded-xl transition-all duration-300 text-sm font-medium border border-slate-600/50 hover:border-red-500/40 flex items-center justify-center gap-2"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
              Fermer le panneau
            </button>
          </div>
          
          {/* Navigation Menu */}
          <nav className="p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Navigation
            </div>
            
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'stats' 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50 border border-transparent hover:border-slate-600/50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'bg-emerald-500/20 shadow-md'
                  : 'bg-slate-600/30 group-hover:bg-slate-600/50'
              }`}>
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Statistiques</div>
                <div className="text-xs opacity-75">Vue d'ensemble des données</div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('groups')}
              className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'groups' 
                  ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50 border border-transparent hover:border-slate-600/50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                activeTab === 'groups'
                  ? 'bg-blue-500/20 shadow-md'
                  : 'bg-slate-600/30 group-hover:bg-slate-600/50'
              }`}>
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Groupes</div>
                <div className="text-xs opacity-75">Gestion des groupes</div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'users' 
                  ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30 shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50 border border-transparent hover:border-slate-600/50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                activeTab === 'users'
                  ? 'bg-purple-500/20 shadow-md'
                  : 'bg-slate-600/30 group-hover:bg-slate-600/50'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Utilisateurs</div>
                <div className="text-xs opacity-75">Gestion des comptes</div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'settings' 
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/30 shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50 border border-transparent hover:border-slate-600/50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                activeTab === 'settings'
                  ? 'bg-amber-500/20 shadow-md'
                  : 'bg-slate-600/30 group-hover:bg-slate-600/50'
              }`}>
                <Settings className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Paramètres</div>
                <div className="text-xs opacity-75">Configuration système</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('monthly')}
              className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === 'monthly' 
                  ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50 border border-transparent hover:border-slate-600/50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                activeTab === 'monthly'
                  ? 'bg-indigo-500/20 shadow-md'
                  : 'bg-slate-600/30 group-hover:bg-slate-600/50'
              }`}>
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Usage Mensuel</div>
                <div className="text-xs opacity-75">Historiques et exports</div>
              </div>
            </button>
          </nav>
          
          {/* Sidebar Footer */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-gray-300">Statut système</span>
              </div>
              <div className="text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Utilisateurs:</span>
                  <span className="text-emerald-400 font-medium">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Groupes:</span>
                  <span className="text-blue-400 font-medium">{groups.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-700/50 bg-slate-800/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                  activeTab === 'stats' ? 'text-emerald-300' :
                  activeTab === 'groups' ? 'text-blue-300' :
                  activeTab === 'users' ? 'text-purple-300' :
                  activeTab === 'monthly' ? 'text-indigo-300' :
                  'text-amber-300'
                }`}>
                  {activeTab === 'stats' && 'Tableau de Bord'}
                  {activeTab === 'groups' && 'Gestion des Groupes'}
                  {activeTab === 'users' && 'Gestion des Utilisateurs'}
                  {activeTab === 'settings' && 'Paramètres Système'}
                  {activeTab === 'monthly' && 'Usage Mensuel'}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {activeTab === 'stats' && 'Vue d\'ensemble des performances et statistiques'}
                  {activeTab === 'groups' && 'Créer, modifier et gérer les groupes d\'utilisateurs'}
                  {activeTab === 'users' && 'Administration des comptes utilisateurs'}
                  {activeTab === 'settings' && 'Configuration générale du système'}
                  {activeTab === 'monthly' && 'Gestion des données d\'usage mensuel'}
                </p>
              </div>
              
              {/* Action rapide selon l'onglet actif */}
              {activeTab === 'stats' && (
                <button
                  onClick={refreshAllData}
                  disabled={loading}
                  className="group bg-slate-700/70 hover:bg-slate-600/70 text-gray-200 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm disabled:opacity-50 flex items-center gap-2 border border-slate-600/50 hover:border-emerald-500/40 shadow-lg hover:shadow-emerald-500/10 transform hover:scale-105"
                >
                  <div className="bg-emerald-500/20 p-1.5 rounded-lg group-hover:bg-emerald-500/30 transition-all duration-300">
                    <Activity className={`w-4 h-4 text-emerald-500 ${loading ? 'animate-spin' : ''}`} />
                  </div>
                  {loading ? 'Actualisation...' : 'Actualiser'}
                </button>
              )}
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30">
          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              {successMessage}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'stats' && (
            <section aria-labelledby="stats-heading" className="space-y-8">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-slate-800/40 via-slate-800/60 to-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-emerald-500/20 via-emerald-500/30 to-emerald-400/20 p-4 rounded-2xl border border-emerald-500/30 shadow-lg">
                    <BarChart3 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 id="stats-heading" className="text-2xl font-bold text-white">Tableau de Bord Administrateur</h3>
                    <p className="text-emerald-400/90 font-medium mt-1">Vue d'ensemble des performances globales</p>
                  </div>
                </div>
              </div>

              {/* Vue d'ensemble générale */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/60 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 transform hover:scale-105">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-500/20 p-3 rounded-xl">
                      <Activity className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">Total traité</p>
                      <p className="text-2xl font-bold text-white">{globalStats.totalImages.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Utilisateurs uniquement</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Quota total: {globalStats.totalLimit.toLocaleString()}</span>
                    <span className={`font-bold ${
                      globalStats.totalLimit > 0 && (globalStats.totalImages / globalStats.totalLimit) > 0.8
                        ? 'text-red-400'
                        : globalStats.totalLimit > 0 && (globalStats.totalImages / globalStats.totalLimit) > 0.6
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {globalStats.totalLimit > 0 ? `${((globalStats.totalImages / globalStats.totalLimit) * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        globalStats.totalLimit > 0 && (globalStats.totalImages / globalStats.totalLimit) > 0.8
                          ? 'bg-gradient-to-r from-red-500 to-red-400'
                          : globalStats.totalLimit > 0 && (globalStats.totalImages / globalStats.totalLimit) > 0.6
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      }`}
                      style={{ 
                        width: `${globalStats.totalLimit > 0 ? Math.min(100, (globalStats.totalImages / globalStats.totalLimit) * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/60 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 transform hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-3 rounded-xl">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">Utilisateurs actifs</p>
                      <p className="text-2xl font-bold text-white">{users.length}</p>
                      <p className="text-xs text-blue-400 mt-1">
                        {users.filter(u => u.processed_images > 0).length} avec activité
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/60 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 transform hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 p-3 rounded-xl">
                      <Shield className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">Administrateurs</p>
                      <p className="text-2xl font-bold text-white">{users.filter(u => u.is_admin).length}</p>
                      <p className="text-xs text-purple-400 mt-1">
                        {((users.filter(u => u.is_admin).length / Math.max(1, users.length)) * 100).toFixed(1)}% du total
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/60 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 transform hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/20 p-3 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">Taux de succès</p>
                      <p className="text-2xl font-bold text-white">
                        {(() => {
                          // Exclure les administrateurs du calcul du taux de succès
                          const nonAdminUsers = users.filter(u => !u.is_admin);
                          const totalSuccess = nonAdminUsers.reduce((sum, u) => sum + (u.success_count || 0), 0);
                          const totalProcessed = nonAdminUsers.reduce((sum, u) => sum + (u.processed_images || 0), 0);
                          return totalProcessed > 0 ? `${((totalSuccess / totalProcessed) * 100).toFixed(1)}%` : '100%';
                        })()}
                      </p>
                      <p className="text-xs text-amber-400 mt-1">
                        {(() => {
                          const nonAdminUsers = users.filter(u => !u.is_admin);
                          const totalSuccess = nonAdminUsers.reduce((sum, u) => sum + (u.success_count || 0), 0);
                          const totalProcessed = nonAdminUsers.reduce((sum, u) => sum + (u.processed_images || 0), 0);
                          return `${totalSuccess} succès sur ${totalProcessed} (utilisateurs)`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques détaillées par opération */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-xl border border-blue-500/30">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Répartition des Opérations</h4>
                    <p className="text-gray-400 text-sm">Analyse détaillée des traitements effectués</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard 
                    icon={Maximize2}
                    title="Redimensionnement"
                    count={globalStats.operations.resize.count}
                    time={globalStats.operations.resize.time}
                    color="text-blue-400"
                    bgColor="bg-blue-500/10"
                  />
                  
                  <StatCard 
                    icon={Wand2}
                    title="Suppression arrière-plan IA"
                    count={globalStats.operations.ai.count}
                    time={globalStats.operations.ai.time}
                    color="text-purple-400"
                    bgColor="bg-purple-500/10"
                  />
                  
                  <StatCard 
                    icon={Scissors}
                    title="Recadrage de tête"
                    count={globalStats.operations.cropHead.count}
                    time={globalStats.operations.cropHead.time}
                    color="text-red-400"
                    bgColor="bg-red-500/10"
                  />
                </div>
              </div>

              {/* Quick User Overview Table */}
              <div className="bg-slate-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-200">Aperçu des utilisateurs</h4>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher..."
                        className="w-48 bg-slate-700/50 border border-gray-600/50 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800/80">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Utilisateur</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">Images</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">Succès</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">IA</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">Redim.</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">Autres</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.slice(0, 10).map(user => {
                        const successRate = user.processed_images > 0
                          ? (user.success_count / user.processed_images) * 100
                          : 0;

                        return (
                          <tr key={user.id} className="border-t border-gray-700/30 hover:bg-slate-800/30 transition-colors">
                            <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-300">{user.email}</span>
                                {user.is_admin && (
                                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-1.5 py-0.5 rounded">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="text-center py-2 px-2 text-sm text-gray-300">{user.processed_images}</td>
                            <td className="text-center py-2 px-2">
                              <span className={`text-xs ${
                                successRate >= 90 ? 'text-emerald-400' :
                                successRate >= 70 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {successRate.toFixed(0)}%
                              </span>
                            </td>
                            <td className="text-center py-2 px-2 text-xs text-purple-400">{user.ai_count}</td>
                            <td className="text-center py-2 px-2 text-xs text-blue-400">{user.resize_count}</td>
                            <td className="text-center py-2 px-2 text-xs text-gray-400">{user.crop_head_count + user.all_processing_count}</td>
                          </tr>
                        );
                      })}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-gray-400 text-sm">
                            {searchTerm ? 'Aucun utilisateur trouvé.' : 'Aucun utilisateur disponible.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length > 10 && (
                  <div className="p-3 border-t border-gray-700/50 bg-slate-800/30 text-center">
                    <p className="text-xs text-gray-400">
                      Affichage de 10 sur {filteredUsers.length} utilisateurs. 
                      <button 
                        onClick={() => setActiveTab('users')} 
                        className="text-emerald-400 hover:text-emerald-300 ml-1"
                      >
                        Voir tous →
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'groups' && (
            <GroupManagement
              groups={groups}
              loading={loading}
              error={error}
              successMessage={successMessage}
              onCreateGroup={handleCreateGroup}
              onDeleteGroup={handleDeleteGroup}
              onUpdateGroupLimit={handleUpdateGroupLimit}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement
              onError={(msg) => {
                setError(msg);
                setTimeout(() => setError(null), 5000);
              }}
              onSuccess={(msg) => {
                setSuccessMessage(msg);
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              onError={(msg) => {
                setError(msg);
                setTimeout(() => setError(null), 5000);
              }}
              onSuccess={(msg) => {
                setSuccessMessage(msg);
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
            />
          )}

          {activeTab === 'monthly' && <MonthlyUsageManager />}
          </div>
        </div>
      </div>
    </div>
  );
}