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

  -- Validate new email format
  IF new_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Update contact_email in all legal documents
  UPDATE legal_content
  SET 
    contact_email = new_email,
    last_updated_at = now()
  WHERE contact_email = old_email;
END;
$$;