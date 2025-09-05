-- =====================================================
-- FIX check_user_quota - Retourner la bonne limite (groupe ou user)
-- =====================================================

CREATE OR REPLACE FUNCTION check_user_quota(p_user_id UUID, p_operations_count INTEGER DEFAULT 1)
RETURNS JSON AS $$
DECLARE
    v_user_profile user_profiles%ROWTYPE;
    v_user_stats user_stats%ROWTYPE;
    v_can_process BOOLEAN := TRUE;
    v_reason TEXT := '';
    v_group_info RECORD;
    v_actual_limit INTEGER;
    v_actual_usage INTEGER;
    v_quota_type TEXT;
BEGIN
    -- Récupérer profil et stats
    SELECT * INTO v_user_profile FROM user_profiles WHERE user_id = p_user_id;
    SELECT * INTO v_user_stats FROM user_stats WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('can_process', false, 'reason', 'User not found');
    END IF;
    
    -- Admin = toujours autorisé
    IF v_user_profile.user_level = 'admin' THEN
        RETURN json_build_object('can_process', true, 'remaining', -1, 'quota_type', 'admin');
    END IF;
    
    -- Vérifier si l'utilisateur fait partie d'un groupe actif
    SELECT g.id, g.name, g.image_limit, g.current_month_operations, g.is_active
    INTO v_group_info
    FROM groups g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = p_user_id 
    AND g.is_active = true
    ORDER BY g.image_limit DESC  -- Prendre le groupe avec la plus grande limite si plusieurs
    LIMIT 1;
    
    IF FOUND THEN
        -- L'utilisateur fait partie d'un groupe
        v_actual_limit := v_group_info.image_limit;
        v_actual_usage := v_group_info.current_month_operations;
        v_quota_type := 'group';
        
        -- Vérifier la limite du groupe
        IF v_actual_usage + p_operations_count > v_actual_limit THEN
            RETURN json_build_object(
                'can_process', false, 
                'reason', 'Group quota exceeded',
                'quota_type', 'group',
                'group_name', v_group_info.name,
                'remaining', GREATEST(0, v_actual_limit - v_actual_usage),
                'limit', v_actual_limit,
                'used', v_actual_usage
            );
        END IF;
    ELSE
        -- Pas de groupe, utiliser la limite personnelle
        v_actual_limit := v_user_profile.image_limit;
        v_actual_usage := v_user_stats.total_operations;
        v_quota_type := 'user';
        
        -- Vérifier la limite utilisateur
        IF v_actual_usage + p_operations_count > v_actual_limit THEN
            RETURN json_build_object(
                'can_process', false,
                'reason', 'User quota exceeded',
                'quota_type', 'user',
                'remaining', GREATEST(0, v_actual_limit - v_actual_usage),
                'limit', v_actual_limit,
                'used', v_actual_usage
            );
        END IF;
    END IF;
    
    -- Si on arrive ici, l'utilisateur peut traiter
    RETURN json_build_object(
        'can_process', true,
        'remaining', v_actual_limit - v_actual_usage,
        'quota_type', v_quota_type,
        'limit', v_actual_limit,
        'used', v_actual_usage
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaire
COMMENT ON FUNCTION check_user_quota(UUID, INTEGER) IS 'Vérifie si un utilisateur peut traiter des images en tenant compte des limites de groupe si applicable';