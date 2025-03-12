/*
  # Améliorations de sécurité

  1. Nouvelles fonctionnalités
    - Ajout de rate limiting pour les connexions
    - Ajout de validation d'adresse IP
    - Ajout d'un journal de sécurité
    - Ajout de contraintes de sécurité supplémentaires

  2. Sécurité
    - Renforcement des politiques RLS
    - Ajout de validation des entrées
    - Protection contre les attaques par force brute
*/

-- Table pour le rate limiting des connexions
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  ip_address text PRIMARY KEY,
  attempt_count integer DEFAULT 1,
  last_attempt_at timestamptz DEFAULT now(),
  is_blocked boolean DEFAULT false,
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Table pour le journal de sécurité
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  ip_address text NOT NULL,
  event_type text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Fonction pour enregistrer les événements de sécurité
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_ip_address text,
  p_event_type text,
  p_details jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO security_logs (user_id, ip_address, event_type, details)
  VALUES (p_user_id, p_ip_address, p_event_type, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier et mettre à jour le rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip_address text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
) RETURNS boolean AS $$
DECLARE
  v_record auth_rate_limits%ROWTYPE;
BEGIN
  -- Récupérer ou créer l'enregistrement
  INSERT INTO auth_rate_limits (ip_address)
  VALUES (p_ip_address)
  ON CONFLICT (ip_address) DO UPDATE
  SET attempt_count = 
    CASE 
      WHEN auth_rate_limits.last_attempt_at < now() - make_interval(mins := p_window_minutes)
      THEN 1
      ELSE auth_rate_limits.attempt_count + 1
    END,
    last_attempt_at = now(),
    is_blocked = 
      CASE 
      WHEN auth_rate_limits.attempt_count >= p_max_attempts THEN true
      ELSE false
      END,
    blocked_until = 
      CASE 
      WHEN auth_rate_limits.attempt_count >= p_max_attempts 
      THEN now() + interval '1 hour'
      ELSE null
      END
  RETURNING *
  INTO v_record;

  -- Vérifier si l'IP est bloquée
  RETURN NOT v_record.is_blocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter des colonnes de sécurité à user_stats
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS last_password_change timestamptz,
ADD COLUMN IF NOT EXISTS password_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS account_locked_until timestamptz,
ADD COLUMN IF NOT EXISTS last_login_ip text,
ADD COLUMN IF NOT EXISTS allowed_ips text[],
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;

-- Ajouter des contraintes de validation
ALTER TABLE user_stats
ADD CONSTRAINT valid_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT max_failed_attempts 
  CHECK (failed_login_attempts <= 10);

-- Activer RLS sur les nouvelles tables
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour le journal de sécurité
CREATE POLICY "Les administrateurs peuvent voir tous les logs"
ON security_logs
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_stats
  WHERE user_stats.user_id = auth.uid()
  AND user_stats.is_admin = true
));

-- Politique pour les rate limits
CREATE POLICY "Les administrateurs peuvent gérer les rate limits"
ON auth_rate_limits
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_stats
  WHERE user_stats.user_id = auth.uid()
  AND user_stats.is_admin = true
));

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_last_attempt ON auth_rate_limits(last_attempt_at DESC);