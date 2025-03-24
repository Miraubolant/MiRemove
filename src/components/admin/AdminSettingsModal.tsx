import React, { useState, useEffect } from 'react';
import { X, Shield, Users, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UserManagement } from './UserManagement';
import { useAdminService } from '../../services/adminService';
import type { UserStats, Group, GroupMember } from '../../types/admin';

interface AdminSettingsModalProps {
  onClose: () => void;
}

export function AdminSettingsModal({ onClose }: AdminSettingsModalProps) {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups');
  const adminService = useAdminService();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupData(selectedGroup.id);
    }
  }, [selectedGroup]);

  const loadInitialData = async () => {
    const loadedUsers = await adminService.loadUsers();
    setUsers(loadedUsers);
    
    const loadedGroups = await adminService.loadGroups();
    setGroups(loadedGroups);
  };

  const loadGroupData = async (groupId: string) => {
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
    } catch (err) {
      console.error('Error creating group:', err);
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
    } catch (err) {
      console.error('Error updating limit:', err);
      throw err;
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
      setSelectedGroup(null);
    } catch (err) {
      console.error('Error deleting group:', err);
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
    } catch (err) {
      console.error('Error adding user to group:', err);
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
    } catch (err) {
      console.error('Error removing user from group:', err);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-7xl h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-200">
              Administration
            </h2>
          </div>
          
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content with scroll */}
        <div className="flex-1 overflow-y-auto p-6">
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
      </div>
    </div>
  );
}