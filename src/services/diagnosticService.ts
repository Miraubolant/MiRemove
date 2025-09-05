import { supabase } from '../lib/supabase';

interface DiagnosticResult {
  group_exists: boolean;
  user_exists: boolean;
  member_already_exists: boolean;
  expected_new_limit: number;
  current_user_limit: number;
  group_limit: number;
  user_group_count: number;
  max_groups_per_user: number;
}

interface UserDetailedInfo {
  user_id: string;
  email: string;
  created_at: string;
  user_stats?: {
    image_limit: number;
    processed_images: number;
    total_operations: number;
  };
  groups?: Array<{
    group_id: string;
    group_name: string;
    role: string;
    joined_at: string;
  }>;
}

interface UserStatsInfo {
  created: boolean;
  user_id: string;
  image_limit: number;
  processed_images: number;
}

class DiagnosticService {
  /**
   * Test l'ajout d'un membre à un groupe avec diagnostic complet
   */
  async testGroupMemberAddition(
    groupId: string, 
    userId: string, 
    dryRun: boolean = false
  ): Promise<DiagnosticResult | null> {
    try {
      

      // Vérifier l'existence du groupe
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, name, image_limit')
        .eq('id', groupId)
        .single();

      if (groupError || !groupData) {
        
        return {
          group_exists: false,
          user_exists: false,
          member_already_exists: false,
          expected_new_limit: 0,
          current_user_limit: 0,
          group_limit: 0,
          user_group_count: 0,
          max_groups_per_user: 3
        };
      }

      // Vérifier l'existence de l'utilisateur et ses stats
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (userError || !userData) {
        
        return {
          group_exists: true,
          user_exists: false,
          member_already_exists: false,
          expected_new_limit: 0,
          current_user_limit: 0,
          group_limit: groupData.image_limit,
          user_group_count: 0,
          max_groups_per_user: 3
        };
      }

      // Vérifier si l'utilisateur est déjà membre
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      const memberAlreadyExists = !memberError && memberData;

      // Obtenir les stats utilisateur actuelles
      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select('image_limit, processed_images')
        .eq('user_id', userId)
        .single();

      // Récupérer la limite par défaut depuis admin_settings
      const { data: adminSettings } = await supabase
        .from('admin_settings')
        .select('free_user_max_images')
        .single();
      
      const defaultLimit = adminSettings?.free_user_max_images || 10;
      const currentUserLimit = userStats?.image_limit || defaultLimit;

      // Compter les groupes actuels de l'utilisateur
      const { data: userGroups, error: groupsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      const userGroupCount = userGroups?.length || 0;

      // Calculer la nouvelle limite attendue
      const expectedNewLimit = Math.max(currentUserLimit, groupData.image_limit);

      const result: DiagnosticResult = {
        group_exists: true,
        user_exists: true,
        member_already_exists: !!memberAlreadyExists,
        expected_new_limit: expectedNewLimit,
        current_user_limit: currentUserLimit,
        group_limit: groupData.image_limit,
        user_group_count: userGroupCount,
        max_groups_per_user: 3
      };

      
      return result;

    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
      return null;
    }
  }

  /**
   * S'assure que les statistiques utilisateur existent
   */
  async ensureUserStatsExist(userId: string): Promise<UserStatsInfo | null> {
    try {
      // Vérifier si les stats existent déjà
      const { data: existingStats, error: checkError } = await supabase
        .from('user_stats')
        .select('user_id, image_limit, processed_images')
        .eq('user_id', userId)
        .single();

      if (!checkError && existingStats) {
        return {
          created: false,
          user_id: userId,
          image_limit: existingStats.image_limit,
          processed_images: existingStats.processed_images
        };
      }

      // Créer les stats si elles n'existent pas
      const { data: newStats, error: createError } = await supabase
        .from('user_stats')
        .insert([{
          user_id: userId,
          image_limit: defaultLimit,
          processed_images: 0,
          bg_removal_count: 0,
          resize_count: 0,
          head_crop_count: 0,
          total_operations: 0
        }])
        .select('user_id, image_limit, processed_images')
        .single();

      if (createError) {
        console.error('❌ Erreur lors de la création des stats:', createError);
        return null;
      }

      return {
        created: true,
        user_id: userId,
        image_limit: newStats.image_limit,
        processed_images: newStats.processed_images
      };

    } catch (error) {
      console.error('❌ Erreur lors de la vérification/création des stats:', error);
      return null;
    }
  }

  /**
   * Obtient les informations détaillées d'un utilisateur
   */
  async getUserDetailedInfo(userId: string): Promise<UserDetailedInfo | null> {
    try {
      // Obtenir les informations de base de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('user_id, email, created_at')
        .eq('user_id', userId)
        .single();

      if (userError || !userData) {
        return null;
      }

      // Obtenir les statistiques
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('image_limit, processed_images, total_operations')
        .eq('user_id', userId)
        .single();

      // Obtenir les groupes
      const { data: groupsData, error: groupsError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          joined_at,
          groups (
            name
          )
        `)
        .eq('user_id', userId);

      const groups = groupsData?.map(g => ({
        group_id: g.group_id,
        group_name: (g as any).groups?.name || 'Nom non disponible',
        role: g.role,
        joined_at: g.joined_at
      })) || [];

      return {
        user_id: userData.user_id,
        email: userData.email,
        created_at: userData.created_at,
        user_stats: statsError ? undefined : {
          image_limit: statsData.image_limit,
          processed_images: statsData.processed_images,
          total_operations: statsData.total_operations
        },
        groups
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos utilisateur:', error);
      return null;
    }
  }

  /**
   * Génère un rapport de diagnostic complet
   */
  async logDiagnosticReport(): Promise<void> {
    
    
    try {
      // Test de connexion
      const { data: connectionTest } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      

      // Test des fonctions RPC de base
      const { data: functionsTest, error: functionsError } = await supabase
        .from('user_stats')
        .select('count')
        .limit(1);
      
      if (functionsError) {
        
      } else {
        
      }

      // Test des politiques RLS
      const { data: rlsTest, error: rlsError } = await supabase
        .from('groups')
        .select('count')
        .limit(1);
      
      if (rlsError) {
        
      } else {
        
      }

      

    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
    }
  }

  /**
   * Nettoie les données orphelines
   */
  async cleanupOrphanedData(): Promise<{ cleaned: number; errors: string[] }> {
    const errors: string[] = [];
    let cleaned = 0;

    try {
      // Nettoyer les membres de groupes dont l'utilisateur n'existe plus
      const { data: orphanedMembers, error: membersError } = await supabase
        .from('group_members')
        .select(`
          user_id,
          group_id,
          user_profiles!inner(user_id)
        `);

      if (!membersError && orphanedMembers) {
        // Cette requête ne devrait retourner que les membres valides
        // Les orphelins ne seront pas inclus à cause du inner join
        const validUserIds = orphanedMembers.map(m => m.user_id);
        
        // Supprimer les membres orphelins
        const { error: deleteError } = await supabase
          .from('group_members')
          .delete()
          .not('user_id', 'in', `(${validUserIds.map(id => `'${id}'`).join(',')})`);

        if (deleteError) {
          errors.push(`Erreur lors du nettoyage des membres: ${deleteError.message}`);
        }
      }

      // Nettoyer les stats utilisateur orphelines
      const { data: orphanedStats, error: statsError } = await supabase
        .from('user_stats')
        .select(`
          user_id,
          user_profiles!inner(user_id)
        `);

      if (!statsError && orphanedStats) {
        const validUserIds = orphanedStats.map(s => s.user_id);
        
        const { error: deleteStatsError } = await supabase
          .from('user_stats')
          .delete()
          .not('user_id', 'in', `(${validUserIds.map(id => `'${id}'`).join(',')})`);

        if (deleteStatsError) {
          errors.push(`Erreur lors du nettoyage des stats: ${deleteStatsError.message}`);
        }
      }

      
      if (errors.length > 0) {
        console.warn('⚠️ Erreurs durant le nettoyage:', errors);
      }

      return { cleaned, errors };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      errors.push(errorMsg);
      return { cleaned, errors };
    }
  }
}

export const diagnosticService = new DiagnosticService();