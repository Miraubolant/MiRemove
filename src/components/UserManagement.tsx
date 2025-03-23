import React, { useState, useMemo } from 'react';
import { Search, UserPlus, UserMinus, Users, Trash2, Settings, BarChart3, Timer, CheckCircle2, Clock, Sparkles, AlertTriangle, Shield, Filter, SlidersHorizontal, Edit2, Save, X, UserCog, LayoutGrid } from 'lucide-react';

interface UserStats {
  id: string;
  user_id: string;
  email: string;
  processed_images: number;
  success_count: number;
  failure_count: number;
  total_processing_time: number;
  is_admin: boolean;
  image_limit: number;
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

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
};

function GroupCard({ group, isSelected, onClick }: { 
  group: Group; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] ${
        isSelected
          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
          : 'bg-slate-800/50 border-gray-700/50 text-gray-300 hover:bg-slate-700/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="font-medium">{group.name}</span>
        </div>
        <div className="text-sm opacity-75">
          {group.member_count || 0} membres
        </div>
      </div>
      
      <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
          style={{ 
            width: `${Math.min(((group.total_processed || 0) / group.image_limit) * 100, 100)}%` 
          }}
        />
      </div>
      
      <div className="mt-2 text-sm">
        {group.total_processed || 0} / {group.image_limit} images
      </div>

      {group.stats && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{group.stats.success_rate?.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5" />
            <span>{formatTime(group.stats.avg_processing_time || 0)}</span>
          </div>
        </div>
      )}
    </button>
  );
}

function GroupStats({ group, formatTime, onUpdateLimit }: { 
  group: Group; 
  formatTime: (seconds: number) => string;
  onUpdateLimit: (newLimit: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(group.image_limit);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (newLimit < 0) {
      setError("La limite ne peut pas être négative");
      return;
    }
    
    try {
      await onUpdateLimit(newLimit);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Erreur lors de la mise à jour de la limite");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
            <h4 className="text-sm font-medium text-gray-400">Limite d'images</h4>
          </div>
          {!isEditing ? (
            <button
              onClick={() => {
                setNewLimit(group.image_limit);
                setIsEditing(true);
              }}
              className="p-1 text-gray-400 hover:text-emerald-500 rounded transition-colors"
              title="Modifier la limite"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                className="p-1 text-emerald-500 hover:text-emerald-400 rounded transition-colors"
                title="Sauvegarder"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewLimit(group.image_limit);
                  setError(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
                title="Annuler"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-3 py-1 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                min="0"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-xl font-semibold text-emerald-500">
              {group.image_limit}
            </p>
            <span className="text-gray-400">images</span>
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
          <h4 className="text-sm font-medium text-gray-400">Images traitées</h4>
        </div>
        <p className="text-xl font-semibold text-emerald-500">
          {group.total_processed || 0}
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
          <h4 className="text-sm font-medium text-gray-400">Temps moyen</h4>
        </div>
        <p className="text-xl font-semibold text-emerald-500">
          {formatTime(group.stats?.avg_processing_time || 0)}
        </p>
      </div>
    </div>
  );
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
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLimit, setNewGroupLimit] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'email' | 'processed' | 'success'>('email');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'groups' | 'members'>('groups');

  const filteredUsers = useMemo(() => 
    users
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
      }),
    [users, searchTerm, sortBy, sortOrder]
  );

  const handleCreateGroup = () => {
    if (!newGroupName || newGroupLimit < 0) return;
    onCreateGroup(newGroupName, newGroupLimit);
    setNewGroupName('');
    setNewGroupLimit(10000);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'groups'
              ? 'bg-emerald-500/20 text-emerald-500'
              : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Groupes</span>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'members'
              ? 'bg-emerald-500/20 text-emerald-500'
              : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <UserCog className="w-4 h-4" />
          <span>Membres</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
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
        <div className="p-4 bg-slate-800/50 rounded-xl border border-gray-700/50 space-y-4">
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
                <GroupCard
                  key={group.id}
                  group={group}
                  isSelected={selectedGroup?.id === group.id}
                  onClick={() => onSelectGroup(group)}
                />
              ))}
            </div>
          </div>

          {/* Group Details & Members */}
          <div className="lg:col-span-2 space-y-4">
            {selectedGroup ? (
              <>
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
                    onClick={() => onDeleteGroup(selectedGroup.id)}
                    className="text-red-500 hover:text-red-400 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </div>

                {/* Group Stats */}
                <GroupStats 
                  group={selectedGroup} 
                  formatTime={formatTime}
                  onUpdateLimit={(newLimit) => onUpdateGroupLimit(selectedGroup.id, newLimit)}
                />

                {/* Members List */}
                <div className="bg-slate-800/50 rounded-xl border border-gray-700/50">
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
                    {groupMembers.map(member => (
                      <div
                        key={member.id}
                        className="p-4 hover:bg-slate-700/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">{member.email}</span>
                          <button
                            onClick={() => onRemoveUserFromGroup(member.id)}
                            className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-colors"
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
                <div className="bg-slate-800/50 rounded-xl border border-gray-700/50">
                  <div className="p-4 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-400">
                        Utilisateurs disponibles
                      </h4>
                      <span className="text-xs text-gray-500">
                        {filteredUsers.filter(user => !groupMembers.some(m => m.user_id === user.user_id)).length} utilisateurs
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-700/50">
                    {filteredUsers
                      .filter(user => !groupMembers.some(m => m.user_id === user.user_id))
                      .map(user => (
                        <div
                          key={user.id}
                          className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                        >
                          <span className="text-gray-300">{user.email}</span>
                          <button
                            onClick={() => onAddUserToGroup(user.user_id, user.email)}
                            className="text-emerald-500 hover:text-emerald-400 p-1 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Ajouter au groupe"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-12">
                Sélectionnez un groupe pour voir ses détails
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
                    <span className="text-gray-300">{user.email}</span>
                    {user.is_admin && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                        Admin
                      </span>
                    )}
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
  );
}