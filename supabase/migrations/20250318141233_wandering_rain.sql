/*
  # Gestion des abonnements et limites d'images
  
  1. Nouvelles Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Référence à auth.users
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `plan_id` (text)
      - `status` (text)
      - `current_period_end` (timestamptz)
      - `cancel_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Nouvelle fonction et trigger
    - Fonction `handle_subscription_update`
    - Trigger pour mettre à jour automatiquement les limites d'images

  3. Sécurité
    - Enable RLS
    - Policies pour les utilisateurs et administrateurs
*/

-- Créer la table des abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_id text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id),
  UNIQUE(stripe_customer_id),
  UNIQUE(stripe_subscription_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Créer les policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_stats.user_id = auth.uid()
      AND user_stats.is_admin = true
    )
  );

-- Fonction pour mettre à jour la limite d'images
CREATE OR REPLACE FUNCTION handle_subscription_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mettre à jour la limite d'images en fonction du plan
  UPDATE user_stats
  SET image_limit = CASE 
    WHEN NEW.plan_id = 'prod_Rxa1floPbtBu3t' THEN 1000    -- Personal
    WHEN NEW.plan_id = 'prod_Rxa1zKK2MAm2eD' THEN 5000    -- Pro
    WHEN NEW.plan_id = 'prod_Rxa1dCzpDIZiv1' THEN 10000   -- Elite
    ELSE image_limit  -- Garder la limite actuelle si plan non reconnu
  END,
  updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Créer le trigger sur la table subscriptions
CREATE TRIGGER update_image_limit_on_subscription
  AFTER INSERT OR UPDATE
  ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_update();

-- Ajouter des commentaires explicatifs
COMMENT ON TABLE subscriptions IS 'Table des abonnements utilisateurs';
COMMENT ON FUNCTION handle_subscription_update() IS 'Met à jour la limite d''images utilisateur en fonction du plan d''abonnement';
COMMENT ON TRIGGER update_image_limit_on_subscription ON subscriptions IS 'Déclenche la mise à jour de la limite d''images lors des changements d''abonnement';