-- =====================================================
-- FIX TRIGGER - Correction du trigger qui cause l'erreur 500
-- =====================================================

-- Supprimer le trigger problématique
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

-- Créer une version plus robuste du trigger
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si le profil existe déjà
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = NEW.id) THEN
        -- Créer le profil utilisateur
        INSERT INTO user_profiles (user_id, email, user_level, image_limit)
        VALUES (
            NEW.id,
            COALESCE(NEW.email, 'unknown@example.com'),
            'free',
            100
        ) ON CONFLICT (user_id) DO NOTHING;
        
        -- Créer les stats utilisateur
        INSERT INTO user_stats (user_id)
        VALUES (NEW.id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, on log mais on n'empêche pas l'inscription
        RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger avec gestion d'erreur
CREATE OR REPLACE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Fonction manuelle pour créer un profil si le trigger a échoué
CREATE OR REPLACE FUNCTION create_user_profile_manual(p_user_id UUID, p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Créer le profil utilisateur
    INSERT INTO user_profiles (user_id, email, user_level, image_limit)
    VALUES (p_user_id, p_email, 'free', 100)
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    -- Créer les stats utilisateur
    INSERT INTO user_stats (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in create_user_profile_manual: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;