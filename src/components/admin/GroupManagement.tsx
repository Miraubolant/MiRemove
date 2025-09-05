import React, { useState } from 'react';
import { 
  Plus, AlertTriangle, Users, Trash2, Activity, 
  Maximize2, Wand2, Scissors, Sparkles, UserPlus, Search,
  X, Shield, ToggleLeft, ToggleRight, Edit3, BarChart3, Calendar, Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
    both?: { count: number; time: number };
    'crop-head-resize'?: { count: number; time: number };
    all?: { count: number; time: number };
  };
}

interface User {
  id: string;
  email: string;
  is_admin?: boolean;
}

interface GroupManagementProps {
  groups: Group[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  onCreateGroup: (name: string, limit: number) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onUpdateGroupLimit: (groupId: string, newLimit: number) => Promise<void>;
  onAddMember: (groupId: string, userId: string) => Promise<void>;
  onRemoveMember: (groupId: string, userId: string) => Promise<void>;
}

export function GroupManagement({
  groups,
  loading,
  error,
  successMessage,
  onCreateGroup,
  onDeleteGroup,
  onUpdateGroupLimit,
  onAddMember,
  onRemoveMember
}: GroupManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditLimitModal, setShowEditLimitModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLimit, setNewGroupLimit] = useState(10000);
  const [editLimit, setEditLimit] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadUsers = async () => {
    try {
      // Charger les profils utilisateur depuis la table user_profiles
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id, email, user_level');

      if (usersError) throw usersError;

      // Transformer les données pour l'interface
      const usersWithEmails = (usersData || []).map((userData: any) => ({
        id: userData.user_id,
        email: userData.email || 'Email non disponible',
        is_admin: userData.user_level === 'admin'
      }));

      // Trier par email
      usersWithEmails.sort((a, b) => a.email.localeCompare(b.email));
      setUsers(usersWithEmails);
    } catch (err) {
      console.error('Error loading users:', err);
      setLocalError('Erreur lors du chargement des utilisateurs');
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      // Charger directement les membres du groupe (sans la colonne 'role' qui n'existe pas)
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (membersError) {
        console.warn('Error loading group members:', membersError);
        setGroupMembers([]);
        return;
      }

      if (!membersData || membersData.length === 0) {
        setGroupMembers([]);
        return;
      }

      // Obtenir les emails des membres via user_profiles
      const memberIds = membersData.map(m => m.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id, email, user_level')
        .in('user_id', memberIds);
      
      if (usersError) {
        console.warn('Error loading users data:', usersError);
      }

      // Enrichir les membres avec leurs emails et statuts admin
      const finalMembers = membersData.map((member: any) => {
        const userInfo = usersData?.find((u: any) => u.user_id === member.user_id);
        return {
          id: member.user_id,
          email: userInfo?.email || 'Email non disponible',
          is_admin: userInfo?.user_level === 'admin'
        };
      });

      setGroupMembers(finalMembers);
    } catch (err) {
      console.error('Error loading group members:', err);
      setLocalError('Erreur lors du chargement des membres');
    }
  };

  const handleShowAddMember = async (group: Group) => {
    setSelectedGroup(group);
    await Promise.all([
      loadUsers(),
      loadGroupMembers(group.id)
    ]);
    setShowAddMemberModal(true);
  };

  const handleRemoveMemberWithReset = async (groupId: string, userId: string) => {
    try {
      // Appeler la fonction parent pour supprimer le membre
      await onRemoveMember(groupId, userId);
      
      // RÉINITIALISATION DES DONNÉES LORS DU RETRAIT DU GROUPE
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
      
      // Recharger les membres après suppression
      await loadGroupMembers(groupId);
      
      setLocalSuccess('Membre supprimé et données réinitialisées');
      setTimeout(() => setLocalSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing member:', err);
      setLocalError('Erreur lors de la suppression du membre');
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const handleCreateGroupSubmit = async () => {
    if (!newGroupName.trim() || newGroupLimit < 0) {
      setLocalError('Veuillez saisir un nom valide et une limite positive');
      return;
    }
    
    try {
      await onCreateGroup(newGroupName.trim(), newGroupLimit);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupLimit(10000);
      setLocalSuccess('Groupe créé avec succès');
      setTimeout(() => setLocalSuccess(null), 3000);
    } catch (err) {
      setLocalError('Erreur lors de la création du groupe');
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const handleToggleAdmin = async (userId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('user_stats')
        .update({ is_admin: !currentState })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_admin: !currentState } : user
      ));
      setGroupMembers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_admin: !currentState } : user
      ));

      setLocalSuccess(`Droits d'administrateur ${!currentState ? 'accordés' : 'retirés'}`);
      setTimeout(() => setLocalSuccess(null), 3000);
    } catch (err) {
      console.error('Error toggling admin status:', err);
      setLocalError('Erreur lors de la modification des droits');
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const handleShowEditLimit = (group: Group) => {
    setSelectedGroup(group);
    setEditLimit(group.image_limit);
    setShowEditLimitModal(true);
  };

  const handleUpdateLimit = async () => {
    if (!selectedGroup || editLimit < 0) {
      setLocalError('Veuillez saisir une limite valide');
      return;
    }
    
    try {
      await onUpdateGroupLimit(selectedGroup.id, editLimit);
      setShowEditLimitModal(false);
      setLocalSuccess(`Limite du groupe "${selectedGroup.name}" mise à jour à ${editLimit} images`);
      setTimeout(() => setLocalSuccess(null), 3000);
    } catch (err) {
      setLocalError('Erreur lors de la mise à jour de la limite');
      setTimeout(() => setLocalError(null), 3000);
    }
  };

  const loadGroupDetails = async (group: Group) => {
    setLoadingDetails(true);
    try {
      // D'abord récupérer les IDs des membres du groupe
      const { data: memberIds, error: memberError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', group.id);

      if (memberError) {
        throw memberError;
      }

      if (!memberIds || memberIds.length === 0) {
        setGroupDetails({
          group,
          logs: [],
          stats: { totalOperations: 0, byType: {}, byUser: {}, timeStats: {} }
        });
        setShowDetailsModal(true);
        return;
      }

      const userIds = memberIds.map(m => m.user_id);
      
      // Récupérer les logs des membres du groupe
      const { data: logs, error: logsError } = await supabase
        .from('processing_logs')
        .select(`
          id,
          operation_type,
          operations_count,
          success,
          processing_time_ms,
          file_size_bytes,
          created_at,
          user_id
        `)
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) {
        throw logsError;
      }

      // Enrichir avec les emails des utilisateurs
      const { data: userEmails } = await supabase
        .from('user_profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      const enrichedLogs = (logs || []).map(log => ({
        ...log,
        user_profiles: {
          email: userEmails?.find(u => u.user_id === log.user_id)?.email || 'Email inconnu'
        }
      }));

      setGroupDetails({
        group,
        logs: enrichedLogs,
        stats: calculateDetailedStats(enrichedLogs)
      });

      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading group details:', err);
      setLocalError('Erreur lors du chargement des détails du groupe');
      setTimeout(() => setLocalError(null), 3000);
    } finally {
      setLoadingDetails(false);
    }
  };

  const calculateDetailedStats = (logs: any[]) => {
    const stats = {
      totalOperations: logs.length,
      byType: {} as Record<string, { count: number; avgTime: number; totalTime: number; successRate: number }>,
      byUser: {} as Record<string, { count: number; email: string; successRate: number }>,
      timeStats: {
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0
      }
    };

    logs.forEach(log => {
      const type = log.operation_type;
      const email = log.user_profiles?.email || 'Email inconnu';
      const time = log.processing_time_ms || 0;
      const success = log.success;

      // Stats par type
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, avgTime: 0, totalTime: 0, successRate: 0 };
      }
      stats.byType[type].count++;
      stats.byType[type].totalTime += time;
      
      // Stats par utilisateur
      if (!stats.byUser[email]) {
        stats.byUser[email] = { count: 0, email, successRate: 0 };
      }
      stats.byUser[email].count++;

      // Stats de temps
      stats.timeStats.totalTime += time;
      if (time > 0) {
        stats.timeStats.minTime = Math.min(stats.timeStats.minTime, time);
        stats.timeStats.maxTime = Math.max(stats.timeStats.maxTime, time);
      }
    });

    // Calculer les moyennes et taux de succès
    Object.keys(stats.byType).forEach(type => {
      const typeStats = stats.byType[type];
      typeStats.avgTime = typeStats.totalTime / typeStats.count;
      const successCount = logs.filter(l => l.operation_type === type && l.success).length;
      typeStats.successRate = (successCount / typeStats.count) * 100;
    });

    Object.keys(stats.byUser).forEach(email => {
      const userStats = stats.byUser[email];
      const successCount = logs.filter(l => (l.user_profiles?.email || 'Email inconnu') === email && l.success).length;
      userStats.successRate = (successCount / userStats.count) * 100;
    });

    stats.timeStats.avgTime = stats.timeStats.totalTime / logs.length;
    if (stats.timeStats.minTime === Infinity) stats.timeStats.minTime = 0;

    return stats;
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !groupMembers.some(member => member.id === user.id)
  );

  return (
    <div className="space-y-4">
      {/* Messages */}
      {(error || localError) && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error || localError}</p>
        </div>
      )}

      {(successMessage || localSuccess) && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{successMessage || localSuccess}</p>
        </div>
      )}

      {/* Groups List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Groupes existants
          </h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau groupe
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">
            Chargement des groupes...
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Aucun groupe créé
          </div>
        ) : (
          <div className="grid gap-4">
            {groups.map(group => (
              <div key={group.id} className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-200">{group.name}</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadGroupDetails(group)}
                      disabled={loadingDetails}
                      className="p-1.5 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Voir les détails des traitements"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShowEditLimit(group)}
                      className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Modifier la limite"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShowAddMember(group)}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Gérer les membres"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteGroup(group.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Supprimer le groupe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Quota Progress */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Activity className="w-4 h-4" />
                        <span className="font-medium">Quota partagé du groupe</span>
                      </div>
                      <div className="text-gray-400">
                        {group.total_processed || 0} / {group.image_limit.toLocaleString()} images
                      </div>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r transition-all duration-500 ${
                          (group.total_processed || 0) / group.image_limit > 0.8
                            ? 'from-red-500 to-red-400'
                            : (group.total_processed || 0) / group.image_limit > 0.6
                            ? 'from-amber-500 to-amber-400'
                            : 'from-emerald-500 to-emerald-400'
                        }`}
                        style={{ width: `${Math.min((group.total_processed || 0) / group.image_limit * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          (group.total_processed || 0) / group.image_limit > 0.8
                            ? 'bg-red-500/20 text-red-400'
                            : (group.total_processed || 0) / group.image_limit > 0.6
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {((group.total_processed || 0) / group.image_limit * 100).toFixed(1)}% utilisé
                        </span>
                        <span className="text-xs text-gray-500">
                          {(group.image_limit - (group.total_processed || 0)).toLocaleString()} restants
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {group.member_count || 0} membre{(group.member_count || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Operation stats */}
                  <div className="border-t border-gray-700/30 pt-3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-300">Répartition des traitements</span>
                      <span className="text-xs text-gray-500">
                        (Total: {Object.values(group.stats || {}).reduce((sum, stat) => sum + (stat.count || 0), 0)})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-700/20 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Maximize2 className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-gray-300">Resize</span>
                        </div>
                        <div className="text-sm font-medium text-blue-400">{group.stats?.resize?.count || 0}</div>
                      </div>
                      <div className="bg-slate-700/20 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Wand2 className="w-3 h-3 text-purple-400" />
                          <span className="text-xs text-gray-300">IA Fond</span>
                        </div>
                        <div className="text-sm font-medium text-purple-400">{group.stats?.ai?.count || 0}</div>
                      </div>
                      <div className="bg-slate-700/20 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Scissors className="w-3 h-3 text-red-400" />
                          <span className="text-xs text-gray-300">Crop</span>
                        </div>
                        <div className="text-sm font-medium text-red-400">{group.stats?.crop_head?.count || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-500" />
                  Gérer les membres - {selectedGroup.name}
                </h3>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {/* Current Members */}
              {groupMembers.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Membres actuels</h4>
                  <div className="space-y-2">
                    {groupMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-300">{member.email}</span>
                          {member.is_admin && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAdmin(member.id, member.is_admin || false)}
                            className={`p-1.5 rounded transition-colors ${
                              member.is_admin
                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-gray-400 hover:bg-gray-700/50'
                            }`}
                            title={member.is_admin ? "Retirer les droits d'admin" : "Donner les droits d'admin"}
                          >
                            {member.is_admin ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveMemberWithReset(selectedGroup.id, member.id)}
                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-colors"
                            title="Supprimer du groupe et réinitialiser les données"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Users */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Utilisateurs disponibles</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Aucun utilisateur trouvé</p>
                  ) : (
                    filteredUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-300">{user.email}</span>
                          {user.is_admin && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAdmin(user.id, user.is_admin || false)}
                            className={`p-1.5 rounded transition-colors ${
                              user.is_admin
                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-gray-400 hover:bg-gray-700/50'
                            }`}
                            title={user.is_admin ? "Retirer les droits d'admin" : "Donner les droits d'admin"}
                          >
                            {user.is_admin ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => onAddMember(selectedGroup.id, user.id)}
                            className="text-emerald-400 hover:text-emerald-300 p-1 hover:bg-emerald-500/10 rounded transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-500" />
                  Nouveau groupe
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nom du groupe
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Ex: Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center justify-between">
                    <span>Limite d'images</span>
                    <span className="text-xs text-gray-500">Recommandé: 10,000</span>
                  </label>
                  <input
                    type="number"
                    value={newGroupLimit}
                    onChange={(e) => setNewGroupLimit(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Ex: 10000"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateGroupSubmit}
                  disabled={!newGroupName || newGroupLimit < 0}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer le groupe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Limit Modal */}
      {showEditLimitModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-500" />
                  Modifier la limite - {selectedGroup.name}
                </h3>
                <button
                  onClick={() => setShowEditLimitModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nouvelle limite d'images
                  </label>
                  <div className="text-xs text-gray-500 mb-2">
                    Actuel: {selectedGroup.total_processed || 0} / {selectedGroup.image_limit} images ({((selectedGroup.total_processed || 0) / selectedGroup.image_limit * 100).toFixed(1)}%)
                  </div>
                  <input
                    type="number"
                    value={editLimit}
                    onChange={(e) => setEditLimit(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Ex: 15000"
                    min="0"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Recommandé: Au moins {selectedGroup.total_processed || 0} (utilisation actuelle)
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditLimitModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateLimit}
                  disabled={editLimit < 0}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {showDetailsModal && groupDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-6xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                  Détails des traitements - {groupDetails.group.name}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Stats by Operation Type */}
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-200 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    Par type d'opération
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(groupDetails.stats.byType).map(([type, stats]) => {
                      const getTypeIcon = (operationType: string) => {
                        switch (operationType) {
                          case 'resize': return <Maximize2 className="w-4 h-4 text-blue-400" />;
                          case 'bg_removal': return <Wand2 className="w-4 h-4 text-purple-400" />;
                          case 'head_crop': return <Scissors className="w-4 h-4 text-red-400" />;
                          default: return <Sparkles className="w-4 h-4 text-amber-400" />;
                        }
                      };

                      const getTypeName = (operationType: string) => {
                        switch (operationType) {
                          case 'resize': return 'Redimensionnement';
                          case 'bg_removal': return 'Suppression fond';
                          case 'head_crop': return 'Coupe tête';
                          default: return operationType;
                        }
                      };

                      return (
                        <div key={type} className="bg-slate-700/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(type)}
                              <span className="text-gray-300 font-medium">{getTypeName(type)}</span>
                            </div>
                            <span className="text-sm text-gray-400">{stats.count} opérations</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-gray-500">Temps moyen:</span>
                              <div className="text-gray-300">{(stats.avgTime / 1000).toFixed(1)}s</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Taux de succès:</span>
                              <div className={`font-medium ${stats.successRate >= 95 ? 'text-emerald-400' : stats.successRate >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                                {stats.successRate.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats by User */}
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-200 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Par utilisateur
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.entries(groupDetails.stats.byUser)
                      .sort(([,a], [,b]) => b.count - a.count)
                      .map(([email, stats]) => (
                        <div key={email} className="bg-slate-700/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300 text-sm font-medium truncate">{stats.email}</span>
                            <span className="text-xs text-gray-400">{stats.count} ops</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">Succès: </span>
                            <span className={`font-medium ${stats.successRate >= 95 ? 'text-emerald-400' : stats.successRate >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                              {stats.successRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Time Statistics */}
              <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-medium text-gray-200 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Statistiques de temps
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{(groupDetails.stats.timeStats.avgTime / 1000).toFixed(1)}s</div>
                    <div className="text-xs text-gray-500">Temps moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{(groupDetails.stats.timeStats.minTime / 1000).toFixed(1)}s</div>
                    <div className="text-xs text-gray-500">Temps minimum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{(groupDetails.stats.timeStats.maxTime / 1000).toFixed(1)}s</div>
                    <div className="text-xs text-gray-500">Temps maximum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{groupDetails.stats.totalOperations}</div>
                    <div className="text-xs text-gray-500">Total opérations</div>
                  </div>
                </div>
              </div>

              {/* Recent Logs */}
              <div className="bg-slate-800/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-200 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                  Dernières opérations
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left py-2 text-gray-400">Date</th>
                        <th className="text-left py-2 text-gray-400">Utilisateur</th>
                        <th className="text-left py-2 text-gray-400">Opération</th>
                        <th className="text-left py-2 text-gray-400">Temps</th>
                        <th className="text-left py-2 text-gray-400">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                      {groupDetails.logs.slice(0, 10).map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-700/20">
                          <td className="py-2 text-gray-300">
                            {new Date(log.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-2 text-gray-300 truncate max-w-32">
                            {log.user_profiles?.email || 'Inconnu'}
                          </td>
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              {log.operation_type === 'resize' && <Maximize2 className="w-3 h-3 text-blue-400" />}
                              {log.operation_type === 'bg_removal' && <Wand2 className="w-3 h-3 text-purple-400" />}
                              {log.operation_type === 'head_crop' && <Scissors className="w-3 h-3 text-red-400" />}
                              <span className="text-gray-300">{log.operation_type}</span>
                            </div>
                          </td>
                          <td className="py-2 text-gray-300">
                            {log.processing_time_ms ? `${(log.processing_time_ms / 1000).toFixed(1)}s` : '-'}
                          </td>
                          <td className="py-2">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              log.success 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {log.success ? 'Succès' : 'Échec'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {groupDetails.logs.length > 10 && (
                    <div className="text-center mt-3 text-gray-500 text-sm">
                      Et {groupDetails.logs.length - 10} autres opérations...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}