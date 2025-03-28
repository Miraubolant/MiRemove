import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, UserPlus, UserMinus, Users, Trash2, Settings, BarChart3, Timer, 
  CheckCircle2, Filter, SlidersHorizontal, ChevronDown, ChevronUp, Lock, Shield,
  Mail, Star, Clock, AlertTriangle, Zap, Activity, UserCheck, UserX, 
  LayoutGrid, Sparkles, Crown, Gauge
} from 'lucide-react';
import { UserSettingsPopup } from './UserSettingsPopup';
import { DefaultLimitModal } from './DefaultLimitModal';
import type { UserStats, Group, GroupMember } from '../../types/admin';

// Constants for better maintainability
const SORT_OPTIONS = {
  EMAIL: 'email',
  PROCESSED: 'processed',
  SUCCESS: 'success'
};

const TABS = {
  USERS: 'users',
  GROUPS: 'groups'
};

const DEFAULT_GROUP_LIMIT = 10000;

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

function UserManagement({
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
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLimit, setNewGroupLimit] = useState(DEFAULT_GROUP_LIMIT);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'email' | 'processed' | 'success'>(SORT_OPTIONS.EMAIL);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [showDefaultLimitModal, setShowDefaultLimitModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>(TABS.USERS);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      if (sortBy === SORT_OPTIONS.EMAIL) {
        return sortOrder === 'asc' 
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      }
      
      if (sortBy === SORT_OPTIONS.PROCESSED) {
        return sortOrder === 'asc'
          ? a.processed_images - b.processed_images
          : b.processed_images - a.processed_images;
      }
      
      // Sort by success rate
      const aRate = a.processed_images > 0 ? (a.success_count / a.processed_images) * 100 : 0;
      const bRate = b.processed_images > 0 ? (b.success_count / b.processed_images) * 100 : 0;
      return sortOrder === 'asc' ? aRate - bRate : bRate - aRate;
    });
  }, [users, searchTerm, sortBy, sortOrder]);

  // Get available users (not in selected group)
  const availableUsers = useMemo(() => {
    if (!selectedGroup) return [];
    
    return filteredUsers.filter(user => 
      !groupMembers.some(m => m.user_id === user.user_id)
    );
  }, [filteredUsers, groupMembers, selectedGroup]);

  // Callback handlers
  const handleCreateGroup = useCallback(() => {
    if (!newGroupName || newGroupLimit < 0) return;
    
    onCreateGroup(newGroupName, newGroupLimit);
    setNewGroupName('');
    setNewGroupLimit(DEFAULT_GROUP_LIMIT);
  }, [newGroupName, newGroupLimit, onCreateGroup]);

  const handleSortChange = useCallback((option) => {
    setSortBy(option);
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Helper function to get groups a user belongs to
  const getUserGroups = useCallback((userId) => {
    return groups.filter(group => 
      groupMembers.some(member => member.user_id === userId && member.group_id === group.id)
    );
  }, [groups, groupMembers]);

  // Component for rendering a user card
  const UserCard = useCallback(({ user }) => {
    const userGroups = getUserGroups(user.user_id);
    const successRate = user.processed_images > 0
      ? ((user.success_count / user.processed_images) * 100).toFixed(1)
      : '0.0';
    const avgProcessingTime = user.processed_images > 0
      ? user.total_processing_time / user.processed_images
      : 0;

    return (
      <div className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-gray-700/50 hover:border-emerald-500/30 rounded-xl transition-all duration-300 group">
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
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard 
            icon={<Activity className="w-3.5 h-3.5 text-emerald-500" />}
            label="Traités"
            value={user.processed_images}
            valueClass="text-emerald-500"
          />

          <StatCard 
            icon={<Gauge className="w-3.5 h-3.5 text-blue-400" />}
            label="Réussite"
            value={`${successRate}%`}
            valueClass="text-blue-400"
          />

          <StatCard 
            icon={<Clock className="w-3.5 h-3.5 text-purple-400" />}
            label="Temps"
            value={formatTime(avgProcessingTime)}
            valueClass="text-purple-400"
          />
        </div>
      </div>
    );
  }, [getUserGroups, formatTime]);

  // Component for displaying stat cards
  const StatCard = ({ icon, label, value, valueClass }: { icon: React.ReactNode, label: string, value: string | number, valueClass: string }) => (
    <div className="bg-slate-700/30 rounded-lg p-3 group-hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <span className={`text-lg font-semibold ${valueClass}`}>
        {value}
      </span>
    </div>
  );

  // Component for rendering a group card
  const GroupCard = useCallback(({ group }) => {
    const isSelected = selectedGroup?.id === group.id;
    const usagePercentage = Math.min(((group.total_processed || 0) / group.image_limit) * 100, 100);
    
    return (
      <div 
        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
          isSelected
            ? 'bg-emerald-500/10 border-emerald-500/50'
            : 'bg-slate-800/50 border-gray-700/50 hover:bg-slate-700/50'
        }`}
        onClick={() => onSelectGroup(group)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              isSelected ? 'bg-emerald-500/20' : 'bg-slate-700/50'
            }`}>
              <Users className={`w-4 h-4 ${
                isSelected ? 'text-emerald-500' : 'text-gray-400'
              }`} />
            </div>
            <span className={`font-medium ${
              isSelected ? 'text-emerald-500' : 'text-gray-300'
            }`}>{group.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-gray-400">
              {group.member_count || 0} membres
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-sm text-gray-400">
                {group.total_processed || 0} / {group.image_limit}
              </span>
            </div>
            {group.stats && (
              <div className="flex items-center gap-2 justify-end">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-sm text-gray-400">
                  {group.stats.success_rate?.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [selectedGroup, onSelectGroup]);

  // Renderer for the filter options
  const renderFilterOptions = () => {
    const filterOptions = [
      { id: SORT_OPTIONS.EMAIL, label: 'Email', icon: Mail },
      { id: SORT_OPTIONS.PROCESSED, label: 'Images traitées', icon: BarChart3 },
      { id: SORT_OPTIONS.SUCCESS, label: 'Taux de réussite', icon: CheckCircle2 }
    ];

    return (
      <div className="p-4 bg-slate-800/50 rounded-xl border border-gray-700/50 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-gray-300">Trier par</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSortChange(option.id)}
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
    );
  };

  // Renders a member row in the group details
  const renderMemberRow = (member) => (
    <div
      key={member.id}
      className="p-3 hover:bg-slate-700/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300">{member.email}</span>
        <button
          onClick={() => onRemoveUserFromGroup(member.user_id)}
          className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Retirer du groupe"
          aria-label="Remove user from group"
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
  );

  // Renders the create group form
  const renderCreateGroupForm = () => (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 space-y-4">
      <div className="space-y-2">
        <label htmlFor="group-name" className="block text-sm font-medium text-gray-400">
          Nom du groupe
        </label>
        <input
          id="group-name"
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Ex: Marketing"
          className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="group-limit" className="block text-sm font-medium text-gray-400">
          Limite d'images
        </label>
        <input
          id="group-limit"
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
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UserPlus className="w-4 h-4" />
        <span>Créer le groupe</span>
      </button>
    </div>
  );

  // Renders the group details section
  const renderGroupDetails = () => {
    if (!selectedGroup) {
      return (
        <div className="text-center text-gray-400 py-12">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p>Sélectionnez un groupe pour voir ses détails</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
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
            aria-label="Delete group"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </div>

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
            {groupMembers.map(renderMemberRow)}
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
                {availableUsers.length} utilisateurs
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-700/50">
            {availableUsers.map(user => (
              <div
                key={user.id}
                className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
              >
                <span className="text-gray-300">{user.email}</span>
                <button
                  onClick={() => onAddUserToGroup(user.user_id, user.email)}
                  className="text-emerald-500 hover:text-emerald-400 p-1 hover:bg-emerald-500/10 rounded-lg transition-colors"
                  title="Ajouter au groupe"
                  aria-label="Add user to group"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
        <button
          onClick={() => handleTabChange(TABS.USERS)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === TABS.USERS
              ? 'bg-emerald-500/20 text-emerald-500'
              : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
          }`}
          aria-label="View users"
        >
          <UserCheck className="w-4 h-4" />
          <span>Utilisateurs</span>
        </button>
        <button
          onClick={() => handleTabChange(TABS.GROUPS)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === TABS.GROUPS
              ? 'bg-emerald-500/20 text-emerald-500'
              : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
          }`}
          aria-label="View groups"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Groupes</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Rechercher ${activeTab === TABS.USERS ? 'un utilisateur' : 'un groupe'}...`}
            className="w-full bg-slate-800/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            aria-label="Search"
          />
        </div>
        {activeTab === TABS.USERS && (
          <button
            onClick={() => setShowDefaultLimitModal(true)}
            className="px-4 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
            aria-label="Set default limit"
          >
            <Lock className="w-5 h-5" />
            <span>Limite par défaut</span>
          </button>
        )}
        <button
          onClick={toggleFilters}
          className={`p-2.5 rounded-xl border transition-colors ${
            showFilters
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
              : 'border-gray-700/50 text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
          }`}
          aria-label="Toggle filters"
          aria-pressed={showFilters}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && renderFilterOptions()}

      {/* Content */}
      {activeTab === TABS.USERS ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Groups List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-200">Groupes</h3>
              <span className="text-sm text-gray-400">{groups.length} groupes</span>
            </div>
            
            {/* Create Group Form */}
            {renderCreateGroupForm()}

            {/* Groups List */}
            <div className="space-y-2">
              {groups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>

          {/* Group Details */}
          <div className="lg:col-span-2">
            {renderGroupDetails()}
          </div>
        </div>
      )}

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

export { UserManagement };