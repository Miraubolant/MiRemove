import { supabase } from '../lib/supabase';

export const useAdminService = () => {
  const loadGroupOperationStats = async (groupId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_group_operation_stats', { 
        p_group_id: groupId 
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error loading group operation stats:', err);
      return null;
    }
  };

  return {
    loadGroupOperationStats
  };
};