/*
  # Système de facturation

  1. Nouvelles Tables
    - `billing_templates`
      - `id` (uuid, primary key)
      - `name` (text) - Nom du modèle
      - `content` (text) - Contenu du modèle avec champs de fusion
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `billing_fields`
      - `id` (uuid, primary key)
      - `template_id` (uuid) - Référence au modèle
      - `name` (text) - Nom du champ affiché
      - `key` (text) - Clé unique pour le champ de fusion
      - `created_at` (timestamp)

    - `invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Référence à l'utilisateur
      - `template_id` (uuid) - Référence au modèle utilisé
      - `amount` (numeric) - Montant de la facture
      - `status` (text) - État de la facture (draft, sent, paid, cancelled)
      - `email` (text) - Email de destination
      - `sent_at` (timestamp) - Date d'envoi
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Seuls les administrateurs peuvent gérer les modèles et les champs
    - Les utilisateurs peuvent voir leurs propres factures
*/

-- Création des tables
CREATE TABLE IF NOT EXISTS billing_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES billing_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_id, key)
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES billing_templates(id),
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  email text NOT NULL,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE billing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Suppression des politiques existantes si elles existent
DROP POLICY IF EXISTS "Admins can manage billing templates" ON billing_templates;
DROP POLICY IF EXISTS "Admins can manage billing fields" ON billing_fields;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;

-- Création des nouvelles politiques
CREATE POLICY "Admins can manage billing templates" ON billing_templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_stats 
    WHERE user_stats.user_id = auth.uid() 
    AND user_stats.is_admin = true
  ));

CREATE POLICY "Admins can manage billing fields" ON billing_fields
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_stats 
    WHERE user_stats.user_id = auth.uid() 
    AND user_stats.is_admin = true
  ));

CREATE POLICY "Admins can manage all invoices" ON invoices
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_stats 
    WHERE user_stats.user_id = auth.uid() 
    AND user_stats.is_admin = true
  ));

CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (user_id = auth.uid());

-- Création ou remplacement de la fonction trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Suppression des triggers existants s'ils existent
DROP TRIGGER IF EXISTS update_billing_templates_updated_at ON billing_templates;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;

-- Création des nouveaux triggers
CREATE TRIGGER update_billing_templates_updated_at
  BEFORE UPDATE ON billing_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();