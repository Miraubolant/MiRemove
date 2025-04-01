import React, { useState, useEffect } from 'react';
import { X, UserCog, Maximize2, Wand2, Scissors, Sparkles, Clock, Users, Crown, UserPlus, UserMinus, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { UserStats, Group } from '../../types/admin';

interface UserDetailsModalProps {
  user: UserStats;
  onClose: () => void;
  formatTime: (seconds: number) => string;
}

export function UserDetailsModal({ user, onClose, formatTime }: UserDetailsModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      // Load all groups
      const { data: allGroups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (groupsError) throw groupsError;

      // Load user's group memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.user_id);

      if (membershipsError) throw membershipsError;

      const userGroupIds = new Set(memberships?.map(m => m.group_id));
      
      // Split groups into user's groups and available groups
      const userGroups = allGroups.filter(g => userGroupIds.has(g.id));
      const availableGroups = allGroups.filter(g => !userGroupIds.has(g.id));

      setGroups(availableGroups);
      setUserGroups(userGroups);
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: user.user_id
        }]);

      if (error) throw error;

      // Update local state
      const group = groups.find(g => g.id === groupId);
      if (group) {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        setUserGroups(prev => [...prev, group]);
      }
    } catch (err) {
      console.error('Error adding user to group:', err);
    }
  };

  const removeFromGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .match({
          group_id: groupId,
          user_id: user.user_id
        });

      if (error) throw error;

      // Update local state
      const group = userGroups.find(g => g.id === groupId);
      if (group) {
        setUserGroups(prev => prev.filter(g => g.id !== groupId));
        setGroups(prev => [...prev, group]);
      }
    } catch (err) {
      console.error('Error removing user from group:', err);
    }
  };

  const operations = [
    {
      name: 'Redimensionnement',
      icon: Maximize2,
      count: user.resize_count,
      time: user.resize_processing_time,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      name: 'Traitement IA',
      icon: Wand2,
      count: user.ai_count,
      time: user.ai_processing_time,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      name: 'Suppression tête',
      icon: Scissors,
      count: user.crop_head_count,
      time: user.crop_head_processing_time,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    {
      name: 'Tous les traitements',
      icon: Sparkles,
      count: user.all_processing_count,
      time: user.all_processing_time,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2.5 rounded-lg">
                <UserCog className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-gray-200">
                    {user.email}
                  </h3>
                  {user.is_admin && (
                    <span className="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {user.processed_images} images traitées
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-gray-300">Temps moyen</span>
              </div>
              <p className="text-xl font-semibold text-emerald-500">
                {formatTime(user.total_processing_time / user.processed_images)}
              </p>
              <p className="text-xs text-gray-400 mt-1">par image</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-gray-300">Taux de réussite</span>
              </div>
              <p className="text-xl font-semibold text-emerald-500">
                {((user.success_count / user.processed_images) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {user.success_count} réussies sur {user.processed_images}
              </p>
            </div>
          </div>

          {/* Group Management */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              Groupes
            </h4>

            {/* User's Groups */}
            {userGroups.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-400 mb-2">Groupes actuels :</p>
                {userGroups.map(group => (
                  <div key={group.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-gray-700/50">
                    <span className="text-sm text-gray-300">{group.name}</span>
                    <button
                      onClick={() => removeFromGroup(group.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Retirer du groupe"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Available Groups */}
            {groups.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 mb-2">Ajouter à un groupe :</p>
                {groups.map(group => (
                  <div key={group.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-gray-700/50">
                    <span className="text-sm text-gray-300">{group.name}</span>
                    <button
                      onClick={() => addToGroup(group.id)}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Ajouter au groupe"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {loading && (
              <div className="text-center py-4 text-gray-400">
                Chargement des groupes...
              </div>
            )}

            {!loading && groups.length === 0 && userGroups.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                Aucun groupe disponible
              </div>
            )}
          </div>

          {/* Operations Stats */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Statistiques par type d'opération
            </h4>
            {operations.map((op, index) => {
              const OpIcon = op.icon;
              return (
                <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${op.bgColor} p-2 rounded-lg`}>
                        <OpIcon className={`w-4 h-4 ${op.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{op.name}</p>
                        <p className="text-xs text-gray-400">{op.count} images traitées</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${op.color}`}>
                        {formatTime(op.time / (op.count || 1))}
                      </p>
                      <p className="text-xs text-gray-400">temps moyen</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}