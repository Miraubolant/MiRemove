import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, Shield, Users, Settings, UserCog, LayoutGrid, ChevronLeft, 
  Bell, Database, Eye, Clock, Loader2, AlertTriangle, CheckCircle, 
  Filter, Search, Download, LifeBuoy
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UserManagement } from './UserManagement';
import { useAdminService } from '../../services/adminService';
import type { UserStats, Group, GroupMember } from '../../types/admin';

interface AdminSettingsModalProps {
  onClose: () => void;
}

export function AdminSettingsModal({ onClose }: AdminSettingsModalProps) {
  // État
  const [users, setUsers] = useState<UserStats[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'groups' | 'users' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const adminService = useAdminService();

  // Stats pour le dashboard
  const stats = useMemo(() => {
    if (!users.length) return { totalUsers: 0, totalProcessed: 0, avgSuccess: 0, avgTime: 0 };
    
    const totalUsers = users.length;
    const totalProcessed = users.reduce((sum, user) => sum + (user.processed_images || 0), 0);
    const totalSuccess = users.reduce((sum, user) => sum + (user.success_count || 0), 0);
    const avgSuccess = totalProcessed > 0 ? (totalSuccess / totalProcessed) * 100 : 0;
    const totalTime = users.reduce((sum, user) => sum + (user.total_processing_time || 0), 0);
    const avgTime = totalProcessed > 0 ? totalTime / totalProcessed : 0;
    
    return { totalUsers, totalProcessed, avgSuccess, avgTime };
  }, [users]);
  
  // Gestionnaires d'événements
  const showNotification = useCallback((message: string, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(null), 3000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, []);

  // Données filtrées
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups;
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  // Chargement des données
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupData(selectedGroup.id);
    }
  }, [selectedGroup]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedUsers = await adminService.loadUsers();
      setUsers(loadedUsers);
      
      const loadedGroups = await adminService.loadGroups();
      setGroups(loadedGroups);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupData = async (groupId: string) => {
    setIsLoading(true);
    try {
      const members = await adminService.loadGroupMembers(groupId);
      setGroupMembers(members);

      const stats = await adminService.loadGroupStats(groupId);
      if (stats) {
        setGroups(prev => prev.map(group => 
          group.id === groupId 
            ? { ...group, ...stats }
            : group
        ));
      }
    } catch (err) {
      console.error('Error loading group data:', err);
      showNotification('Erreur lors du chargement des données du groupe', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (name: string, limit: number) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name,
          image_limit: limit
        }])
        .select()
        .single();

      if (error) throw error;

      setGroups(prev => [...prev, { ...data, member_count: 0, total_processed: 0 }]);
      showNotification(`Groupe "${name}" créé avec succès`);
    } catch (err) {
      console.error('Error creating group:', err);
      showNotification('Erreur lors de la création du groupe', true);
    }
  };

  const handleUpdateGroupLimit = async (groupId: string, newLimit: number) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ image_limit: newLimit })
        .eq('id', groupId);

      if (error) throw error;

      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, image_limit: newLimit }
          : group
      ));

      await loadInitialData();
      showNotification('Limite mise à jour avec succès');
    } catch (err) {
      console.error('Error updating limit:', err);
      showNotification('Erreur lors de la mise à jour de la limite', true);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      setGroups(prev => prev.filter(g => g.id !== groupId));
      setSelectedGroup(null);
      showNotification('Groupe supprimé avec succès');
    } catch (err) {
      console.error('Error deleting group:', err);
      showNotification('Erreur lors de la suppression du groupe', true);
    }
  };

  const handleAddUserToGroup = async (userId: string, email: string) => {
    if (!selectedGroup) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: selectedGroup.id,
          user_id: userId
        }]);

      if (error) throw error;

      await loadGroupData(selectedGroup.id);
      showNotification(`Utilisateur ${email} ajouté au groupe`);
    } catch (err) {
      console.error('Error adding user to group:', err);
      showNotification('Erreur lors de l\'ajout de l\'utilisateur au groupe', true);
    }
  };

  const handleRemoveUserFromGroup = async (userId: string) => {
    if (!selectedGroup) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .match({
          group_id: selectedGroup.id,
          user_id: userId
        });

      if (error) throw error;

      await loadGroupData(selectedGroup.id);
      showNotification('Utilisateur retiré du groupe');
    } catch (err) {
      console.error('Error removing user from group:', err);
      showNotification('Erreur lors du retrait de l\'utilisateur', true);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  // Composants de l'interface
  const Sidebar = () => (
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
        
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
            activeTab === 'settings' 
              ? 'bg-emerald-500/20 text-emerald-500' 
              : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Paramètres</span>
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
  );
  
  const DashboardTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
        <LayoutGrid className="w-6 h-6 text-emerald-500" />
        Tableau de bord
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4 backdrop-blur-sm shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Utilisateurs</p>
            <div className="bg-emerald-500/10 p-1.5 rounded-lg">
              <UserCog className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4 backdrop-blur-sm shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Images traitées</p>
            <div className="bg-blue-500/10 p-1.5 rounded-lg">
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100">{stats.totalProcessed.toLocaleString()}</p>
        </div>
        
        <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4 backdrop-blur-sm shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Taux de réussite</p>
            <div className="bg-purple-500/10 p-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100">{stats.avgSuccess.toFixed(1)}%</p>
        </div>
        
        <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4 backdrop-blur-sm shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">Temps moyen</p>
            <div className="bg-amber-500/10 p-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100">{formatTime(stats.avgTime)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4 backdrop-blur-sm shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Groupes récents
            </h3>
            <button 
              onClick={() => setActiveTab('groups')}
              className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Voir tous
            </button>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 pr-2">
            {groups.slice(0, 5).map(group => (
              <div 
                key={group.id}
                className="bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedGroup(group);
                  setActiveTab('groups');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-200">{group.name}</span>
                  <span className="text-xs bg-slate-600/50 px-2 py-0.5 rounded-full text-gray-300">
                    {group.member_count || 0} utilisateurs
                  </span>
                </div>
                <div className="h-1.5 bg-slate-600/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500"
                    style={{ 
                      width: `${Math.min(((group.total_processed || 0) / group.image_limit) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                  <span>{group.total_processed || 0} / {group.image_limit} images</span>
                  <span>{((group.total_processed || 0) / group.image_limit * 100).toFixed(1)}% utilisé</span>
                </div>
              </div>
            ))}
            
            {groups.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucun groupe créé
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4 backdrop-blur-sm shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-emerald-500" />
              Utilisateurs actifs
            </h3>
            <button 
              onClick={() => setActiveTab('users')}
              className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Voir tous
            </button>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 pr-2">
            {users
              .sort((a, b) => (b.processed_images || 0) - (a.processed_images || 0))
              .slice(0, 5)
              .map(user => (
                <div 
                  key={user.user_id}
                  className="bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-200">{user.email}</span>
                    <span className="text-xs bg-slate-600/50 px-2 py-0.5 rounded-full text-gray-300">
                      {user.processed_images || 0} images
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="text-xs text-gray-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{user.processed_images ? ((user.success_count / user.processed_images) * 100).toFixed(1) : 0}% réussite</span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{formatTime(user.total_processing_time / (user.processed_images || 1))}</span>
                    </div>
                  </div>
                </div>
              ))
            }
            
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucun utilisateur actif
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  const ContentArea = () => {
    // Loading state
    if (isLoading && !users.length && !groups.length) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Chargement des données...</p>
          </div>
        </div>
      );
    }
    
    // Main content based on active tab
    return (
      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Notifications */}
        {error && (
          <div className="fixed top-4 right-4 z-50 bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-500/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}
        
        {/* Active Tab Content */}
        {activeTab === 'dashboard' && <DashboardTab />}
        
        {activeTab === 'users' && (
          <div className="h-full">
            <UserManagement
              users={users}
              groups={groups}
              selectedGroup={selectedGroup}
              groupMembers={groupMembers}
              onCreateGroup={handleCreateGroup}
              onDeleteGroup={handleDeleteGroup}
              onSelectGroup={setSelectedGroup}
              onAddUserToGroup={handleAddUserToGroup}
              onRemoveUserFromGroup={handleRemoveUserFromGroup}
              onUpdateGroupLimit={handleUpdateGroupLimit}
              formatTime={formatTime}
            />
          </div>
        )}
        
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-500" />
                Gestion des groupes
              </h2>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Rechercher un groupe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800/60 border border-gray-700/50 rounded-lg pl-9 pr-4 py-2 text-gray-200 w-60 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-2 bg-slate-800/60 border border-gray-700/50 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <UserManagement
              users={users}
              groups={filteredGroups}
              selectedGroup={selectedGroup}
              groupMembers={groupMembers}
              onCreateGroup={handleCreateGroup}
              onDeleteGroup={handleDeleteGroup}
              onSelectGroup={setSelectedGroup}
              onAddUserToGroup={handleAddUserToGroup}
              onRemoveUserFromGroup={handleRemoveUserFromGroup}
              onUpdateGroupLimit={handleUpdateGroupLimit}
              formatTime={formatTime}
            />
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Settings className="w-6 h-6 text-emerald-500" />
              Paramètres
            </h2>
            
            <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-6 backdrop-blur-sm shadow-md">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Actions administratives</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-4 bg-slate-700/40 rounded-lg border border-gray-600/50 hover:bg-slate-700/70 transition-colors text-left flex items-start gap-3 group">
                  <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Download className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">Exporter les données</h4>
                    <p className="text-xs text-gray-400">Télécharger un rapport complet des utilisateurs et groupes</p>
                  </div>
                </button>
                
                <button className="p-4 bg-slate-700/40 rounded-lg border border-gray-600/50 hover:bg-slate-700/70 transition-colors text-left flex items-start gap-3 group">
                  <div className="bg-purple-500/10 p-2 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Database className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">Sauvegarde</h4>
                    <p className="text-xs text-gray-400">Créer une sauvegarde des données de l'application</p>
                  </div>
                </button>
                
                <button className="p-4 bg-slate-700/40 rounded-lg border border-gray-600/50 hover:bg-slate-700/70 transition-colors text-left flex items-start gap-3 group">
                  <div className="bg-amber-500/10 p-2 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                    <Bell className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">Notifications</h4>
                    <p className="text-xs text-gray-400">Configurer les alertes administratives</p>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-500/10 p-2 rounded-lg">
                    <LifeBuoy className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className="font-medium text-gray-200">Support administrateur</h4>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">
                  Pour toute assistance, veuillez contacter l'équipe de support technique
                  via l'adresse email support@exemple.com
                </p>
                
                <button className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-colors text-sm font-medium">
                  Contacter le support
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-7xl h-[90vh] flex overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full">
          <ContentArea />
        </div>
      </div>
    </div>
  );
}