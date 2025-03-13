/*
  # Create legal content table and update function

  1. New Table
    - `legal_content`
      - `id` (uuid, primary key)
      - `type` (text, unique) - Type of legal content (privacy, terms, gdpr)
      - `title` (text) - Title of the document
      - `content` (text) - Content of the document
      - `contact_email` (text) - Contact email displayed in the document
      - `last_updated_at` (timestamptz)
      - `created_at` (timestamptz)

  2. New Function
    - `update_contact_email` - Function to update contact email in all legal documents

  3. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create legal_content table
CREATE TABLE IF NOT EXISTS legal_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  contact_email text NOT NULL DEFAULT 'contact@miraubolant.com',
  last_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_legal_type UNIQUE (type),
  CONSTRAINT valid_type CHECK (type IN ('privacy', 'terms', 'gdpr')),
  CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE legal_content ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public can read legal content"
  ON legal_content
  FOR SELECT
  TO public
  USING (true);

-- Only admins can modify
CREATE POLICY "Only admins can modify legal content"
  ON legal_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_stats.user_id = auth.uid()
      AND user_stats.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_stats.user_id = auth.uid()
      AND user_stats.is_admin = true
    )
  );

-- Create function to update contact email
CREATE OR REPLACE FUNCTION update_contact_email(old_email text, new_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can update contact email';
  END IF;

  -- Update contact_email in all legal documents
  UPDATE legal_content
  SET 
    contact_email = new_email,
    last_updated_at = now()
  WHERE contact_email = old_email;
END;
$$;

-- Insert default content
INSERT INTO legal_content (type, title, content) VALUES
('privacy', 'Politique de confidentialité', 
'1. Données collectées
  - Adresse email pour l''authentification
  - Images téléchargées (temporairement)
  - Statistiques d''utilisation anonymes
  - Données de connexion sécurisées

2. Utilisation des données
  - Fournir le service de suppression d''arrière-plan
  - Améliorer la qualité du service
  - Assurer la sécurité de votre compte
  - Vous contacter si nécessaire

3. Protection des données
  - Chiffrement de bout en bout
  - Stockage sécurisé en Europe
  - Suppression automatique des images
  - Accès strictement contrôlé

4. Vos droits
  - Accès à vos données
  - Rectification des informations
  - Suppression du compte
  - Export des données

5. Cookies essentiels
  - Authentification sécurisée
  - Préférences utilisateur
  - Performance du service

6. Nous contacter
Pour toute question sur vos données :
contact@miraubolant.com'),

('terms', 'Conditions d''utilisation',
'1. Notre service
  - Suppression d''arrière-plan par IA
  - Traitement haute qualité
  - Export PNG/JPG optimisé
  - Stockage temporaire sécurisé

2. Règles d''utilisation
  - Usage légal uniquement
  - Pas de surcharge du service
  - Contenu approprié
  - Respect des droits d''auteur

3. Votre compte
  - Un compte par personne
  - Informations véridiques
  - Sécurité des accès
  - Respect des quotas

4. Propriété et droits
  - Vos images restent vôtres
  - Service protégé
  - Usage personnel
  - Pas de copie du service

5. Mises à jour
Les conditions peuvent évoluer. Les changements prennent effet immédiatement.

6. Contact
Questions ou suggestions :
contact@miraubolant.com'),

('gdpr', 'Conformité RGPD',
'1. Bases légales
  - Votre consentement explicite
  - Exécution de nos services
  - Obligations réglementaires
  - Intérêts légitimes

2. Vos droits garantis
  - Accès complet
  - Correction immédiate
  - Suppression définitive
  - Portabilité simplifiée
  - Opposition possible
  - Traitement limité

3. Conservation
  - Compte : jusqu''à suppression
  - Images : effacées après usage
  - Logs : 12 mois maximum
  - Backups : 30 jours

4. Sécurité des données
  - Hébergement européen
  - Aucun transfert hors UE
  - Partenaires conformes
  - Protection renforcée

5. Exercer vos droits
  - Contact direct DPO
  - Réponse sous 30 jours
  - Processus simplifié
  - Identité vérifiée

6. Délégué à la Protection
Notre DPO est à votre écoute :
contact@miraubolant.com');