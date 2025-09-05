-- =====================================================
-- MIREMOVER - DATABASE SETUP PART 3  
-- RLS Policies et données par défaut
-- =====================================================

-- =================
-- ÉTAPE 6 - Politiques RLS (Row Level Security)
-- =================

-- Activer RLS sur toutes les tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.user_level = 'admin'
        )
    );

-- Politiques pour user_stats
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stats" ON user_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.user_level = 'admin'
        )
    );

-- Politiques pour monthly_usage_history
CREATE POLICY "Users can view own history" ON monthly_usage_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert history" ON monthly_usage_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all history" ON monthly_usage_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.user_level = 'admin'
        )
    );

-- Politiques pour groups
CREATE POLICY "Users can view groups they belong to" ON groups
    FOR SELECT USING (
        id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all groups" ON groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.user_level = 'admin'
        )
    );

-- Politiques pour group_members
CREATE POLICY "Users can view own group memberships" ON group_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage group memberships" ON group_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.user_level = 'admin'
        )
    );

-- Politiques pour processing_logs
CREATE POLICY "Users can view own processing logs" ON processing_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert processing logs" ON processing_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all processing logs" ON processing_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.user_level = 'admin'
        )
    );

-- Politiques pour admin_settings
CREATE POLICY "Admins can manage settings" ON admin_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.user_level = 'admin'
        )
    );

-- =================
-- ÉTAPE 7 - Données par défaut
-- =================

-- Paramètres admin par défaut
INSERT INTO admin_settings (key, value, description) VALUES
('free_user_max_images', '100', 'Limite d''images pour les utilisateurs gratuits'),
('premium_user_max_images', '1000', 'Limite d''images pour les utilisateurs premium'),
('max_file_size_mb', '10', 'Taille maximale des fichiers en MB'),
('max_concurrent_processes', '1', 'Nombre de processus simultanés par utilisateur gratuit'),
('premium_concurrent_processes', '3', 'Nombre de processus simultanés par utilisateur premium'),
('cooldown_period_minutes', '0', 'Période de cooldown entre traitements (utilisateurs gratuits)'),
('max_width', '2048', 'Largeur maximale autorisée'),
('max_height', '2048', 'Hauteur maximale autorisée'),
('default_quality', '80', 'Qualité par défaut pour la compression'),
('compression_enabled', 'true', 'Activer la compression automatique'),
('maintenance_mode', 'false', 'Mode maintenance activé'),
('maintenance_message', 'Site en maintenance, merci de revenir plus tard.', 'Message affiché en mode maintenance'),
('logs_retention_days', '90', 'Nombre de jours de rétention des logs'),
('analytics_enabled', 'true', 'Activer les analytics'),
('max_batch_size', '10', 'Nombre maximum d''images dans un batch');

-- =================
-- ÉTAPE 8 - Tâches automatiques (pg_cron)
-- =================

-- Nettoyer les anciens logs (tous les jours à 2h du matin, heure française)
SELECT cron.schedule(
    'cleanup-old-logs',
    '0 2 * * *',
    $$DELETE FROM processing_logs WHERE created_at < NOW() - INTERVAL '90 days';$$
);

-- Reset mensuel des quotas groupe si nécessaire (tous les jours à 1h du matin)
SELECT cron.schedule(
    'reset-group-quotas-if-needed',
    '0 1 * * *',
    $$
    UPDATE groups 
    SET current_month_operations = 0, 
        current_month_start = CURRENT_DATE,
        updated_at = NOW()
    WHERE current_month_start + INTERVAL '30 days' < CURRENT_DATE
    AND is_active = true;
    $$
);

-- =================
-- ÉTAPE 9 - Fonctions utilitaires supplémentaires
-- =================

-- Fonction pour promouvoir un utilisateur admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT user_id INTO v_user_id 
    FROM user_profiles 
    WHERE email = p_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % not found', p_email;
    END IF;
    
    UPDATE user_profiles 
    SET user_level = 'admin', 
        image_limit = 999999, -- Quasi-illimité pour admin
        updated_at = NOW()
    WHERE user_id = v_user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les stats d'un groupe
CREATE OR REPLACE FUNCTION get_group_stats(p_group_id UUID)
RETURNS JSON AS $$
DECLARE
    v_group groups%ROWTYPE;
    v_member_count INTEGER;
    v_total_processed INTEGER;
    v_member_stats JSON;
BEGIN
    SELECT * INTO v_group FROM groups WHERE id = p_group_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Group not found');
    END IF;
    
    SELECT COUNT(*) INTO v_member_count 
    FROM group_members 
    WHERE group_id = p_group_id;
    
    SELECT json_agg(member_data) INTO v_member_stats
    FROM (
        SELECT 
            up.email,
            us.total_operations,
            up.user_level,
            up.last_active,
            gm.joined_at
        FROM group_members gm
        JOIN user_profiles up ON gm.user_id = up.user_id
        JOIN user_stats us ON up.user_id = us.user_id
        WHERE gm.group_id = p_group_id
        ORDER BY us.total_operations DESC
    ) member_data;
    
    RETURN json_build_object(
        'group_info', json_build_object(
            'id', v_group.id,
            'name', v_group.name,
            'description', v_group.description,
            'image_limit', v_group.image_limit,
            'current_month_operations', v_group.current_month_operations,
            'remaining_operations', GREATEST(0, v_group.image_limit - v_group.current_month_operations),
            'member_count', v_member_count,
            'created_at', v_group.created_at
        ),
        'members', v_member_stats
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter/retirer un utilisateur d'un groupe
CREATE OR REPLACE FUNCTION manage_group_member(
    p_group_id UUID,
    p_user_email TEXT,
    p_action TEXT -- 'add' ou 'remove'
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_group_exists BOOLEAN;
BEGIN
    -- Vérifier que le groupe existe
    SELECT EXISTS(SELECT 1 FROM groups WHERE id = p_group_id AND is_active = true) 
    INTO v_group_exists;
    
    IF NOT v_group_exists THEN
        RETURN json_build_object('success', false, 'error', 'Group not found or inactive');
    END IF;
    
    -- Trouver l'utilisateur
    SELECT user_id INTO v_user_id 
    FROM user_profiles 
    WHERE email = p_user_email AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;
    
    IF p_action = 'add' THEN
        INSERT INTO group_members (group_id, user_id)
        VALUES (p_group_id, v_user_id)
        ON CONFLICT (group_id, user_id) DO NOTHING;
        
        RETURN json_build_object('success', true, 'action', 'added');
    
    ELSIF p_action = 'remove' THEN
        DELETE FROM group_members 
        WHERE group_id = p_group_id AND user_id = v_user_id;
        
        RETURN json_build_object('success', true, 'action', 'removed');
    
    ELSE
        RETURN json_build_object('success', false, 'error', 'Invalid action. Use add or remove');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================
-- FIN SETUP COMPLET
-- =================

-- Commentaire final
COMMENT ON SCHEMA public IS 'MiRemover - Base de données complète avec gestion des quotas mensuels glissants, groupes, et analytics avancées';

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE 'DATABASE SETUP COMPLETE! 🚀';
    RAISE NOTICE 'Next step: Execute promote_user_to_admin(''victor@mirault.com'') to create your admin account after first login.';
END $$;