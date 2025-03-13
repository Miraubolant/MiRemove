/*
  # Create legal content table

  1. New Table
    - `legal_content`
      - `id` (uuid, primary key)
      - `type` (text) - Type of legal content (privacy, terms, gdpr)
      - `content` (text) - HTML content
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Allow public read access
*/

-- Create legal_content table
CREATE TABLE legal_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_legal_type UNIQUE (type)
);

-- Enable RLS
ALTER TABLE legal_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON legal_content
  FOR SELECT
  TO public
  USING (true);

-- Only admins can modify content
CREATE POLICY "Only admins can modify content"
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

-- Add trigger for updating updated_at
CREATE TRIGGER update_legal_content_updated_at
  BEFORE UPDATE ON legal_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default content
INSERT INTO legal_content (type, content) VALUES
  ('privacy', '<h2>Politique de confidentialité</h2><p>Votre confidentialité est importante pour nous...</p>'),
  ('terms', '<h2>Conditions d''utilisation</h2><p>En utilisant notre service, vous acceptez...</p>'),
  ('gdpr', '<h2>RGPD</h2><p>Conformément au Règlement Général sur la Protection des Données...</p>')
ON CONFLICT (type) DO NOTHING;