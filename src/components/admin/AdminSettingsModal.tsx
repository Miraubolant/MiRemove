import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Users, Settings, UserCog, LayoutGrid, ChevronLeft, 
  Bell, Database, Eye, Clock, Loader2, AlertTriangle, CheckCircle, 
  Filter, Search, Download, LifeBuoy, Crown, Maximize2, Wand2, Scissors,
  Sparkles, UserPlus, Trash2, Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UserDetailsModal } from './UserDetailsModal';
import type { UserStats, Group } from '../../types/admin';

interface AdminSettingsModalProps {
  onClose: () => void;
}

export function AdminSettingsModal({ onClose }: AdminSettingsModalProps) {
  // State
  const [users, setUsers] = useState<UserStats[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'groups'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load users with all stats
      const { data: userData, error: userError } = await supabase
        .from('user_stats')
        .select('*')
        .order('email');

      if (userError) throw userError;
      setUsers(userData || []);

      // Load groups with operation stats
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (groupError) throw groupError;

      // Load operation stats for each group
      const groupsWithStats = await Promise.all(groupData.map(async (group) => {
        const { data: stats } = await supabase
          .rpc('get_group_operation_stats', { p_group_id: group.id });
        
        return {
          ...group,
          operations: stats
        };
      }));

      setGroups(groupsWithStats || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{ name: newGroupName }])
        .select()
        .single();

      if (error) throw error;

      setGroups(prev => [...prev, data]);
      setNewGroupName('');
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Erreur lors de la création du groupe');
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('user_stats')
        .update({ is_admin: !isCurrentlyAdmin })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, is_admin: !isCurrentlyAdmin }
          : user
      ));
    } catch (err) {
      console.error('Error toggling admin status:', err);
      setError('Erreur lors de la modification des droits administrateur');
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
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Erreur lors de la suppression du groupe');
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  // Filter data based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total stats
  const totalStats = {
    users: users.length,
    groups: groups.length,
    processedImages: users.reduce((sum, user) => sum + user.processed_images, 0),
    successRate: users.reduce((sum, user) => sum + user.success_count, 0) / 
      users.reduce((sum, user) => sum + user.processed_images, 0) * 100 || 0
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-7xl h-[90vh] flex overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-800/50 flex flex-col h-full">
          <div className="p-4 border-b border-gray-800/50">
            <div className="bg-emerald-500/10 p-3 rounded-lg inline-flex mb-2">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-100">
              Administration
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Gestion des utilisateurs et groupes
            </p>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-emerald-500/20 text-emerald-500' 
                  : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-200'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span>Tableau de bord</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'users' 
                  ? 'bg-emerald-500/20 text-emerald-500' 
                  : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-200'
              }`}
            >
              <UserCog className="w-5 h-5" />
              <span>Utilisateurs</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('groups')}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'groups' 
                  ? 'bg-emerald-500/20 text-emerald-500' 
                  : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Groupes</span>
            </button>
          </nav>
          
          <div className="p-4 border-t border-gray-800/50">
            <button 
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 text-gray-300 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour à l'application</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full">
          <div className="p-6 overflow-y-auto">
            {/* Loading State */}
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Chargement des données...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                {/* Dashboard */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                      <LayoutGrid className="w-6 h-6 text-emerald-500" />
                      Tableau de bord
                    </h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-gray-400 text-sm">Utilisateurs</p>
                          <div className="bg-emerald-500/10 p-1.5 rounded-lg">
                            <UserCog className="w-4 h-4 text-emerald-500" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-100">{totalStats.users}</p>
                      </div>

                      <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-gray-400 text-sm">Groupes</p>
                          <div className="bg-blue-500/10 p-1.5 rounded-lg">
                            <Users className="w-4 h-4 text-blue-500" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-100">{totalStats.groups}</p>
                      </div>

                      <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-gray-400 text-sm">Images traitées</p>
                          <div className="bg-purple-500/10 p-1.5 rounded-lg">
                            <Eye className="w-4 h-4 text-purple-500" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-100">{totalStats.processedImages}</p>
                      </div>

                      <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-gray-400 text-sm">Taux de réussite</p>
                          <div className="bg-amber-500/10 p-1.5 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-amber-500" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-100">{totalStats.successRate.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Top Users and Groups */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Top Users */}
                      <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                          <UserCog className="w-5 h-5 text-emerald-500" />
                          Top Utilisateurs
                        </h3>
                        <div className="space-y-3">
                          {users
                            .sort((a, b) => b.processed_images - a.processed_images)
                            .slice(0, 5)
                            .map(user => (
                              <div 
                                key={user.id} 
                                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
                                onClick={() => setSelectedUser(user)}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-200">{user.email}</span>
                                  {user.is_admin && (
                                    <span className="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                      <Crown className="w-3 h-3" />
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <span className="text-gray-400">{user.processed_images} images</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Top Groups */}
                      <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-emerald-500" />
                          Top Groupes
                        </h3>
                        <div className="space-y-3">
                          {groups
                            .sort((a, b) => {
                              const aTotal = Object.values(a.operations || {}).reduce((sum, op: any) => sum + op.count, 0);
                              const bTotal = Object.values(b.operations || {}).reduce((sum, op: any) => sum + op.count, 0);
                              return bTotal - aTotal;
                            })
                            .slice(0, 5)
                            .map(group => {
                              const totalImages = Object.values(group.operations || {}).reduce((sum, op: any) => sum + op.count, 0);
                              return (
                                <div key={group.id} className="p-3 bg-slate-700/30 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-200">{group.name}</span>
                                    <span className="text-gray-400">{totalImages} images</span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    <div className="text-xs bg-blue-500/10 text-blue-400 p-1 rounded flex items-center gap-1">
                                      <Maximize2 className="w-3 h-3" />
                                      {group.operations?.resize.count || 0}
                                    </div>
                                    <div className="text-xs bg-purple-500/10 text-purple-400 p-1 rounded flex items-center gap-1">
                                      <Wand2 className="w-3 h-3" />
                                      {group.operations?.ai.count || 0}
                                    </div>
                                    <div className="text-xs bg-red-500/10 text-red-400 p-1 rounded flex items-center gap-1">
                                      <Scissors className="w-3 h-3" />
                                      {group.operations?.crop_head.count || 0}
                                    </div>
                                    <div className="text-xs bg-amber-500/10 text-amber-400 p-1 rounded flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      {group.operations?.all.count || 0}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users List */}
                {activeTab === 'users' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                        <UserCog className="w-6 h-6 text-emerald-500" />
                        Utilisateurs
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-800/60 border border-gray-700/50 rounded-lg pl-9 pr-4 py-2 text-gray-200 w-60 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredUsers.map(user => (
                        <div 
                          key={user.id} 
                          className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4 cursor-pointer hover:bg-slate-800/60 transition-colors"
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-emerald-500/10 p-2 rounded-lg">
                                <UserCog className="w-5 h-5 text-emerald-500" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-200">{user.email}</span>
                                  {user.is_admin && (
                                    <span className="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                      <Crown className="w-3 h-3" />
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                  {user.processed_images} images traitées
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleAdmin(user.user_id, user.is_admin);
                              }}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                user.is_admin
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              }`}
                            >
                              {user.is_admin ? 'Retirer admin' : 'Rendre admin'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups List */}
                {activeTab === 'groups' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                        <Users className="w-6 h-6 text-emerald-500" />
                        Groupes
                      </h2>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-800/60 border border-gray-700/50 rounded-lg pl-9 pr-4 py-2 text-gray-200 w-60 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Create Group Form */}
                    <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Nom du nouveau groupe"
                            className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                        <button
                          onClick={handleCreateGroup}
                          disabled={!newGroupName.trim()}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Créer le groupe</span>
                        </button>
                      </div>
                    </div>

                    {/* Groups List */}
                    <div className="space-y-4">
                      {filteredGroups.map(group => {
                        const totalImages = Object.values(group.operations || {}).reduce((sum, op: any) => sum + op.count, 0);
                        return (
                          <div key={group.id} className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-emerald-500/10 p-2 rounded-lg">
                                  <Users className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-medium text-gray-200">{group.name}</h3>
                                  <p className="text-sm text-gray-400">{totalImages} images traitées</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteGroup(group.id)}
                                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Supprimer</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                              <div className="bg-slate-700/30 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Maximize2 className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm text-gray-300">Redimensionnement</span>
                                </div>
                                <p className="text-lg font-semibold text-blue-400">
                                  {group.operations?.resize.count || 0}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatTime(group.operations?.resize.time || 0)}
                                </p>
                              </div>

                              <div className="bg-slate-700/30 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Wand2 className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm text-gray-300">Traitement IA</span>
                                </div>
                                <p className="text-lg font-semibold text-purple-400">
                                  {group.operations?.ai.count || 0}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatTime(group.operations?.ai.time || 0)}
                                </p>
                              </div>

                              <div className="bg-slate-700/30 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Scissors className="w-4 h-4 text-red-400" />
                                  <span className="text-sm text-gray-300">Suppression tête</span>
                                </div>
                                <p className="text-lg font-semibold text-red-400">
                                  {group.operations?.crop_head.count || 0}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatTime(group.operations?.crop_head.time || 0)}
                                </p>
                              </div>

                              <div className="bg-slate-700/30 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-4 h-4 text-amber-400" />
                                  <span className="text-sm text-gray-300">Tous les traitements</span>
                                </div>
                                <p className="text-lg font-semibold text-amber-400">
                                  {group.operations?.all.count || 0}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatTime(group.operations?.all.time || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          formatTime={formatTime}
        />
      )}
    </div>
  );
}