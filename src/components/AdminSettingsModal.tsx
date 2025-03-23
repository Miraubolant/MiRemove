import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, CheckCircle2, Timer, BarChart3, Users, Shield, Search, UserPlus, UserMinus, Settings, Edit2, Save, AlertTriangle, Filter, SlidersHorizontal, UserCog, LayoutGrid, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

interface UserStats {
  id: string;
  user_id: string;
  email: string;
  processed_images: number;
  success_count: number;
  failure_count: number;
  total_processing_time: number;
  is_admin: boolean;
}

interface Group {
  id: string;
  name: string;
  image_limit: number;
  member_count?: number;
  total_processed?: number;
  stats?: {
    success_rate?: number;
    avg_processing_time?: number;
    total_processing_time?: number;
  };
}

interface GroupMember {
  id: string;
  user_id: string;
  email: string;
  processed_images?: number;
  success_rate?: number;
  avg_processing_time?: number;
  total_processing_time?: number;
}

interface AdminSettingsModalProps {
  onClose: () => void;
}

interface UserSettingsPopupProps {
  user: UserStats;
  onClose: () => void;
  onSuccess: () => void;
}

function UserSettingsPopup({ user, onClose, onSuccess }: UserSettingsPopupProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggleAdmin() {
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          is_admin: !user.is_admin,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de la modification des droits administrateur');
      console.error('Error updating admin rights:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">
                Paramètres de {user.email}
              </h3>
            </div>
            <button onClick={onClose} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Droits administrateur
              </label>
              <button
                onClick={handleToggleAdmin}
                disabled={saving}
                className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                <Shield className="w-5 h-5" />
                <span>
                  {saving ? 'Modification...' : user.is_admin ? 'Retirer les droits admin' : 'Donner les droits admin'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSettingsModal({ onClose }: AdminSettingsModalProps) {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLimit, setNewGroupLimit] = useState(10000);
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [editingLimitValue, setEditingLimitValue] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'email' | 'processed' | 'success'>('email');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'groups' | 'members'>('groups');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupMembers(selectedGroup.id);
      loadGroupStats(selectedGroup.id);
    }
  }, [selectedGroup]);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }

  async function loadGroups() {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (error) throw error;

      const groupsWithStats = await Promise.all(data.map(async (group) => {
        const stats = await loadGroupStats(group.id);
        return {
          ...group,
          ...stats
        };
      }));

      setGroups(groupsWithStats);
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  }

  async function loadGroupMembers(groupId: string) {
    try {
      const { data: groupStats, error: statsError } = await supabase
        .rpc('get_group_stats_with_users', { p_group_id: groupId });

      if (statsError) throw statsError;

      const userStats = groupStats.user_stats || [];
      setGroupMembers(userStats);
    } catch (err) {
      console.error('Error loading group members:', err);
    }
  }

  async function loadGroupStats(groupId: string) {
    try {
      const { data: stats, error } = await supabase
        .rpc('get_group_stats', { p_group_id: groupId });

      if (error) throw error;
      return stats;
    } catch (err) {
      console.error('Error loading group stats:', err);
      return null;
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName || newGroupLimit < 0) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name: newGroupName,
          image_limit: newGroupLimit
        }])
        .select()
        .single();

      if (error) throw error;

      setGroups(prev => [...prev, { ...data, member_count: 0, total_processed: 0 }]);
      setNewGroupName('');
      setNewGroupLimit(10000);
    } catch (err) {
      console.error('Error creating group:', err);
    }
  }

  async function handleUpdateLimit(groupId: string) {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ image_limit: editingLimitValue })
        .eq('id', groupId);

      if (error) throw error;

      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, image_limit: editingLimitValue }
          : group
      ));

      setEditingLimit(null);
      await loadGroups();
    } catch (err) {
      console.error('Error updating limit:', err);
    }
  }

  async function handleAddUserToGroup(userId: string) {
    if (!selectedGroup) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: selectedGroup.id,
          user_id: userId
        }]);

      if (error) throw error;

      await loadGroupMembers(selectedGroup.id);
    } catch (err) {
      console.error('Error adding user to group:', err);
    }
  }

  async function handleRemoveUserFromGroup(userId: string) {
    if (!selectedGroup) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', selectedGroup.id)
        .eq('user_id', userId);

      if (error) throw error;

      await loadGroupMembers(selectedGroup.id);
    } catch (err) {
      console.error('Error removing user from group:', err);
    }
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const filteredUsers = users
    .filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'email') {
        return sortOrder === 'asc' 
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      }
      if (sortBy === 'processed') {
        return sortOrder === 'asc'
          ? a.processed_images - b.processed_images
          : b.processed_images - a.processed_images;
      }
      // success rate
      const aRate = a.processed_images > 0 ? (a.success_count / a.processed_images) * 100 : 0;
      const bRate = b.processed_images > 0 ? (b.success_count / b.processed_images) * 100 : 0;
      return sortOrder === 'asc' ? aRate - bRate : bRate - aRate;
    });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-6xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-200">
              Administration
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'groups'
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                <span>Groupes</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'members'
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4" />
                <span>Membres</span>
              </div>
            </button>
            <button onClick={onClose} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="w-full bg-slate-800/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-colors ${
                showFilters
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                  : 'border-gray-700/50 text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-slate-800/50 rounded-xl border border-gray-700/50 space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-300">Trier par</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSortBy('email');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    sortBy === 'email'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
                  }`}
                >
                  Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => {
                    setSortBy('processed');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    sortBy === 'processed'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
                  }`}
                >
                  Images traitées {sortBy === 'processed' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => {
                    setSortBy('success');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    sortBy === 'success'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
                  }`}
                >
                  Taux de réussite {sortBy === 'success' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'groups' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Groups List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-200">Groupes</h3>
                  <span className="text-sm text-gray-400">{groups.length} groupes</span>
                </div>
                
                {/* Create Group Form */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">
                      Nom du groupe
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Ex: Marketing"
                      className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">
                      Limite d'images
                    </label>
                    <input
                      type="number"
                      value={newGroupLimit}
                      onChange={(e) => setNewGroupLimit(parseInt(e.target.value) || 0)}
                      placeholder="Ex: 10000"
                      className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>

                  <button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName || newGroupLimit < 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer le groupe</span>
                  </button>
                </div>

                {/* Groups List */}
                <div className="space-y-2">
                  {groups.map(group => (
                    <div
                      key={group.id}
                      className={`bg-slate-800/50 rounded-xl border transition-all duration-300 ${
                        selectedGroup?.id === group.id
                          ? 'border-emerald-500/50'
                          : 'border-gray-700/50 hover:border-gray-600/50'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium text-gray-200">{group.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              {group.member_count || 0} membres
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroupExpanded(group.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
                            >
                              {expandedGroups.includes(group.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                              style={{ 
                                width: `${Math.min(((group.total_processed || 0) / group.image_limit) * 100, 100)}%` 
                              }}
                            />
                          </div>
                          <div className="mt-1 text-sm text-gray-400">
                            {group.total_processed || 0} / {group.image_limit} images
                          </div>
                        </div>

                        {expandedGroups.includes(group.id) && (
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{group.stats?.success_rate?.toFixed(1)}% réussite</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Timer className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{formatTime(group.stats?.avg_processing_time || 0)}</span>
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group Details & Members */}
              <div className="lg:col-span-2">
                {selectedGroup ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                          <Settings className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-200">
                          {selectedGroup.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
                            // Handle group deletion
                          }
                        }}
                        className="text-red-500 hover:text-red-400 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>

                    {/* Group Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                            <h4 className="text-sm font-medium text-gray-400">Limite d'images</h4>
                          </div>
                          {editingLimit === selectedGroup.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editingLimitValue}
                                onChange={(e) => setEditingLimitValue(parseInt(e.target.value) || 0)}
                                className="w-24 bg-slate-700/50 border border-gray-600/50 rounded px-2 py-1 text-sm"
                                min="0"
                              />
                              <button
                                onClick={() => handleUpdateLimit(selectedGroup.id)}
                                className="p-1 text-emerald-500 hover:text-emerald-400 rounded transition-colors"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingLimit(selectedGroup.id);
                                setEditingLimitValue(selectedGroup.image_limit);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-2xl font-semibold text-emerald-500">
                          {selectedGroup.image_limit}
                        </p>
                      </div>

                      <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                        <div className="flex items-center gap-2 mb-2">
                          <Timer className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                          <h4 className="text-sm font-medium text-gray-400">Temps moyen</h4>
                        </div>
                        <p className="text-2xl font-semibold text-emerald-500">
                          {formatTime(selectedGroup.stats?.avg_processing_time || 0)}
                        </p>
                      </div>

                      <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                          <h4 className="text-sm font-medium text-gray-400">Taux de réussite</h4>
                        </div>
                        <p className="text-2xl font-semibold text-emerald-500">
                          {selectedGroup.stats?.success_rate?.toFixed(1) || 0}%
                        </p>
                      </div>
                    </div>

                    {/* Members List */}
                    <div className="bg-slate-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                      <div className="p-4 border-b border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-400">
                            Membres du groupe
                          </h4>
                          <span className="text-xs text-gray-500">
                            {groupMembers.length} membres
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-700/50">
                        {filteredUsers.map(user => {
                          const isMember = groupMembers.some(m => m.user_id === user.user_id);
                          return (
                            <div
                              key={user.id}
                              className="p-4 hover:bg-slate-700/30 transition-colors"
                            >
                              
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-300">{user.email}</span>
                                  {user.is_admin && (
                                    <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setSelectedUser(user)}
                                    className="text-gray-400 hover:text-gray-300 p-1 hover:bg-white/5 rounded transition-colors"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => isMember 
                                      ? handleRemoveUserFromGroup(user.user_id)
                                      : handleAddUserToGroup(user.user_id)
                                    }
                                    className={`p-1 rounded transition-colors ${
                                      isMember
                                        ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
                                        : 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                                    }`}
                                  >
                                    {isMember ? (
                                      <UserMinus className="w-4 h-4" />
                                    ) : (
                                      <UserPlus className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                  <BarChart3 className="w-3.5 h-3.5" />
                                  <span>{user.processed_images}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>
                                    {user.processed_images > 0
                                      ? ((user.success_count / user.processed_images) * 100).toFixed(1)
                                      : '0.0'}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                  <Timer className="w-3.5 h-3.5" />
                                  <span>
                                    {formatTime(
                                      user.processed_images > 0
                                        ? user.total_processing_time / user.processed_images
                                        : 0
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                    <Settings className="w-12 h-12 mb-4 text-gray-500" />
                    <p>Sélectionnez un groupe pour voir ses détails</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Members List */}
              <div className="bg-slate-800/50 rounded-xl border border-gray-700/50">
                <div className="p-4 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-400">
                      Tous les membres
                    </h4>
                    <span className="text-xs text-gray-500">
                      {users.length} utilisateurs
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-700/50">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-300">{user.email}</span>
                          {user.is_admin && (
                            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-gray-400 hover:text-gray-300 p-1 hover:bg-white/5 rounded transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>{user.processed_images}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {user.processed_images > 0
                              ? ((user.success_count / user.processed_images) * 100).toFixed(1)
                              : '0.0'}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Timer className="w-3.5 h-3.5" />
                          <span>
                            {formatTime(
                              user.processed_images > 0
                                ? user.total_processing_time / user.processed_images
                                : 0
                            )}
                          </span>
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

      {selectedUser && (
        <UserSettingsPopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={loadUsers}
        />
      )}
    </div>
  );
}