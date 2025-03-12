/*
  # Ajout du suivi des adresses IP

  1. Nouvelle Table
    - `ip_usage_logs`
      - `id` (uuid, clé primaire)
      - `ip_address` (text, adresse IP de l'utilisateur)
      - `user_id` (uuid, optionnel, référence vers auth.users)
      - `process_count` (integer, nombre de traitements)
      - `last_process_at` (timestamp, dernière utilisation)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Active RLS sur la table
    - Ajoute des politiques de sécurité pour limiter l'accès
    - Seuls les admins peuvent lire toutes les entrées
    - Les utilisateurs ne peuvent voir que leurs propres logs
*/

-- Création de la table de logs IP
CREATE TABLE IF NOT EXISTS ip_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  process_count integer DEFAULT 0,
  last_process_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_ip_usage_logs_ip_address ON ip_usage_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_usage_logs_user_id ON ip_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ip_usage_logs_last_process ON ip_usage_logs(last_process_at DESC);

-- Activer RLS
ALTER TABLE ip_usage_logs ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Les admins peuvent tout voir" ON ip_usage_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_stats.user_id = auth.uid()
      AND user_stats.is_admin = true
    )
  );

CREATE POLICY "Les utilisateurs peuvent voir leurs propres logs" ON ip_usage_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_ip_usage_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_ip_usage_logs_updated_at
  BEFORE UPDATE ON ip_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_ip_usage_logs_updated_at();