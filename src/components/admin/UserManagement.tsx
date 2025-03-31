import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, UserPlus, UserMinus, Users, Trash2, Settings, BarChart3, Timer, 
  CheckCircle2, Filter, SlidersHorizontal, ChevronDown, ChevronUp, Lock, Shield,
  Mail, Star, Clock, AlertTriangle, Zap, Activity, UserCheck, UserX, 
  LayoutGrid, Sparkles, Crown, Gauge, Plus, UserCog, Eye
} from 'lucide-react';
import { UserSettingsPopup } from './UserSettingsPopup';
import { DefaultLimitModal } from './DefaultLimitModal';
import type { UserStats, Group, GroupMember } from '../../types/admin';

interface UserManagementProps {
  users: UserStats[];
  groups: Group[];
  selectedGroup: Group | null;
  groupMembers: GroupMember[];
  onCreateGroup: (name: string, limit: number) => void;
  onDeleteGroup: (groupId: string) => void;
  onSelectGroup: (group: Group) => void;
  onAddUserToGroup: (userId: string, email: string) => void;
  onRemoveUserFromGroup: (memberId: string) => void;
  onUpdateGroupLimit: (groupId: string, newLimit: number) => void;
  formatTime: (seconds: number) => string;
}

export function UserManagement({
  users,
  groups,
  selectedGroup,
  groupMembers,
  onCreateGroup,
  onDeleteGroup,
  onSelectGroup,
  onAddUserToGroup,
  onRemoveUserFromGroup,
  onUpdateGroupLimit,
  formatTime
}: UserManagementProps) {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'activity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [showDefaultLimitModal, setShowDefaultLimitModal] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLimit, setNewGroupLimit] = useState(10000);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc' 
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email);
        case 'usage':
          return sortOrder === 'asc'
            ? a.processed_images - b.processed_images
            : b.processed_images - a.processed_images;
        case 'activity':
          const aTime = a.total_processing_time / (a.processed_images || 1);
          const bTime = b.total_processing_time / (b.processed_images || 1);
          return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
        default:
          return 0;
      }
    });
  }, [users, searchTerm, sortBy, sortOrder]);

  // Filter and sort groups
  const filteredGroups = useMemo(() => {
    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'usage':
          const aUsage = (a.total_processed || 0) / a.image_limit;
          const bUsage = (b.total_processed || 0) / b.image_limit;
          return sortOrder === 'asc' ? aUsage - bUsage : bUsage - aUsage;
        default:
          return 0;
      }
    });
  }, [groups, searchTerm, sortBy, sortOrder]);

  // Get user's groups
  const getUserGroups = useCallback((userId: string) => {
    return groups.filter(group => 
      groupMembers.some(member => member.user_id === userId && member.group_id === group.id)
    );
  }, [groups, groupMembers]);

  // Render user card
  const UserCard = ({ user }: { user: UserStats }) => {
    const userGroups = getUserGroups(user.user_id);
    const successRate = user.processed_images > 0
      ? ((user.success_count / user.processed_images) * 100).toFixed(1)
      : '0.0';
    const avgProcessingTime = user.processed_images > 0
      ? user.total_processing_time / user.processed_images
      : 0;

    return (
      <div className="bg-slate-800/50 rounded-xl border border-gray-700/50 hover:border-emerald-500/30 p-4 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Mail className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <span className="text-gray-200 font-medium">{user.email}</span>
              <div className="flex items-center gap-2 mt-1">
                {user.is_admin && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3" />
                    Admin
                  </span>
                )}
                {userGroups.map(group => (
                  <span 
                    key={group.id}
                    className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full"
                    title={`Limite: ${group.image_limit} images`}
                  >
                    <Users className="w-3 h-3" />
                    {group.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedUser(user)}
            className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-gray-400">Traités</span>
            </div>
            <div className="text-lg font-bold text-emerald-500">
              {user.processed_images}
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-gray-400">Réussite</span>
            </div>
            <div className="text-lg font-bold text-blue-400">
              {successRate}%
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-gray-400">Temps</span>
            </div>
            <div className="text-lg font-bold text-purple-400">
              {formatTime(avgProcessingTime)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render group card
  const GroupCard = ({ group }: { group: Group }) => {
    const usagePercentage = Math.min(((group.total_processed || 0) / group.image_limit) * 100, 100);
    const isSelected = selectedGroup?.id === group.id;

    return (
      <div 
        className={`bg-slate-800/50 rounded-xl border p-4 transition-all duration-300 cursor-pointer ${
          isSelected
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-gray-700/50 hover:border-gray-600/50'
        }`}
        onClick={() => onSelectGroup(group)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isSelected ? 'bg-emerald-500/10' : 'bg-slate-700/50'
            }`}>
              <Users className={`w-4 h-4 ${
                isSelected ? 'text-emerald-500' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <span className={`font-medium ${
                isSelected ? 'text-emerald-500' : 'text-gray-200'
              }`}>{group.name}</span>
              <div className="text-xs text-gray-400 mt-1">
                {group.member_count || 0} membres
              </div>
            </div>
          </div>
          
          <div className="text-xs bg-slate-700/50 px-2 py-1 rounded-lg text-gray-400">
            {Math.round(usagePercentage)}% utilisé
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-xs text-gray-400">
              {group.total_processed || 0} / {group.image_limit} images
            </div>
            {group.stats && (
              <div className="text-xs text-right">
                <span className={isSelected ? 'text-emerald-500' : 'text-gray-400'}>
                  {group.stats.success_rate?.toFixed(1)}% réussite
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render group details
  const GroupDetails = () => {
    if (!selectedGroup) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-lg">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-200">
                {selectedGroup.name}
              </h3>
              <p className="text-sm text-gray-400">
                {groupMembers.length} membres
              </p>
            </div>
          </div>
          <button
            onClick={() => onDeleteGroup(selectedGroup.id)}
            className="px-3 py-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-medium text-gray-300">Images traitées</h4>
            </div>
            <p className="text-2xl font-semibold text-emerald-500">
              {selectedGroup.total_processed || 0}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-medium text-gray-300">Limite</h4>
            </div>
            <p className="text-2xl font-semibold text-blue-400">
              {selectedGroup.image_limit}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-medium text-gray-300">Temps moyen</h4>
            </div>
            <p className="text-2xl font-semibold text-purple-400">
              {formatTime(selectedGroup.stats?.avg_processing_time || 0)}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-gray-700/50">
          <div className="p-4 border-b border-gray-700/50">
            <h4 className="text-sm font-medium text-gray-300">Membres du groupe</h4>
          </div>
          <div className="divide-y divide-gray-700/50">
            {groupMembers.map(member => (
              <div key={member.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">{member.email}</span>
                  <button
                    onClick={() => onRemoveUserFromGroup(member.user_id)}
                    className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-gray-400 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{member.processed_images}</span>
                  </div>
                  <div className="text-gray-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{member.success_rate?.toFixed(1)}%</span>
                  </div>
                  <div className="text-gray-400 flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" />
                    <span>{formatTime(member.avg_processing_time || 0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-6">
      {/* Left Panel - Users & Groups List */}
      <div className="w-96 flex-shrink-0 flex flex-col h-[calc(100vh-220px)]">
        {/* Search and Filters - Fixed at top */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg pl-9 pr-4 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                  : 'border-gray-700/50 text-gray-400 hover:text-gray-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-300">Trier par</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'name', label: 'Nom', icon: Mail },
                  { id: 'usage', label: 'Utilisation', icon: BarChart3 },
                  { id: 'activity', label: 'Activité', icon: Activity }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (sortBy === option.id) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(option.id as any);
                        setSortOrder('asc');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      sortBy === option.id
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label}
                    {sortBy === option.id && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Create Group Button - Fixed below search */}
        <button
          onClick={() => setShowCreateGroup(true)}
          className="w-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-4 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center mb-4"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un groupe</span>
        </button>

        {/* Create Group Form - Only shown when needed */}
        {showCreateGroup && (
          <div className="bg-slate-800/50 rounded-lg border border-gray-700/50 p-4 space-y-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-medium text-gray-300">Nouveau groupe</h3>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nom du groupe"
                className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />

              <input
                type="number"
                value={newGroupLimit}
                onChange={(e) => setNewGroupLimit(parseInt(e.target.value) || 0)}
                placeholder="Limite d'images"
                className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (newGroupName && newGroupLimit > 0) {
                      onCreateGroup(newGroupName, newGroupLimit);
                      setNewGroupName('');
                      setNewGroupLimit(10000);
                      setShowCreateGroup(false);
                    }
                  }}
                  disabled={!newGroupName || newGroupLimit <= 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Créer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Lists Container */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Groups List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between sticky top-0 bg-slate-900 py-2">
              <h3 className="text-sm font-medium text-gray-300">Groupes</h3>
              <span className="text-xs text-gray-400">{groups.length} groupes</span>
            </div>
            <div className="space-y-2">
              {filteredGroups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between sticky top-0 bg-slate-900 py-2">
              <h3 className="text-sm font-medium text-gray-300">Utilisateurs</h3>
              <span className="text-xs text-gray-400">{users.length} utilisateurs</span>
            </div>
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Details */}
      <div className="flex-1">
        {selectedGroup ? (
          <GroupDetails />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Users className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-gray-400">
              Sélectionnez un groupe pour voir ses détails
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUser && (
        <UserSettingsPopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {showDefaultLimitModal && (
        <DefaultLimitModal
          currentLimit={10}
          onClose={() => setShowDefaultLimitModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}