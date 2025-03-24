import React, { useState } from 'react';
import { Users, Trash2, Settings, BarChart3, Timer, CheckCircle2, Edit2, Save, X, UserPlus, UserMinus, Lock, Search, Filter, SlidersHorizontal } from 'lucide-react';
import type { Group, GroupMember } from '../../types/admin';

interface GroupManagementProps {
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
  users: any[];
  searchTerm: string;
}

export function GroupManagement({
  groups,
  selectedGroup,
  groupMembers,
  onCreateGroup,
  onDeleteGroup,
  onSelectGroup,
  onAddUserToGroup,
  onRemoveUserFromGroup,
  onUpdateGroupLimit,
  formatTime,
  users,
  searchTerm
}: GroupManagementProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLimit, setNewGroupLimit] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'usage'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleCreateGroup = () => {
    if (!newGroupName || newGroupLimit < 0) return;
    onCreateGroup(newGroupName, newGroupLimit);
    setNewGroupName('');
    setNewGroupLimit(10000);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !groupMembers.some(m => m.user_id === user.user_id)
  );

  const sortedGroups = [...groups].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortBy === 'members') {
      return sortOrder === 'asc'
        ? (a.member_count || 0) - (b.member_count || 0)
        : (b.member_count || 0) - (a.member_count || 0);
    }
    // usage
    const aUsage = ((a.total_processed || 0) / a.image_limit) * 100;
    const bUsage = ((b.total_processed || 0) / b.image_limit) * 100;
    return sortOrder === 'asc' ? aUsage - bUsage : bUsage - aUsage;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Panel - Groups List */}
      <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-4">
        {/* Search and Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg pl-9 pr-4 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                : 'border-gray-700/50 text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="p-3 bg-slate-800/50 rounded-lg border border-gray-700/50 space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-gray-300">Trier par</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'name', label: 'Nom' },
                { id: 'members', label: 'Membres' },
                { id: 'usage', label: 'Utilisation' }
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
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    sortBy === option.id
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
                  }`}
                >
                  {option.label} {sortBy === option.id && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create Group Form */}
        <div className="bg-slate-800/50 rounded-lg border border-gray-700/50 p-4 space-y-4">
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
              className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            />

            <input
              type="number"
              value={newGroupLimit}
              onChange={(e) => setNewGroupLimit(parseInt(e.target.value) || 0)}
              placeholder="Limite d'images"
              className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            />

            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName || newGroupLimit < 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Créer le groupe</span>
            </button>
          </div>
        </div>

        {/* Groups List */}
        <div className="space-y-2">
          {sortedGroups.map(group => (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`w-full p-3 rounded-lg border transition-all duration-300 text-left ${
                selectedGroup?.id === group.id
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : 'bg-slate-800/50 border-gray-700/50 hover:bg-slate-700/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-gray-200">{group.name}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {group.member_count || 0} membres
                </span>
              </div>

              <div className="space-y-2">
                <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((group.total_processed || 0) / group.image_limit) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {group.total_processed || 0} / {group.image_limit}
                  </span>
                  {group.stats && (
                    <span className="text-emerald-500">
                      {group.stats.success_rate?.toFixed(1)}% réussite
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Group Details */}
      <div className="flex-1 min-w-0">
        {selectedGroup ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <Settings className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-200">
                    {selectedGroup.name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedGroup.member_count || 0} membres
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDeleteGroup(selectedGroup.id)}
                className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg border border-gray-700/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-medium text-gray-300">Limite d'images</h3>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-semibold text-emerald-500">
                    {selectedGroup.image_limit}
                  </p>
                  <button
                    onClick={() => {
                      const newLimit = window.prompt('Nouvelle limite :', selectedGroup.image_limit.toString());
                      if (newLimit && !isNaN(parseInt(newLimit))) {
                        onUpdateGroupLimit(selectedGroup.id, parseInt(newLimit));
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg border border-gray-700/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-medium text-gray-300">Images traitées</h3>
                </div>
                <p className="text-2xl font-semibold text-emerald-500">
                  {selectedGroup.total_processed || 0}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg border border-gray-700/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-medium text-gray-300">Temps moyen</h3>
                </div>
                <p className="text-2xl font-semibold text-emerald-500">
                  {formatTime(selectedGroup.stats?.avg_processing_time || 0)}
                </p>
              </div>
            </div>

            {/* Members */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-200">Membres</h3>
              <div className="bg-slate-800/50 rounded-lg border border-gray-700/50 divide-y divide-gray-700/50">
                {groupMembers.map(member => (
                  <div
                    key={member.id}
                    className="p-4 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">{member.email}</span>
                      <button
                        onClick={() => onRemoveUserFromGroup(member.user_id)}
                        className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-colors"
                        title="Retirer du groupe"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>{member.processed_images}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{member.success_rate?.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{formatTime(member.avg_processing_time || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Users */}
            {filteredUsers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-200">Ajouter des membres</h3>
                <div className="bg-slate-800/50 rounded-lg border border-gray-700/50 divide-y divide-gray-700/50">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                    >
                      <span className="text-gray-300">{user.email}</span>
                      <button
                        onClick={() => onAddUserToGroup(user.user_id, user.email)}
                        className="text-emerald-500 hover:text-emerald-400 p-1 hover:bg-emerald-500/10 rounded transition-colors"
                        title="Ajouter au groupe"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <Users className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-gray-400">
              Sélectionnez un groupe pour voir ses détails
            </p>
          </div>
        )}
      </div>
    </div>
  );
}