-- =====================================================
-- MONTHLY USAGE AGGREGATION - Fonction et automatisation
-- =====================================================

-- =================
-- FONCTION D'AGRÉGATION MENSUELLE
-- =================

CREATE OR REPLACE FUNCTION aggregate_monthly_usage(p_year_month TEXT DEFAULT NULL)
RETURNS TABLE(
    users_processed INTEGER,
    total_records_created INTEGER,
    execution_time TEXT
) AS $$
DECLARE
    v_target_month TEXT;
    v_start_time TIMESTAMP;
    v_users_count INTEGER := 0;
    v_records_count INTEGER := 0;
    v_execution_time INTERVAL;
BEGIN
    v_start_time := NOW();
    
    -- Déterminer le mois cible (par défaut: mois précédent)
    IF p_year_month IS NULL THEN
        v_target_month := TO_CHAR(DATE_TRUNC('month', NOW() - INTERVAL '1 month'), 'YYYY-MM');
    ELSE
        v_target_month := p_year_month;
    END IF;
    
    -- Calculer la période du mois cible
    DECLARE
        v_month_start DATE := (v_target_month || '-01')::DATE;
        v_month_end DATE := v_month_start + INTERVAL '1 month' - INTERVAL '1 day';
    BEGIN
        
        -- Insérer/Mettre à jour l'historique mensuel pour chaque utilisateur
        INSERT INTO monthly_usage_history (user_id, year_month, bg_removal_count, resize_count, head_crop_count, total_operations)
        SELECT 
            up.user_id,
            v_target_month,
            COALESCE(SUM(CASE WHEN pl.operation_type = 'bg_removal' THEN pl.operations_count ELSE 0 END), 0) as bg_removal_count,
            COALESCE(SUM(CASE WHEN pl.operation_type = 'resize' THEN pl.operations_count ELSE 0 END), 0) as resize_count,
            COALESCE(SUM(CASE WHEN pl.operation_type = 'head_crop' THEN pl.operations_count ELSE 0 END), 0) as head_crop_count,
            COALESCE(SUM(pl.operations_count), 0) as total_operations
        FROM user_profiles up
        LEFT JOIN processing_logs pl ON up.user_id = pl.user_id 
            AND pl.success = true
            AND pl.created_at >= v_month_start 
            AND pl.created_at <= v_month_end + INTERVAL '1 day'
        WHERE up.is_active = true
        GROUP BY up.user_id
        HAVING COALESCE(SUM(pl.operations_count), 0) > 0  -- Seulement les utilisateurs avec activité
        
        ON CONFLICT (user_id, year_month) 
        DO UPDATE SET
            bg_removal_count = EXCLUDED.bg_removal_count,
            resize_count = EXCLUDED.resize_count,
            head_crop_count = EXCLUDED.head_crop_count,
            total_operations = EXCLUDED.total_operations,
            created_at = NOW();
        
        GET DIAGNOSTICS v_records_count = ROW_COUNT;
        
        -- Compter les utilisateurs uniques traités
        SELECT COUNT(DISTINCT up.user_id)
        INTO v_users_count
        FROM user_profiles up
        JOIN processing_logs pl ON up.user_id = pl.user_id 
        WHERE pl.success = true
        AND pl.created_at >= v_month_start 
        AND pl.created_at <= v_month_end + INTERVAL '1 day';
        
    END;
    
    v_execution_time := NOW() - v_start_time;
    
    -- Retourner les statistiques d'exécution
    RETURN QUERY SELECT 
        v_users_count,
        v_records_count,
        v_execution_time::TEXT;
        
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================
-- FONCTION POUR EXPORT ADMIN (avec email + groupe)
-- =================

CREATE OR REPLACE FUNCTION get_monthly_usage_with_details(p_year_month TEXT)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    group_name TEXT,
    bg_removal_count INTEGER,
    resize_count INTEGER,
    head_crop_count INTEGER,
    total_operations INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        muh.user_id,
        up.email,
        COALESCE(g.name, 'Aucun groupe'::TEXT) as group_name,
        muh.bg_removal_count,
        muh.resize_count,
        muh.head_crop_count,
        muh.total_operations,
        muh.created_at
    FROM monthly_usage_history muh
    JOIN user_profiles up ON muh.user_id = up.user_id
    LEFT JOIN group_members gm ON up.user_id = gm.user_id
    LEFT JOIN groups g ON gm.group_id = g.id
    WHERE muh.year_month = p_year_month
    ORDER BY muh.total_operations DESC, up.email ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================
-- FONCTION MANUELLE ADMIN
-- =================

CREATE OR REPLACE FUNCTION admin_trigger_monthly_aggregation(p_year_month TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    v_result RECORD;
    v_response JSON;
BEGIN
    -- Exécuter l'agrégation
    SELECT * INTO v_result FROM aggregate_monthly_usage(p_year_month);
    
    -- Construire la réponse JSON
    v_response := json_build_object(
        'success', true,
        'target_month', COALESCE(p_year_month, TO_CHAR(DATE_TRUNC('month', NOW() - INTERVAL '1 month'), 'YYYY-MM')),
        'users_processed', v_result.users_processed,
        'records_created', v_result.total_records_created,
        'execution_time', v_result.execution_time,
        'executed_at', NOW()
    );
    
    RETURN v_response;
EXCEPTION 
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'executed_at', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================
-- TÂCHE AUTOMATIQUE - 1er de chaque mois à 3h du matin
-- =================

SELECT cron.schedule(
    'monthly-usage-aggregation',
    '0 3 1 * *',  -- 3h du matin le 1er de chaque mois
    $$SELECT aggregate_monthly_usage();$$
);

-- =================
-- PERMISSIONS
-- =================

-- Accès aux fonctions pour les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION get_monthly_usage_with_details(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_trigger_monthly_aggregation(TEXT) TO authenticated;

-- =================
-- COMMENTAIRES
-- =================

COMMENT ON FUNCTION aggregate_monthly_usage(TEXT) IS 'Agrège les données d''usage mensuel depuis processing_logs vers monthly_usage_history';
COMMENT ON FUNCTION get_monthly_usage_with_details(TEXT) IS 'Récupère les données d''usage mensuel avec email et groupe pour export admin';
COMMENT ON FUNCTION admin_trigger_monthly_aggregation(TEXT) IS 'Fonction admin pour déclencher manuellement l''agrégation mensuelle';