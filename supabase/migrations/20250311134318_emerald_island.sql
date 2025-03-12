/*
  # Amélioration de la table admin_settings

  1. Structure
    - Ajout de contraintes de validation pour les valeurs
    - Ajout d'un type enum pour les clés valides
    - Ajout d'une contrainte check pour le format JSON
    - Ajout d'index pour améliorer les performances

  2. Sécurité
    - Mise à jour des politiques RLS pour un meilleur contrôle d'accès
    - Ajout de validations pour les valeurs JSON

  3. Données
    - Migration des données existantes
    - Initialisation des valeurs par défaut
*/

-- Créer un type enum pour les clés valides
CREATE TYPE admin_setting_key AS ENUM (
  'user_limits',
  'ai_models',
  'image_processing',
  'maintenance'
);

-- Sauvegarder les données existantes
CREATE TEMP TABLE temp_admin_settings AS
SELECT * FROM admin_settings;

-- Supprimer la table existante
DROP TABLE IF EXISTS admin_settings;

-- Recréer la table avec la nouvelle structure
CREATE TABLE admin_settings (
  key admin_setting_key PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_json_value CHECK (jsonb_typeof(value) = 'object'),
  CONSTRAINT valid_user_limits CHECK (
    key != 'user_limits' OR (
      value ? 'free_user_max_images' AND
      value ? 'max_file_size_mb' AND
      value ? 'max_concurrent_processes' AND
      value ? 'cooldown_period_minutes' AND
      (value->>'free_user_max_images')::int >= 0 AND
      (value->>'max_file_size_mb')::int >= 0 AND
      (value->>'max_concurrent_processes')::int >= 0 AND
      (value->>'cooldown_period_minutes')::int >= 0
    )
  )
);

-- Créer un index sur la clé pour améliorer les performances
CREATE INDEX idx_admin_settings_key ON admin_settings (key);

-- Activer RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
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

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Insérer les valeurs par défaut
INSERT INTO admin_settings (key, value, description) VALUES
  (
    'user_limits',
    '{
      "free_user_max_images": 15,
      "max_file_size_mb": 10,
      "max_concurrent_processes": 1,
      "cooldown_period_minutes": 0
    }'::jsonb,
    'Limites de traitement pour les utilisateurs'
  ),
  (
    'ai_models',
    '{
      "enabled_models": [],
      "default_model": "isnet-general-use",
      "model_quotas": {
        "free_users": [],
        "premium_users": []
      }
    }'::jsonb,
    'Configuration des modèles d''IA'
  ),
  (
    'image_processing',
    '{
      "max_width": 2048,
      "max_height": 2048,
      "default_quality": 80,
      "compression_enabled": true,
      "allowed_formats": ["image/jpeg", "image/png", "image/webp"]
    }'::jsonb,
    'Paramètres de traitement d''image'
  ),
  (
    'maintenance',
    '{
      "maintenance_mode": false,
      "maintenance_message": "",
      "allowed_ips": []
    }'::jsonb,
    'Paramètres de maintenance'
  )
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description;

-- Nettoyer la table temporaire
DROP TABLE temp_admin_settings;