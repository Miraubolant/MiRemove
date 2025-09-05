-- =====================================================
-- MIREMOVER - DATABASE SETUP PART 2
-- Triggers, Fonctions RPC, RLS et données par défaut
-- =====================================================

-- =================
-- ÉTAPE 4 - Triggers automatiques
-- =================

-- Fonction pour créer un profil utilisateur automatiquement
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, email, user_level, image_limit)
    VALUES (
        NEW.id,
        NEW.email,
        'free',
        100
    );
    
    -- Créer aussi les stats utilisateur
    INSERT INTO user_stats (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur inscription utilisateur
CREATE OR REPLACE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at sur toutes les tables concernées
CREATE OR REPLACE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =================
-- ÉTAPE 5 - Fonctions RPC principales
-- =================

-- Fonction pour logger une opération et mettre à jour les compteurs
CREATE OR REPLACE FUNCTION log_processing_operation(
    p_user_id UUID,
    p_operation_type operation_type,
    p_operations_count INTEGER DEFAULT 1,
    p_success BOOLEAN DEFAULT TRUE,
    p_processing_time_ms INTEGER DEFAULT NULL,
    p_file_size_bytes BIGINT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_user_profile user_profiles%ROWTYPE;
    v_user_stats user_stats%ROWTYPE;
    v_group_limit_exceeded BOOLEAN := FALSE;
    v_user_limit_exceeded BOOLEAN := FALSE;
    v_total_group_operations INTEGER := 0;
    v_result JSON;
BEGIN
    -- Récupérer le profil utilisateur
    SELECT * INTO v_user_profile 
    FROM user_profiles 
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Récupérer les stats utilisateur
    SELECT * INTO v_user_stats 
    FROM user_stats 
    WHERE user_id = p_user_id;
    
    -- Vérifier si on doit reset le mois (quotas glissants sur 30 jours)
    IF v_user_stats.current_month_start + INTERVAL '30 days' < CURRENT_DATE THEN
        -- Sauvegarder dans l'historique mensuel
        INSERT INTO monthly_usage_history (
            user_id, year_month, bg_removal_count, resize_count, 
            head_crop_count, total_operations
        )
        VALUES (
            p_user_id, 
            TO_CHAR(v_user_stats.current_month_start, 'YYYY-MM'),
            v_user_stats.bg_removal_count,
            v_user_stats.resize_count,
            v_user_stats.head_crop_count,
            v_user_stats.total_operations
        )
        ON CONFLICT (user_id, year_month) DO UPDATE SET
            bg_removal_count = EXCLUDED.bg_removal_count,
            resize_count = EXCLUDED.resize_count,
            head_crop_count = EXCLUDED.head_crop_count,
            total_operations = EXCLUDED.total_operations;
        
        -- Reset les compteurs
        UPDATE user_stats SET
            bg_removal_count = 0,
            resize_count = 0,
            head_crop_count = 0,
            total_operations = 0,
            current_month_start = CURRENT_DATE,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        -- Recharger les stats après reset
        SELECT * INTO v_user_stats FROM user_stats WHERE user_id = p_user_id;
    END IF;
    
    -- Vérifier les limites de groupe (priorité max)
    SELECT COALESCE(SUM(g.current_month_operations), 0) INTO v_total_group_operations
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = p_user_id 
    AND g.is_active = true;
    
    -- Si membre de groupe, vérifier limite groupe
    IF v_total_group_operations > 0 THEN
        SELECT EXISTS(
            SELECT 1 FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = p_user_id 
            AND g.current_month_operations + p_operations_count > g.image_limit
            AND g.is_active = true
        ) INTO v_group_limit_exceeded;
        
        IF v_group_limit_exceeded THEN
            RETURN json_build_object(
                'success', false, 
                'error', 'Group quota exceeded',
                'quota_type', 'group'
            );
        END IF;
    END IF;
    
    -- Vérifier limite utilisateur individuelle
    IF v_user_profile.user_level != 'admin' THEN
        IF v_user_stats.total_operations + p_operations_count > v_user_profile.image_limit THEN
            RETURN json_build_object(
                'success', false, 
                'error', 'User quota exceeded',
                'quota_type', 'user',
                'current_usage', v_user_stats.total_operations,
                'limit', v_user_profile.image_limit
            );
        END IF;
    END IF;
    
    -- Logger l'opération
    INSERT INTO processing_logs (
        user_id, operation_type, operations_count, success,
        processing_time_ms, file_size_bytes, error_message
    ) VALUES (
        p_user_id, p_operation_type, p_operations_count, p_success,
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
        UPDATE groups SET
            current_month_operations = current_month_operations + p_operations_count,
            updated_at = NOW()
        WHERE id IN (
            SELECT g.id FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = p_user_id AND g.is_active = true
        );
        
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
        'remaining_operations', GREATEST(0, v_user_profile.image_limit - v_user_stats.total_operations),
        'total_used', v_user_stats.total_operations,
        'limit', v_user_profile.image_limit,
        'user_level', v_user_profile.user_level
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur peut traiter
CREATE OR REPLACE FUNCTION check_user_quota(p_user_id UUID, p_operations_count INTEGER DEFAULT 1)
RETURNS JSON AS $$
DECLARE
    v_user_profile user_profiles%ROWTYPE;
    v_user_stats user_stats%ROWTYPE;
    v_can_process BOOLEAN := TRUE;
    v_reason TEXT := '';
BEGIN
    -- Récupérer profil et stats
    SELECT * INTO v_user_profile FROM user_profiles WHERE user_id = p_user_id;
    SELECT * INTO v_user_stats FROM user_stats WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('can_process', false, 'reason', 'User not found');
    END IF;
    
    -- Admin = toujours autorisé
    IF v_user_profile.user_level = 'admin' THEN
        RETURN json_build_object('can_process', true, 'remaining', -1);
    END IF;
    
    -- Vérifier limite groupe en premier
    IF EXISTS(
        SELECT 1 FROM groups g
        JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = p_user_id 
        AND g.current_month_operations + p_operations_count > g.image_limit
        AND g.is_active = true
    ) THEN
        RETURN json_build_object(
            'can_process', false, 
            'reason', 'Group quota exceeded',
            'quota_type', 'group'
        );
    END IF;
    
    -- Vérifier limite utilisateur
    IF v_user_stats.total_operations + p_operations_count > v_user_profile.image_limit THEN
        RETURN json_build_object(
            'can_process', false,
            'reason', 'User quota exceeded',
            'quota_type', 'user',
            'remaining', GREATEST(0, v_user_profile.image_limit - v_user_stats.total_operations)
        );
    END IF;
    
    RETURN json_build_object(
        'can_process', true,
        'remaining', v_user_profile.image_limit - v_user_stats.total_operations
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les stats dashboard admin
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    v_total_users INTEGER;
    v_active_users_today INTEGER;
    v_active_users_week INTEGER;
    v_total_operations_today INTEGER;
    v_total_operations_week INTEGER;
    v_total_operations_month INTEGER;
    v_success_rate NUMERIC;
    v_avg_processing_time NUMERIC;
    v_top_users JSON;
    v_operations_breakdown JSON;
    v_recent_activity JSON;
BEGIN
    -- Stats utilisateurs
    SELECT COUNT(*) INTO v_total_users FROM user_profiles WHERE is_active = true;
    
    SELECT COUNT(DISTINCT user_id) INTO v_active_users_today
    FROM processing_logs 
    WHERE created_at >= CURRENT_DATE;
    
    SELECT COUNT(DISTINCT user_id) INTO v_active_users_week
    FROM processing_logs 
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
    
    -- Stats opérations
    SELECT 
        COALESCE(SUM(operations_count), 0),
        COALESCE(AVG(CASE WHEN success THEN processing_time_ms END), 0),
        COALESCE(AVG(CASE WHEN success THEN 100.0 ELSE 0.0 END), 0)
    INTO v_total_operations_today, v_avg_processing_time, v_success_rate
    FROM processing_logs 
    WHERE created_at >= CURRENT_DATE;
    
    SELECT COALESCE(SUM(operations_count), 0) INTO v_total_operations_week
    FROM processing_logs 
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
    
    SELECT COALESCE(SUM(operations_count), 0) INTO v_total_operations_month
    FROM processing_logs 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Top 5 utilisateurs
    SELECT json_agg(user_data ORDER BY total_ops DESC) INTO v_top_users
    FROM (
        SELECT 
            up.email,
            us.total_operations as total_ops,
            up.user_level,
            up.last_active
        FROM user_profiles up
        JOIN user_stats us ON up.user_id = us.user_id
        ORDER BY us.total_operations DESC
        LIMIT 5
    ) user_data;
    
    -- Répartition des opérations (7 derniers jours)
    SELECT json_build_object(
        'bg_removal', COALESCE(SUM(CASE WHEN operation_type = 'bg_removal' THEN operations_count END), 0),
        'resize', COALESCE(SUM(CASE WHEN operation_type = 'resize' THEN operations_count END), 0),
        'head_crop', COALESCE(SUM(CASE WHEN operation_type = 'head_crop' THEN operations_count END), 0)
    ) INTO v_operations_breakdown
    FROM processing_logs 
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND success = true;
    
    -- Activité récente (10 derniers traitements)
    SELECT json_agg(activity_data ORDER BY created_at DESC) INTO v_recent_activity
    FROM (
        SELECT 
            pl.operation_type,
            pl.operations_count,
            pl.success,
            pl.created_at,
            up.email
        FROM processing_logs pl
        JOIN user_profiles up ON pl.user_id = up.user_id
        ORDER BY pl.created_at DESC
        LIMIT 10
    ) activity_data;
    
    RETURN json_build_object(
        'users', json_build_object(
            'total', v_total_users,
            'active_today', v_active_users_today,
            'active_week', v_active_users_week
        ),
        'operations', json_build_object(
            'today', v_total_operations_today,
            'week', v_total_operations_week,
            'month', v_total_operations_month,
            'success_rate', ROUND(v_success_rate, 2),
            'avg_processing_time_ms', ROUND(v_avg_processing_time, 0)
        ),
        'top_users', v_top_users,
        'operations_breakdown', v_operations_breakdown,
        'recent_activity', v_recent_activity,
        'generated_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les stats détaillées d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_detailed_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_profile user_profiles%ROWTYPE;
    v_stats user_stats%ROWTYPE;
    v_monthly_history JSON;
    v_recent_operations JSON;
    v_group_info JSON;
BEGIN
    SELECT * INTO v_profile FROM user_profiles WHERE user_id = p_user_id;
    SELECT * INTO v_stats FROM user_stats WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'User not found');
    END IF;
    
    -- Historique mensuel (6 derniers mois)
    SELECT json_agg(history_data ORDER BY year_month DESC) INTO v_monthly_history
    FROM (
        SELECT year_month, total_operations, bg_removal_count, resize_count, head_crop_count
        FROM monthly_usage_history
        WHERE user_id = p_user_id
        ORDER BY year_month DESC
        LIMIT 6
    ) history_data;
    
    -- Opérations récentes (20 dernières)
    SELECT json_agg(operation_data ORDER BY created_at DESC) INTO v_recent_operations
    FROM (
        SELECT operation_type, operations_count, success, processing_time_ms, created_at
        FROM processing_logs
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 20
    ) operation_data;
    
    -- Info groupe si applicable
    SELECT json_agg(group_data) INTO v_group_info
    FROM (
        SELECT g.name, g.image_limit, g.current_month_operations, gm.joined_at
        FROM groups g
        JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = p_user_id AND g.is_active = true
    ) group_data;
    
    RETURN json_build_object(
        'profile', json_build_object(
            'email', v_profile.email,
            'user_level', v_profile.user_level,
            'image_limit', v_profile.image_limit,
            'created_at', v_profile.created_at,
            'last_active', v_profile.last_active
        ),
        'current_month', json_build_object(
            'bg_removal_count', v_stats.bg_removal_count,
            'resize_count', v_stats.resize_count,
            'head_crop_count', v_stats.head_crop_count,
            'total_operations', v_stats.total_operations,
            'remaining', GREATEST(0, v_profile.image_limit - v_stats.total_operations),
            'month_start', v_stats.current_month_start
        ),
        'monthly_history', v_monthly_history,
        'recent_operations', v_recent_operations,
        'groups', v_group_info
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;