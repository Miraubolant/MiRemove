import { supabase } from '../lib/supabase';
import type { UserStats, Group } from '../types/admin';

export const useAdminService = () => {
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .order('email');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading users:', err);
      return [];
    }
  };

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (error) throw error;

      const groupsWithStats = await Promise.all(data.map(async (group) => {
        const stats = await loadGroupStats(group.id);
        return {
          ...group,
          ...stats
        };
      }));

      return groupsWithStats;
    } catch (err) {
      console.error('Error loading groups:', err);
      return [];
    }
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      const { data: groupStats, error: statsError } = await supabase
        .rpc('get_group_stats_with_users', { p_group_id: groupId });

      if (statsError) throw statsError;

      return groupStats.user_stats || [];
    } catch (err) {
      console.error('Error loading group members:', err);
      return [];
    }
  };

  const loadGroupStats = async (groupId: string) => {
    try {
      const { data: stats, error } = await supabase
        .rpc('get_group_stats', { p_group_id: groupId });

      if (error) throw error;
      return stats;
    } catch (err) {
      console.error('Error loading group stats:', err);
      return null;
    }
  };

  return {
    loadUsers,
    loadGroups,
    loadGroupMembers,
    loadGroupStats
  };
};