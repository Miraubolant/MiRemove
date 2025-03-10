/*
  # Création de la table des statistiques utilisateur

  1. Nouvelle Table
    - `user_stats`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, clé étrangère vers auth.users)
      - `processed_images` (integer, nombre total d'images traitées)
      - `success_count` (integer, nombre de traitements réussis)
      - `failure_count` (integer, nombre d'échecs)
      - `total_processing_time` (float, temps total de traitement en secondes)
      - `is_admin` (boolean, indique si l'utilisateur est administrateur)
      - `created_at` (timestamp avec fuseau horaire)
      - `updated_at` (timestamp avec fuseau horaire)

  2. Sécurité
    - Active RLS sur la table user_stats
    - Ajoute des politiques pour :
      - Lecture : utilisateurs authentifiés peuvent lire leurs propres stats
      - Écriture : utilisateurs authentifiés peuvent mettre à jour leurs propres stats
      - Admin : accès complet aux administrateurs
*/

-- Création de la table user_stats
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  processed_images integer DEFAULT 0,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  total_processing_time float DEFAULT 0,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Active RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les utilisateurs
CREATE POLICY "Users can read own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    is_admin = true
  );

-- Politique de mise à jour pour les utilisateurs
CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique d'insertion pour les utilisateurs
CREATE POLICY "Users can insert own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_processed_images ON user_stats(processed_images DESC);