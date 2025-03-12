/*
  # Ajout d'options administrateur

  1. Nouvelles Tables
    - `admin_settings`
      - `key` (text, primary key) - Clé unique du paramètre
      - `value` (jsonb) - Valeur du paramètre en format JSON
      - `description` (text) - Description du paramètre
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Paramètres initiaux
    - Limites de traitement par utilisateur
    - Configuration des modèles d'IA
    - Paramètres de compression d'image
    - Statistiques globales

  3. Sécurité
    - Enable RLS
    - Policies pour restreindre l'accès aux administrateurs
*/

-- Création de la table admin_settings
CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Politique d'accès pour les administrateurs
CREATE POLICY "Les administrateurs peuvent lire les paramètres"
  ON admin_settings
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ));

CREATE POLICY "Les administrateurs peuvent modifier les paramètres"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ));

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Insertion des paramètres par défaut
INSERT INTO admin_settings (key, value, description) VALUES
  ('user_limits', jsonb_build_object(
    'free_user_max_images', 5,
    'max_file_size_mb', 10,
    'max_concurrent_processes', 3,
    'cooldown_period_minutes', 5
  ), 'Limites de traitement pour les utilisateurs'),
  
  ('ai_models', jsonb_build_object(
    'enabled_models', array['isnet-general-use', 'silueta', 'u2net', 'u2netp', 'u2net_human_seg'],
    'default_model', 'isnet-general-use',
    'model_quotas', jsonb_build_object(
      'free_users', array['u2netp'],
      'premium_users', array['isnet-general-use', 'silueta', 'u2net', 'u2netp', 'u2net_human_seg']
    )
  ), 'Configuration des modèles d''IA'),
  
  ('image_processing', jsonb_build_object(
    'max_width', 2048,
    'max_height', 2048,
    'default_quality', 0.8,
    'compression_enabled', true,
    'allowed_formats', array['image/jpeg', 'image/png', 'image/webp']
  ), 'Paramètres de traitement d''image'),
  
  ('maintenance', jsonb_build_object(
    'maintenance_mode', false,
    'maintenance_message', 'Site en maintenance, merci de revenir plus tard.',
    'allowed_ips', array[]::text[]
  ), 'Paramètres de maintenance'),
  
  ('analytics', jsonb_build_object(
    'total_images_processed', 0,
    'total_processing_time', 0,
    'average_processing_time', 0,
    'success_rate', 100,
    'last_updated', now()
  ), 'Statistiques globales du système');

-- Ajout de nouvelles colonnes à user_stats
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS quota_limit integer DEFAULT 100;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS quota_reset_at timestamptz DEFAULT now();
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;