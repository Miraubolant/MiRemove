import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Shield, ToggleLeft, ToggleRight, 
  Activity, Calendar, Trash2, Eye, EyeOff,
  Maximize2, Wand2, Scissors, Sparkles, AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  is_admin: boolean;
  isGroupMember?: boolean;
  groupInfo?: {
    name: string;
    memberCount: number;
    totalUsage: number;
    limit: number;
  };
  stats?: {
    processed_images: number;
    success_count: number;
    failure_count: number;
    success_rate: number;
    total_processing_time: number;
    average_processing_time: number;
    limit: number;
    personalUsage?: number;
    operations: {
      resize?: { count: number; time: number };
      ai?: { count: number; time: number };
      crop_head?: { count: number; time: number };
      all?: { count: number; time: number };
    };
  };
  groups?: string[];
}

interface UserManagementProps {
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

export function UserManagement({ onError, onSuccess }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState<{ [userId: string]: boolean }>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: { id: string; email: string } | null; loading: boolean }>({
    isOpen: false,
    user: null,
    loading: false
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Charger les profils utilisateur et leurs statistiques depuis les tables
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, email, user_level, image_limit, created_at');

      if (profilesError) throw profilesError;

      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select('*');
      
      if (statsError) throw statsError;

      // Charger tous les groupes et leurs limites
      const { data: allGroups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, image_limit');
      
      if (groupsError) throw groupsError;

      // Traiter les données et enrichir avec les groupes
      const usersWithGroups = await Promise.all(
        (userProfiles || []).map(async (profile) => {
          const stats = (userStats || []).find(stat => stat.user_id === profile.user_id) || {};
          
          // Récupérer les vraies statistiques depuis processing_logs
          const { data: logs, error: logsError } = await supabase
            .from('processing_logs')
            .select('operation_type, operations_count, processing_time_ms, success')
            .eq('user_id', profile.user_id);
          
          // Calculer les vraies statistiques depuis les logs
          let realStats = {
            processed_images: 0,
            bg_removal_count: 0,
            resize_count: 0,
            head_crop_count: 0,
            both_count: 0,
            crop_head_resize_count: 0,
            all_count: 0,
            total_operations: 0,
            total_processing_time: 0,
            success_count: 0,
            failure_count: 0,
            resize_time: 0,
            ai_time: 0,
            crop_head_time: 0,
            both_time: 0,
            crop_head_resize_time: 0,
            all_time: 0
          };

          if (!logsError && logs) {
            logs.forEach(log => {
              const count = log.operations_count || 1;
              const time = log.processing_time_ms || 0;
              
              realStats.total_operations += count;
              realStats.processed_images += count;
              realStats.total_processing_time += time;
              
              if (log.success) {
                realStats.success_count += count;
              } else {
                realStats.failure_count += count;
              }
              
              // Mapper les types d'opération
              switch(log.operation_type) {
                case 'resize':
                  realStats.resize_count += count;
                  realStats.resize_time += time;
                  break;
                case 'bg_removal':
                  realStats.bg_removal_count += count;
                  realStats.ai_time += time;
                  break;
                case 'head_crop':
                  realStats.head_crop_count += count;
                  realStats.crop_head_time += time;
                  break;
                case 'both':
                  realStats.both_count += count;
                  realStats.both_time += time;
                  break;
                case 'crop-head-resize':
                  realStats.crop_head_resize_count += count;
                  realStats.crop_head_resize_time += time;
                  break;
                case 'all':
                  realStats.all_count += count;
                  realStats.all_time += time;
                  break;
              }
            });
          }
          
          const userData = {
            user_id: profile.user_id,
            email: profile.email,
            user_level: profile.user_level,
            image_limit: profile.image_limit,
            created_at: profile.created_at,
            processed_images: realStats.processed_images,
            bg_removal_count: realStats.bg_removal_count,
            resize_count: realStats.resize_count,
            head_crop_count: realStats.head_crop_count,
            both_count: realStats.both_count,
            crop_head_resize_count: realStats.crop_head_resize_count,
            all_count: realStats.all_count,
            total_operations: realStats.total_operations,
            total_processing_time: realStats.total_processing_time,
            success_count: realStats.success_count,
            failure_count: realStats.failure_count,
            success_rate: realStats.total_operations > 0 ? Math.round((realStats.success_count / realStats.total_operations) * 100) : 100,
            average_processing_time: realStats.total_operations > 0 ? realStats.total_processing_time / realStats.total_operations : 0,
            resize_time: realStats.resize_time,
            ai_time: realStats.ai_time,
            crop_head_time: realStats.crop_head_time,
            both_time: realStats.both_time,
            crop_head_resize_time: realStats.crop_head_resize_time,
            all_time: realStats.all_time
          };
          try {
            // Charger les groupes de l'utilisateur
            const { data: groupData, error: groupError } = await supabase
              .from('group_members')
              .select('groups(id, name, image_limit)')
              .eq('user_id', userData.user_id);

            if (groupError) {
              console.warn(`Error loading groups for user ${userData.user_id}:`, groupError);
            }

            const userGroupsData = groupData?.map((g: any) => g.groups).filter(Boolean) || [];
            const userGroups = userGroupsData.map((g: any) => g.name);
            
            // Calculer le quota et l'utilisation selon les règles :
            // Si l'utilisateur est dans un groupe, il utilise le quota partagé du groupe
            let effectiveLimit = userData.image_limit || 100;
            let groupBasedUsage = userData.processed_images || 0;
            let isGroupMember = false;
            let groupInfo = null;

            if (userGroupsData.length > 0) {
              // L'utilisateur est membre d'un/des groupe(s)
              // Utiliser le quota du premier groupe (ou vous pouvez implémenter une logique plus complexe)
              const primaryGroup = userGroupsData[0];
              effectiveLimit = primaryGroup.image_limit;
              isGroupMember = true;
              
              // Calculer l'utilisation totale du groupe (tous les membres)
              const { data: groupMembers } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', primaryGroup.id);

              if (groupMembers && groupMembers.length > 0) {
                const memberIds = groupMembers.map(m => m.user_id);
                
                // Récupérer les vraies stats depuis processing_logs pour tous les membres du groupe
                const { data: groupLogs } = await supabase
                  .from('processing_logs')
                  .select('operations_count, success')
                  .in('user_id', memberIds);

                const totalGroupUsage = (groupLogs || []).reduce((sum, log) => {
                  if (log.success) {
                    return sum + (log.operations_count || 1);
                  }
                  return sum;
                }, 0);
                
                groupBasedUsage = totalGroupUsage;

                groupInfo = {
                  name: primaryGroup.name,
                  memberCount: groupMembers.length,
                  totalUsage: totalGroupUsage,
                  limit: primaryGroup.image_limit
                };
              }
            }

            return {
              id: userData.user_id,
              email: userData.email || 'Email non disponible',
              created_at: userData.created_at,
              last_sign_in_at: userData.last_sign_in_at,
              is_admin: userData.is_admin || false,
              isGroupMember,
              groupInfo,
              stats: {
                processed_images: isGroupMember ? groupBasedUsage : (userData.processed_images || 0),
                success_count: userData.success_count || 0,
                failure_count: userData.failure_count || 0,
                success_rate: userData.success_rate || 100,
                total_processing_time: userData.total_processing_time || 0,
                average_processing_time: userData.average_processing_time || 0,
                limit: effectiveLimit,
                personalUsage: userData.processed_images || 0, // Utilisation personnelle de cet utilisateur
                operations: {
                  resize: { count: userData.resize_count || 0, time: userData.resize_time || 0 },
                  ai: { count: userData.bg_removal_count || 0, time: userData.ai_time || 0 },
                  crop_head: { count: userData.head_crop_count || 0, time: userData.crop_head_time || 0 },
                  both: { count: userData.both_count || 0, time: userData.both_time || 0 },
                  crop_head_resize: { count: userData.crop_head_resize_count || 0, time: userData.crop_head_resize_time || 0 },
                  all: { count: userData.all_count || 0, time: userData.all_time || 0 }
                }
              },
              groups: userGroups
            };
          } catch (err) {
            console.warn(`Error processing user ${userData.user_id}:`, err);
            return {
              id: userData.user_id,
              email: userData.email || 'Email non disponible',
              created_at: userData.created_at,
              last_sign_in_at: userData.last_sign_in_at,
              is_admin: userData.is_admin || false,
              stats: {
                processed_images: userData.processed_images || 0,
                success_count: userData.success_count || 0,
                failure_count: userData.failure_count || 0,
                success_rate: userData.success_rate || 100,
                total_processing_time: userData.total_processing_time || 0,
                average_processing_time: userData.average_processing_time || 0,
                limit: userData.image_limit || 100,
                operations: {
                  resize: { count: 0, time: 0 },
                  ai: { count: 0, time: 0 },
                  crop_head: { count: 0, time: 0 },
                  both: { count: 0, time: 0 },
                  crop_head_resize: { count: 0, time: 0 },
                  all: { count: 0, time: 0 }
                }
              },
              groups: []
            };
          }
        })
      );
      
      setUsers(usersWithGroups);
    } catch (err) {
      console.error('Error loading users:', err);
      const errorMsg = 'Erreur lors du chargement des utilisateurs';
      setLocalError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('user_stats')
        .update({ 
          is_admin: !currentState,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Mettre à jour l'état local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_admin: !currentState } : user
      ));

      const successMsg = `Droits d'administrateur ${!currentState ? 'accordés' : 'retirés'} avec succès`;
      setLocalSuccess(successMsg);
      onSuccess?.(successMsg);
      setTimeout(() => setLocalSuccess(null), 3000);
    } catch (err) {
      console.error('Error toggling admin status:', err);
      const errorMsg = 'Erreur lors de la modification des droits administrateur';
      setLocalError(errorMsg);
      onError?.(errorMsg);
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const handleDeleteUser = (userId: string, userEmail: string) => {
    setDeleteModal({
      isOpen: true,
      user: { id: userId, email: userEmail },
      loading: false
    });
  };

  const confirmDeleteUser = async () => {
    if (!deleteModal.user) return;

    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      // Utiliser la fonction RPC sécurisée pour supprimer les données
      const { data, error } = await supabase
        .rpc('admin_delete_user_data', { target_user_id: deleteModal.user.id });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      // Mettre à jour l'état local - retirer l'utilisateur de la liste
      setUsers(prev => prev.filter(user => user.id !== deleteModal.user!.id));

      const successMsg = `Données de l'utilisateur ${deleteModal.user.email} supprimées avec succès
      - Images traitées: ${data.deleted_stats?.processed_images || 0}
      - Succès: ${data.deleted_stats?.success_count || 0}
      - Échecs: ${data.deleted_stats?.failure_count || 0}
      
Note: Le compte d'authentification reste actif.`;
      
      setLocalSuccess(successMsg);
      onSuccess?.(successMsg);
      setTimeout(() => setLocalSuccess(null), 5000);

      // Fermer le modal
      setDeleteModal({ isOpen: false, user: null, loading: false });
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMsg = err instanceof Error 
        ? `Erreur lors de la suppression: ${err.message}`
        : 'Erreur lors de la suppression de l\'utilisateur';
      setLocalError(errorMsg);
      onError?.(errorMsg);
      setTimeout(() => setLocalError(null), 5000);
      
      // Arrêter le loading mais garder le modal ouvert
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const closeDeleteModal = () => {
    if (!deleteModal.loading) {
      setDeleteModal({ isOpen: false, user: null, loading: false });
    }
  };

  const toggleDetails = (userId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Messages */}
      {localError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{localError}</p>
        </div>
      )}

      {localSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{localSuccess}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-500" />
          Gestion des utilisateurs
          <span className="text-sm text-gray-400 ml-2">({users.length} utilisateur{users.length > 1 ? 's' : ''})</span>
        </h3>
        
        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          {loading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un utilisateur par email..."
          className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Chargement des utilisateurs...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {searchTerm ? 'Aucun utilisateur trouvé pour cette recherche' : 'Aucun utilisateur enregistré'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-slate-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
              {/* User Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-200">{user.email}</span>
                        {user.is_admin && (
                          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                        {user.isGroupMember && user.groupInfo && (
                          <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Groupe: {user.groupInfo.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Inscrit le {formatDate(user.created_at)}
                        {user.last_sign_in_at && (
                          <span className="ml-2">• Dernière connexion: {formatDate(user.last_sign_in_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Stats Summary */}
                    {user.stats && (
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {user.stats.processed_images} images
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${
                            user.stats.success_rate >= 90 ? 'bg-emerald-500' :
                            user.stats.success_rate >= 75 ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          {user.stats.success_rate}% succès
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <button
                      onClick={() => toggleDetails(user.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-slate-700/50 rounded transition-colors"
                      title={showDetails[user.id] ? 'Masquer les détails' : 'Afficher les détails'}
                    >
                      {showDetails[user.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                      className={`p-1.5 rounded transition-colors ${
                        user.is_admin
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-gray-400 hover:bg-gray-700/50'
                      }`}
                      title={user.is_admin ? "Retirer les droits d'admin" : "Donner les droits d'admin"}
                    >
                      {user.is_admin ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      title="Supprimer l'utilisateur"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Usage Progress */}
                {user.stats && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-400">
                        {user.isGroupMember ? 'Quota partagé du groupe' : 'Utilisation personnelle'}
                      </span>
                      <span className="text-gray-400">
                        {user.stats.processed_images} / {user.stats.limit.toLocaleString()} images
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r transition-all duration-500 ${
                          user.stats.processed_images / user.stats.limit > 0.8
                            ? 'from-red-500 to-red-400'
                            : user.stats.processed_images / user.stats.limit > 0.6
                            ? 'from-amber-500 to-amber-400'
                            : 'from-emerald-500 to-emerald-400'
                        }`}
                        style={{ width: `${Math.min(user.stats.processed_images / user.stats.limit * 100, 100)}%` }}
                      />
                    </div>
                    {user.isGroupMember && user.groupInfo && (
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-blue-400">
                          Contribution personnelle: {user.stats.personalUsage} images
                        </span>
                        <span className="text-gray-500">
                          {user.groupInfo.memberCount} membre{user.groupInfo.memberCount > 1 ? 's' : ''} dans le groupe
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Detailed Stats */}
              {showDetails[user.id] && user.stats && (
                <div className="border-t border-gray-700/50 p-4 bg-slate-800/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Processing Stats */}
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Statistiques générales</h4>
                      <div className="space-y-1 text-xs text-gray-400">
                        <div>Images traitées: {user.stats.processed_images}</div>
                        <div>Succès: {user.stats.success_count}</div>
                        <div>Échecs: {user.stats.failure_count}</div>
                        <div>Temps moyen: {formatTime(user.stats.average_processing_time)}</div>
                        <div>Temps total: {formatTime(user.stats.total_processing_time)}</div>
                      </div>
                    </div>

                    {/* Operations Row 1 */}
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-blue-400" />
                        Redimensionnement
                      </h4>
                      <div className="space-y-1 text-xs text-gray-400">
                        <div>Images: {user.stats.operations.resize?.count || 0}</div>
                        <div>Temps: {formatTime(user.stats.operations.resize?.time || 0)}</div>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <Wand2 className="w-3 h-3 text-purple-400" />
                        IA Background
                      </h4>
                      <div className="space-y-1 text-xs text-gray-400">
                        <div>Images: {user.stats.operations.ai?.count || 0}</div>
                        <div>Temps: {formatTime(user.stats.operations.ai?.time || 0)}</div>
                      </div>
                    </div>

                    {/* Operations Row 2 */}
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                        <Scissors className="w-3 h-3 text-red-400" />
                        Crop Head
                      </h4>
                      <div className="space-y-1 text-xs text-gray-400">
                        <div>Images: {user.stats.operations.crop_head?.count || 0}</div>
                        <div>Temps: {formatTime(user.stats.operations.crop_head?.time || 0)}</div>
                      </div>
                    </div>

                  </div>

                  {/* Group Information */}
                  {user.isGroupMember && user.groupInfo && (
                    <div className="mt-4 pt-3 border-t border-gray-700/50">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Informations du groupe</h4>
                      <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Nom du groupe:</span>
                            <div className="text-blue-400 font-medium">{user.groupInfo.name}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Membres:</span>
                            <div className="text-gray-300">{user.groupInfo.memberCount}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Quota partagé:</span>
                            <div className="text-gray-300">{user.groupInfo.limit.toLocaleString()} images</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Utilisé par le groupe:</span>
                            <div className="text-gray-300">{user.groupInfo.totalUsage} images</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Votre contribution:</span>
                            <div className="text-emerald-400 font-medium">{user.stats.personalUsage} images</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Restant groupe:</span>
                            <div className={`font-medium ${
                              (user.groupInfo.limit - user.groupInfo.totalUsage) < user.groupInfo.limit * 0.1 
                                ? 'text-red-400' 
                                : 'text-emerald-400'
                            }`}>
                              {(user.groupInfo.limit - user.groupInfo.totalUsage).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-blue-500/20">
                          <div className="text-xs text-blue-300">
                            <span className="font-medium">Règle:</span> Tous les membres du groupe partagent le même quota de {user.groupInfo.limit.toLocaleString()} images.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Individual Groups (for users not in managed groups) */}
                  {!user.isGroupMember && user.groups && user.groups.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-700/50">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Groupes (informationnel)</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.groups.map(group => (
                          <span key={group} className="bg-gray-500/10 text-gray-400 text-xs px-2 py-1 rounded">
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteUser}
        userEmail={deleteModal.user?.email || ''}
        loading={deleteModal.loading}
      />
    </div>
  );
}