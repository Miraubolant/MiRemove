import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, Shield, Users, Settings, UserCog, LayoutGrid, ChevronLeft, 
  Bell, Database, Eye, Clock, Loader2, AlertTriangle, CheckCircle, 
  Filter, Search, Download, LifeBuoy, Maximize2, Wand2, Scissors,
  Sparkles, Activity, BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GroupsPage } from './GroupsPage';
import { useAdminService } from '../../services/adminService';
import type { UserStats, Group, GroupMember } from '../../types/admin';

interface AdminSettingsModalProps {
  onClose: () => void;
}

interface ProcessingStats {
  resize: { count: number; time: number };
  ai: { count: number; time: number };
  cropHead: { count: number; time: number };
  all: { count: number; time: number };
}

export function AdminSettingsModal({ onClose }: AdminSettingsModalProps) {
  // État
  const [users, setUsers] = useState<UserStats[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'groups'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const adminService = useAdminService();

  // Stats pour le dashboard
  const stats = useMemo(() => {
    if (!users.length) return { 
      totalUsers: 0,
      processingStats: {
        resize: { count: 0, time: 0 },
        ai: { count: 0, time: 0 },
        cropHead: { count: 0, time: 0 },
        all: { count: 0, time: 0 }
      }
    };
    
    const totalUsers = users.length;
    const processingStats = users.reduce((acc, user) => {
      return {
        resize: {
          count: acc.resize.count + (user.resize_count || 0),
          time: acc.resize.time + (user.resize_processing_time || 0)
        },
        ai: {
          count: acc.ai.count + (user.ai_count || 0),
          time: acc.ai.time + (user.ai_processing_time || 0)
        },
        cropHead: {
          count: acc.cropHead.count + (user.crop_head_count || 0),
          time: acc.cropHead.time + (user.crop_head_processing_time || 0)
        },
        all: {
          count: acc.all.count + (user.all_processing_count || 0),
          time: acc.all.time + (user.all_processing_time || 0)
        }
      };
    }, {
      resize: { count: 0, time: 0 },
      ai: { count: 0, time: 0 },
      cropHead: { count: 0, time: 0 },
      all: { count: 0, time: 0 }
    });
    
    return { totalUsers, processingStats };
  }, [users]);

  // Calculate group stats including all processing types
  const getGroupTotalProcessed = (group: Group) => {
    const groupUsers = users.filter(user => 
      groupMembers.some(member => 
        member.user_id === user.user_id && member.group_id === group.id
      )
    );

    return groupUsers.reduce((total, user) => {
      return total + 
        (user.resize_count || 0) +
        (user.ai_count || 0) +
        (user.crop_head_count || 0) +
        (user.all_processing_count || 0);
    }, 0);
  };

  // Chargement des données
  useEffect(() => {
    loadInitialData();
  }, []);

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
      setSuccessMessage(`Groupe "${name}" créé avec succès`);
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Erreur lors de la création du groupe');
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
      setSuccessMessage('Groupe supprimé avec succès');
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Erreur lors de la suppression du groupe');
    }
  };

  const handleAddMember = async (groupId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: userId
        }]);

      if (error) throw error;
      await loadInitialData();
      setSuccessMessage('Membre ajouté avec succès');
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Erreur lors de l\'ajout du membre');
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .match({
          group_id: groupId,
          user_id: userId
        });

      if (error) throw error;
      await loadInitialData();
      setSuccessMessage('Membre retiré avec succès');
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Erreur lors du retrait du membre');
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const StatCard = ({ 
    icon: Icon, 
    title, 
    count, 
    avgTime,
    color = "text-emerald-500",
    bgColor = "bg-emerald-500/10"
  }: { 
    icon: React.ElementType;
    title: string;
    count: number;
    avgTime: number;
    color?: string;
    bgColor?: string;
  }) => (
    <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4 backdrop-blur-sm shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${bgColor} p-2 rounded-lg`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="text-sm text-gray-300 font-medium">{title}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-semibold text-white">{count}</p>
          <p className="text-xs text-gray-500">images traitées</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{formatTime(avgTime)}</p>
          <p className="text-xs text-gray-500">temps moyen</p>
        </div>
      </div>
    </div>
  );

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
          {activeTab === 'dashboard' ? (
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-emerald-500" />
                  Statistiques globales
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    icon={Maximize2}
                    title="Redimensionnement"
                    count={stats.processingStats.resize.count}
                    avgTime={stats.processingStats.resize.count > 0 ? stats.processingStats.resize.time / stats.processingStats.resize.count : 0}
                    color="text-blue-400"
                    bgColor="bg-blue-500/10"
                  />
                  
                  <StatCard 
                    icon={Wand2}
                    title="Traitement IA"
                    count={stats.processingStats.ai.count}
                    avgTime={stats.processingStats.ai.count > 0 ? stats.processingStats.ai.time / stats.processingStats.ai.count : 0}
                    color="text-purple-400"
                    bgColor="bg-purple-500/10"
                  />
                  
                  <StatCard 
                    icon={Scissors}
                    title="Suppression tête"
                    count={stats.processingStats.cropHead.count}
                    avgTime={stats.processingStats.cropHead.count > 0 ? stats.processingStats.cropHead.time / stats.processingStats.cropHead.count : 0}
                    color="text-red-400"
                    bgColor="bg-red-500/10"
                  />
                  
                  <StatCard 
                    icon={Sparkles}
                    title="Tous les traitements"
                    count={stats.processingStats.all.count}
                    avgTime={stats.processingStats.all.count > 0 ? stats.processingStats.all.time / stats.processingStats.all.count : 0}
                    color="text-amber-400"
                    bgColor="bg-amber-500/10"
                  />
                </div>

                {/* Users and Groups Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Users Section */}
                  <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-6 backdrop-blur-sm shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-emerald-500" />
                        Utilisateurs actifs
                      </h3>
                      <span className="text-sm text-gray-400">{users.length} utilisateurs</span>
                    </div>

                    <div className="space-y-4">
                      {users
                        .sort((a, b) => {
                          const totalA = (a.resize_count || 0) + (a.ai_count || 0) + 
                                       (a.crop_head_count || 0) + (a.all_processing_count || 0);
                          const totalB = (b.resize_count || 0) + (b.ai_count || 0) + 
                                       (b.crop_head_count || 0) + (b.all_processing_count || 0);
                          return totalB - totalA;
                        })
                        .slice(0, 5)
                        .map(user => {
                          const totalImages = (user.resize_count || 0) + 
                                           (user.ai_count || 0) + 
                                           (user.crop_head_count || 0) + 
                                           (user.all_processing_count || 0);
                          
                          return (
                            <div 
                              key={user.id}
                              className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-200">{user.email}</span>
                                <span className="text-xs bg-slate-600/50 px-2 py-0.5 rounded-full text-gray-300">
                                  {totalImages} images
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                  <Maximize2 className="w-3 h-3 text-blue-400" />
                                  <span>{user.resize_count || 0}</span>
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                  <Wand2 className="w-3 h-3 text-purple-400" />
                                  <span>{user.ai_count || 0}</span>
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                  <Scissors className="w-3 h-3 text-red-400" />
                                  <span>{user.crop_head_count || 0}</span>
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-400" />
                                  <span>{user.all_processing_count || 0}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Groups Section */}
                  <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-6 backdrop-blur-sm shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-500" />
                        Groupes actifs
                      </h3>
                      <span className="text-sm text-gray-400">{groups.length} groupes</span>
                    </div>

                    <div className="space-y-4">
                      {groups.slice(0, 5).map(group => {
                        const totalProcessed = getGroupTotalProcessed(group);
                        const usagePercentage = Math.min((totalProcessed / group.image_limit) * 100, 100);
                        
                        return (
                          <div 
                            key={group.id}
                            className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-200">{group.name}</span>
                              <span className="text-xs bg-slate-600/50 px-2 py-0.5 rounded-full text-gray-300">
                                {group.member_count || 0} membres
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="h-1.5 bg-slate-600/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                  style={{ width: `${usagePercentage}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>{totalProcessed} / {group.image_limit} images</span>
                                <span>{usagePercentage.toFixed(1)}% utilisé</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <GroupsPage
              groups={groups}
              onCreateGroup={handleCreateGroup}
              onDeleteGroup={handleDeleteGroup}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />
          )}
        </div>
      </div>
    </div>
  );
}