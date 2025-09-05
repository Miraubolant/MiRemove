-- =====================================================
-- FIX FINAL - Corriger le type operation_type et la logique groupe
-- =====================================================

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS log_processing_operation CASCADE;

-- Créer la version corrigée
CREATE FUNCTION log_processing_operation(
    p_user_id UUID,
    p_operation_type TEXT,
    p_operations_count INTEGER DEFAULT 1,
    p_success BOOLEAN DEFAULT TRUE,
    p_processing_time_ms BIGINT DEFAULT NULL,
    p_file_size_bytes BIGINT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_user_profile user_profiles%ROWTYPE;
    v_user_stats user_stats%ROWTYPE;
    v_group_info RECORD;
    v_group_update_count INTEGER := 0;
    v_is_in_group BOOLEAN := FALSE;
    v_actual_limit INTEGER;
    v_actual_usage INTEGER;
BEGIN
    -- Récupérer profil et stats
    SELECT * INTO v_user_profile FROM user_profiles WHERE user_id = p_user_id;
    SELECT * INTO v_user_stats FROM user_stats WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found',
            'debug_info', 'User profile or stats missing'
        );
    END IF;
    
    -- Vérifier si l'utilisateur fait partie d'un groupe actif
    SELECT g.id, g.name, g.image_limit, g.current_month_operations, g.is_active
    INTO v_group_info
    FROM groups g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = p_user_id 
    AND g.is_active = true
    ORDER BY g.image_limit DESC
    LIMIT 1;
    
    IF FOUND THEN
        v_is_in_group := TRUE;
        v_actual_limit := v_group_info.image_limit;
        v_actual_usage := v_group_info.current_month_operations;
        
        -- Pour un groupe : vérifier la limite du groupe
        IF v_actual_usage + p_operations_count > v_actual_limit AND NOT p_success THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Group quota exceeded',
                'quota_type', 'group',
                'debug_info', 'Group limit check failed'
            );
        END IF;
    ELSE
        v_is_in_group := FALSE;
        v_actual_limit := v_user_profile.image_limit;
        v_actual_usage := v_user_stats.total_operations;
        
        -- Pas de groupe : vérifier la limite personnelle
        IF v_actual_usage + p_operations_count > v_actual_limit AND NOT p_success THEN
            RETURN json_build_object(
                'success', false,
                'error', 'User quota exceeded',
                'quota_type', 'user',
                'debug_info', 'User limit check failed'
            );
        END IF;
    END IF;
    
    -- Logger l'opération (CAST en operation_type ENUM)
    INSERT INTO processing_logs (
        user_id, operation_type, operations_count, success,
        processing_time_ms, file_size_bytes, error_message
    ) VALUES (
        p_user_id, p_operation_type::operation_type, p_operations_count, p_success,
        p_processing_time_ms, p_file_size_bytes, p_error_message
    );
    
    -- Mettre à jour les compteurs si succès
    IF p_success THEN
        -- Mettre à jour user_stats
        UPDATE user_stats SET
            bg_removal_count = CASE WHEN p_operation_type = 'bg_removal' THEN bg_removal_count + p_operations_count ELSE bg_removal_count END,
            resize_count = CASE WHEN p_operation_type = 'resize' THEN resize_count + p_operations_count ELSE resize_count END,
            head_crop_count = CASE WHEN p_operation_type = 'head_crop' THEN head_crop_count + p_operations_count ELSE head_crop_count END,
            total_operations = total_operations + p_operations_count,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Mettre à jour les compteurs de groupe si applicable
        IF v_is_in_group THEN
            UPDATE groups SET
                current_month_operations = current_month_operations + p_operations_count,
                updated_at = NOW()
            WHERE id = v_group_info.id;
            
            GET DIAGNOSTICS v_group_update_count = ROW_COUNT;
        END IF;
        
        -- Mettre à jour last_active de l'utilisateur
        UPDATE user_profiles SET
            last_active = NOW(),
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;
    
    -- Récupérer les nouvelles stats pour la réponse
    SELECT * INTO v_user_stats FROM user_stats WHERE user_id = p_user_id;
    
    RETURN json_build_object(
        'success', true,
        'remaining_operations', GREATEST(0, v_actual_limit - CASE WHEN v_is_in_group THEN v_group_info.current_month_operations ELSE v_user_stats.total_operations END),
        'current_usage', CASE WHEN v_is_in_group THEN v_group_info.current_month_operations ELSE v_user_stats.total_operations END,
        'limit', v_actual_limit,
        'user_level', v_user_profile.user_level,
        'debug_info', json_build_object(
            'operation_type', p_operation_type,
            'operations_count', p_operations_count,
            'success', p_success,
            'is_in_group', v_is_in_group,
            'group_name', CASE WHEN v_is_in_group THEN v_group_info.name ELSE NULL END,
            'groups_updated', v_group_update_count,
            'actual_limit', v_actual_limit,
            'actual_usage', v_actual_usage,
            'user_total_operations', v_user_stats.total_operations
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_processing_operation IS 'Version finale avec correction du type operation_type et logique groupe prioritaire';