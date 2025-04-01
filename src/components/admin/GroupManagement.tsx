import React, { useState } from 'react';
import { 
  Plus, AlertTriangle, Users, Trash2, Activity, 
  Maximize2, Wand2, Scissors, Sparkles, UserPlus, Search,
  X, Shield, ToggleLeft, ToggleRight
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
  onAddMember,
  onRemoveMember
}: GroupManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLimit, setNewGroupLimit] = useState(10000);
  const [users, setUsers] = useState<User[]>([]);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('user_stats')
        .select('user_id, email, is_admin')
        .order('email');

      if (usersError) throw usersError;

      setUsers(usersData.map(user => ({
        id: user.user_id,
        email: user.email,
        is_admin: user.is_admin
      })));
    } catch (err) {
      console.error('Error loading users:', err);
      setLocalError('Erreur lors du chargement des utilisateurs');
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      // First get the group members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      if (!membersData?.length) {
        setGroupMembers([]);
        return;
      }

      // Then get the user details for those members
      const userIds = membersData.map(member => member.user_id);
      const { data: userData, error: userError } = await supabase
        .from('user_stats')
        .select('user_id, email, is_admin')
        .in('user_id', userIds);

      if (userError) throw userError;

      setGroupMembers(userData.map(user => ({
        id: user.user_id,
        email: user.email,
        is_admin: user.is_admin
      })));
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

  const handleCreateGroupSubmit = async () => {
    if (!newGroupName || newGroupLimit < 0) return;
    await onCreateGroup(newGroupName, newGroupLimit);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupLimit(10000);
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
                      onClick={() => handleShowAddMember(group)}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Ajouter un membre"
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
                
                <div className="space-y-2">
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      style={{ width: `${Math.min((group.total_processed || 0) / group.image_limit * 100, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span>{group.total_processed || 0} / {group.image_limit} images</span>
                    </div>
                    <div className="text-gray-500">
                      {group.member_count || 0} membre{(group.member_count || 0) > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Operation stats */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className="text-xs flex items-center gap-1 text-gray-500">
                      <Maximize2 className="w-3 h-3 text-blue-400" />
                      <span>{group.stats?.resize?.count || 0}</span>
                    </div>
                    <div className="text-xs flex items-center gap-1 text-gray-500">
                      <Wand2 className="w-3 h-3 text-purple-400" />
                      <span>{group.stats?.ai?.count || 0}</span>
                    </div>
                    <div className="text-xs flex items-center gap-1 text-gray-500">
                      <Scissors className="w-3 h-3 text-red-400" />
                      <span>{group.stats?.crop_head?.count || 0}</span>
                    </div>
                    <div className="text-xs flex items-center gap-1 text-gray-500">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{group.stats?.all?.count || 0}</span>
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
                  Ajouter des membres à {selectedGroup.name}
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
                            onClick={() => onRemoveMember(selectedGroup.id, member.id)}
                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-colors"
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
    </div>
  );
}