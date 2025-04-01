import React, { useState } from 'react';
import { 
  Users, Plus, Search, Filter, Trash2, Settings2, 
  UserPlus, UserMinus, Shield, Activity, BarChart3,
  Clock, CheckCircle2, AlertTriangle, Maximize2, Wand2,
  Scissors, Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Group {
  id: string;
  name: string;
  image_limit: number;
  member_count?: number;
  total_processed?: number;
  created_at: string;
}

interface GroupMember {
  id: string;
  user_id: string;
  email: string;
  processed_images: number;
  success_rate: number;
  avg_processing_time: number;
  resize_count: number;
  ai_count: number;
  crop_head_count: number;
  all_processing_count: number;
  resize_processing_time: number;
  ai_processing_time: number;
  crop_head_processing_time: number;
  all_processing_time: number;
}

interface GroupsPageProps {
  groups: Group[];
  onCreateGroup: (name: string, limit: number) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onAddMember: (groupId: string, userId: string) => Promise<void>;
  onRemoveMember: (groupId: string, userId: string) => Promise<void>;
}

export function GroupsPage({
  groups,
  onCreateGroup,
  onDeleteGroup,
  onAddMember,
  onRemoveMember
}: GroupsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLimit, setNewGroupLimit] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load group members when a group is selected
  const loadGroupMembers = async (groupId: string) => {
    try {
      setLoading(true);
      const { data: members, error } = await supabase
        .rpc('get_group_stats_with_users', { p_group_id: groupId });

      if (error) throw error;
      setGroupMembers(members.user_stats || []);
    } catch (err) {
      console.error('Error loading group members:', err);
      setError('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || newGroupLimit < 0) return;
    
    try {
      await onCreateGroup(newGroupName, newGroupLimit);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupLimit(10000);
    } catch (err) {
      setError('Erreur lors de la création du groupe');
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  // Calculate total processed images for a group including all types of processing
  const getGroupTotalProcessed = (members: GroupMember[]): number => {
    return members.reduce((total, member) => {
      return total + 
        (member.resize_count || 0) +
        (member.ai_count || 0) +
        (member.crop_head_count || 0) +
        (member.all_processing_count || 0);
    }, 0);
  };

  // Get processing stats for the selected group
  const getGroupProcessingStats = (members: GroupMember[]) => {
    return members.reduce((stats, member) => {
      return {
        resize: {
          count: stats.resize.count + (member.resize_count || 0),
          time: stats.resize.time + (member.resize_processing_time || 0)
        },
        ai: {
          count: stats.ai.count + (member.ai_count || 0),
          time: stats.ai.time + (member.ai_processing_time || 0)
        },
        cropHead: {
          count: stats.cropHead.count + (member.crop_head_count || 0),
          time: stats.cropHead.time + (member.crop_head_processing_time || 0)
        },
        all: {
          count: stats.all.count + (member.all_processing_count || 0),
          time: stats.all.time + (member.all_processing_time || 0)
        }
      };
    }, {
      resize: { count: 0, time: 0 },
      ai: { count: 0, time: 0 },
      cropHead: { count: 0, time: 0 },
      all: { count: 0, time: 0 }
    });
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Groups List */}
      <div className="w-80 border-r border-gray-800 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-200">Groupes</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un groupe..."
            className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {groups
            .filter(group => 
              group.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(group => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroup(group);
                  loadGroupMembers(group.id);
                }}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedGroup?.id === group.id
                    ? 'bg-emerald-500/10 border border-emerald-500/50'
                    : 'bg-slate-800/50 border border-gray-700/50 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-200">{group.name}</span>
                  <span className="text-xs bg-slate-700/50 px-2 py-0.5 rounded-full text-gray-400">
                    {group.member_count || 0} membres
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      style={{ 
                        width: `${Math.min((getGroupTotalProcessed(groupMembers) / group.image_limit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{getGroupTotalProcessed(groupMembers)} / {group.image_limit}</span>
                    <span>{((getGroupTotalProcessed(groupMembers) / group.image_limit) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Right Panel - Group Details */}
      <div className="flex-1 p-6">
        {selectedGroup ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-200">{selectedGroup.name}</h2>
                  <p className="text-sm text-gray-400">Créé le {new Date(selectedGroup.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDeleteGroup(selectedGroup.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Group Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Maximize2 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Redimensionnement</span>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {getGroupProcessingStats(groupMembers).resize.count}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(getGroupProcessingStats(groupMembers).resize.time / Math.max(1, getGroupProcessingStats(groupMembers).resize.count))} en moyenne
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Traitement IA</span>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {getGroupProcessingStats(groupMembers).ai.count}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(getGroupProcessingStats(groupMembers).ai.time / Math.max(1, getGroupProcessingStats(groupMembers).ai.count))} en moyenne
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Scissors className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-300">Suppression tête</span>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {getGroupProcessingStats(groupMembers).cropHead.count}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(getGroupProcessingStats(groupMembers).cropHead.time / Math.max(1, getGroupProcessingStats(groupMembers).cropHead.count))} en moyenne
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-gray-300">Tous traitements</span>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {getGroupProcessingStats(groupMembers).all.count}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(getGroupProcessingStats(groupMembers).all.time / Math.max(1, getGroupProcessingStats(groupMembers).all.count))} en moyenne
                </p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-gray-300">Total traité</span>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {getGroupTotalProcessed(groupMembers)}
                </p>
                <p className="text-xs text-gray-500">sur {selectedGroup.image_limit}</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Membres</span>
                </div>
                <p className="text-2xl font-semibold text-white">{selectedGroup.member_count || 0}</p>
                <p className="text-xs text-gray-500">utilisateurs actifs</p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Utilisation</span>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {((getGroupTotalProcessed(groupMembers) / selectedGroup.image_limit) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">du quota utilisé</p>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-slate-800/50 rounded-lg border border-gray-700/50">
              <div className="p-4 border-b border-gray-700/50">
                <h3 className="text-lg font-medium text-gray-200">Membres du groupe</h3>
              </div>
              <div className="divide-y divide-gray-700/50">
                {groupMembers.map(member => (
                  <div key={member.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-200">{member.email}</span>
                      <button
                        onClick={() => onRemoveMember(selectedGroup.id, member.user_id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{member.resize_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>{member.ai_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Scissors className="w-3.5 h-3.5 text-red-400" />
                        <span>{member.crop_head_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{member.all_processing_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <p>Sélectionnez un groupe pour voir ses détails</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg shadow-xl border border-gray-800 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Nouveau groupe</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nom du groupe
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-gray-200"
                    placeholder="Ex: Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Limite d'images
                  </label>
                  <input
                    type="number"
                    value={newGroupLimit}
                    onChange={(e) => setNewGroupLimit(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-gray-200"
                    placeholder="Ex: 10000"
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
                  onClick={handleCreateGroup}
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