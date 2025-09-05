-- =====================================================
-- DISABLE RLS FOR DEVELOPMENT - Attention: Seulement pour dev !
-- =====================================================

-- Désactiver RLS temporairement pour le développement
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE processing_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- NOTE: Ceci supprime la sécurité ! A réactiver en production :
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
-- etc...