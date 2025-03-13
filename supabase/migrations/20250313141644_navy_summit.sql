/*
  # Fix legal content email updates

  1. Changes
    - Drop existing table and function
    - Recreate table with proper constraints
    - Add improved email update function
    - Add trigger for last_updated_at
    
  2. Security
    - Maintain RLS policies
    - Add proper validation
*/

-- Drop existing objects
DROP TABLE IF EXISTS legal_content CASCADE;
DROP FUNCTION IF EXISTS update_contact_email CASCADE;

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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_legal_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last_updated_at
CREATE TRIGGER update_legal_content_last_updated_at
  BEFORE UPDATE ON legal_content
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_content_updated_at();

-- Create improved email update function
CREATE OR REPLACE FUNCTION update_contact_email(old_email text, new_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
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

  -- Check if old email exists
  SELECT COUNT(*) INTO v_count
  FROM legal_content
  WHERE contact_email = old_email;

  IF v_count = 0 THEN
    RAISE EXCEPTION 'Old email not found';
  END IF;

  -- Update contact_email in all legal documents
  UPDATE legal_content
  SET contact_email = new_email
  WHERE contact_email = old_email;

  -- Verify update
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN
    RAISE EXCEPTION 'No rows were updated';
  END IF;
END;
$$;