import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Shield, Activity, BarChart3, Users,
  Maximize2, Wand2, Scissors, Sparkles,
  Search, User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GroupManagement } from './GroupManagement';

// Types
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

interface UserStats {
  id: string;
  email: string;
  processed_images: number;
  success_count: number;
  failure_count: number;
  total_processing_time: number;
  is_admin: boolean;
  resize_count: number;
  ai_count: number;
  crop_head_count: number;
  all_processing_count: number;
  resize_processing_time: number;
  ai_processing_time: number;
  crop_head_processing_time: number;
  all_processing_time: number;
}

// Helper Components and Functions
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
};

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  count: number;
  time: number;
  color?: string;
  bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  title, 
  count, 
  time, 
  color = "text-emerald-500",
  bgColor = "bg-emerald-500/10"
}) => (
  <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className={`${bgColor} p-2.5 rounded-lg`}>
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

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  iconColor?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  iconColor = "text-emerald-500" 
}) => (
  <div className="bg-slate-800/40 rounded-xl border border-gray-700/50 p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-4 h-4 ${iconColor}`} />
      <span className="text-sm text-gray-300">{title}</span>
    </div>
    <p className="text-2xl font-semibold text-white">{value}</p>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </div>
);

// Main Component
export function AdminSettingsModal({ onClose }: AdminSettingsModalProps) {
  // State
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Computed values
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

  const filteredUsers = useMemo(() => 
    searchTerm
      ? users.filter(user => 
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : users,
    [users, searchTerm]
  );

  // Effects
  useEffect(() => {
    loadGroups();
    loadUsers();
  }, []);

  // Data fetching
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

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Erreur lors du chargement des utilisateurs');
    }
  };

  // Event handlers
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
      showSuccessMessage(`Groupe "${name}" créé avec succès`);
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
      showSuccessMessage('Groupe supprimé avec succès');
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
      showSuccessMessage('Membre ajouté avec succès');
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
      showSuccessMessage('Membre retiré avec succès');
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Erreur lors du retrait du membre');
    }
  };

  // Helper function for showing temporary success messages
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-6xl h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-200">Administration</h2>
                <p className="text-sm text-gray-400 mt-1">Gestion des groupes et utilisateurs</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              {successMessage}
            </div>
          )}

          {/* Global Stats */}
          <section className="mb-8" aria-labelledby="stats-heading">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h3 id="stats-heading" className="text-lg font-medium text-gray-200">Statistiques globales</h3>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InfoCard
                icon={Activity}
                title="Total traité"
                value={globalStats.totalImages}
                subtitle={`sur ${globalStats.totalLimit}`}
                iconColor="text-emerald-500"
              />

              <InfoCard
                icon={Users}
                title="Membres"
                value={globalStats.totalMembers}
                subtitle="utilisateurs actifs"
                iconColor="text-blue-400"
              />

              <InfoCard
                icon={BarChart3}
                title="Utilisation"
                value={`${((globalStats.totalImages / globalStats.totalLimit) * 100).toFixed(1)}%`}
                subtitle="du quota utilisé"
                iconColor="text-purple-400"
              />
            </div>
          </section>

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

          {/* User Statistics */}
          <section className="mt-8" aria-labelledby="users-heading">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" />
                <h3 id="users-heading" className="text-lg font-medium text-gray-200">Statistiques utilisateurs</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  className="w-64 bg-slate-800/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  aria-label="Rechercher un utilisateur"
                />
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Utilisateur</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">Images traitées</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">Taux de succès</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">Redim.</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">IA</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">Tête</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-300">Tous</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => {
                        const successRate = user.processed_images > 0
                          ? (user.success_count / user.processed_images) * 100
                          : 0;

                        return (
                          <tr key={user.id} className="border-t border-gray-700/30 hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300">{user.email}</span>
                                {user.is_admin && (
                                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="text-center py-3 px-2 text-gray-300">{user.processed_images}</td>
                            <td className="text-center py-3 px-2">
                              <span className={`text-sm ${
                                successRate >= 90 ? 'text-emerald-400' :
                                successRate >= 70 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {successRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="text-center py-3 px-2 text-blue-400">{user.resize_count}</td>
                            <td className="text-center py-3 px-2 text-purple-400">{user.ai_count}</td>
                            <td className="text-center py-3 px-2 text-red-400">{user.crop_head_count}</td>
                            <td className="text-center py-3 px-2 text-amber-400">{user.all_processing_count}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-gray-400">
                          {searchTerm ? 'Aucun utilisateur trouvé.' : 'Aucun utilisateur disponible.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {loading && (
                <div className="p-4 text-center">
                  <p className="text-gray-400">Chargement des données...</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}