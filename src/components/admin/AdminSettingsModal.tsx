import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Shield, Activity, BarChart3, Users,
  Maximize2, Wand2, Scissors, Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GroupManagement } from './GroupManagement';

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
    all: { count: number; time: number };
  };
}

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
  time, 
  color = "text-emerald-500",
  bgColor = "bg-emerald-500/10"
}: { 
  icon: React.ElementType;
  title: string;
  count: number;
  time: number;
  color?: string;
  bgColor?: string;
}) => (
  <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className={`${bgColor} p-2 rounded-lg`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="text-sm text-gray-300">{title}</div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-2xl font-semibold text-white">{count}</p>
        <p className="text-xs text-gray-500">images traitées</p>
      </div>
      <div>
        <p className="text-2xl font-semibold text-white">{formatTime(time / Math.max(1, count))}</p>
        <p className="text-xs text-gray-500">temps moyen</p>
      </div>
    </div>
  </div>
);

export function AdminSettingsModal({ onClose }: AdminSettingsModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const globalStats = useMemo(() => {
    return groups.reduce((acc, group) => {
      return {
        totalMembers: acc.totalMembers + (group.member_count || 0),
        totalImages: acc.totalImages + (group.total_processed || 0),
        totalLimit: acc.totalLimit + group.image_limit,
        operations: {
          resize: {
            count: acc.operations.resize.count + (group.stats?.resize?.count || 0),
            time: acc.operations.resize.time + (group.stats?.resize?.time || 0)
          },
          ai: {
            count: acc.operations.ai.count + (group.stats?.ai?.count || 0),
            time: acc.operations.ai.time + (group.stats?.ai?.time || 0)
          },
          cropHead: {
            count: acc.operations.cropHead.count + (group.stats?.crop_head?.count || 0),
            time: acc.operations.cropHead.time + (group.stats?.crop_head?.time || 0)
          },
          all: {
            count: acc.operations.all.count + (group.stats?.all?.count || 0),
            time: acc.operations.all.time + (group.stats?.all?.time || 0)
          }
        }
      };
    }, {
      totalMembers: 0,
      totalImages: 0,
      totalLimit: 0,
      operations: {
        resize: { count: 0, time: 0 },
        ai: { count: 0, time: 0 },
        cropHead: { count: 0, time: 0 },
        all: { count: 0, time: 0 }
      }
    } as GlobalStats);
  }, [groups]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (groupsError) throw groupsError;

      const groupsWithStats = await Promise.all(groupsData.map(async (group) => {
        const { data: memberData } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', group.id);

        const { data: operationStats } = await supabase
          .rpc('get_group_operation_stats', { p_group_id: group.id });

        const totalProcessed = (
          (operationStats?.resize?.count || 0) +
          (operationStats?.ai?.count || 0) +
          (operationStats?.crop_head?.count || 0) +
          (operationStats?.all?.count || 0)
        );
        
        return {
          ...group,
          member_count: memberData?.length || 0,
          total_processed: totalProcessed,
          stats: operationStats
        };
      }));

      setGroups(groupsWithStats);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

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
      setSuccessMessage(`Groupe "${name}" créé avec succès`);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
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
      setSuccessMessage('Groupe supprimé avec succès');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
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

      await loadGroups();
      setSuccessMessage('Membre ajouté avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
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
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      await loadGroups();
      setSuccessMessage('Membre retiré avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Erreur lors du retrait du membre');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-5xl h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-200">Administration</h2>
                <p className="text-sm text-gray-400 mt-1">Gestion des groupes</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Global Stats */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-medium text-gray-200">Statistiques globales</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                title="Traitement IA"
                count={globalStats.operations.ai.count}
                time={globalStats.operations.ai.time}
                color="text-purple-400"
                bgColor="bg-purple-500/10"
              />
              
              <StatCard 
                icon={Scissors}
                title="Suppression tête"
                count={globalStats.operations.cropHead.count}
                time={globalStats.operations.cropHead.time}
                color="text-red-400"
                bgColor="bg-red-500/10"
              />
              
              <StatCard 
                icon={Sparkles}
                title="Tous les traitements"
                count={globalStats.operations.all.count}
                time={globalStats.operations.all.time}
                color="text-amber-400"
                bgColor="bg-amber-500/10"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-gray-300">Total traité</span>
                </div>
                <p className="text-2xl font-semibold text-white">{globalStats.totalImages}</p>
                <p className="text-xs text-gray-500">sur {globalStats.totalLimit}</p>
              </div>

              <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Membres</span>
                </div>
                <p className="text-2xl font-semibold text-white">{globalStats.totalMembers}</p>
                <p className="text-xs text-gray-500">utilisateurs actifs</p>
              </div>

              <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Utilisation</span>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {((globalStats.totalImages / globalStats.totalLimit) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">du quota utilisé</p>
              </div>
            </div>
          </div>

          {/* Group Management */}
          <GroupManagement
            groups={groups}
            loading={loading}
            error={error}
            successMessage={successMessage}
            onCreateGroup={handleCreateGroup}
            onDeleteGroup={handleDeleteGroup}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      </div>
    </div>
  );
}