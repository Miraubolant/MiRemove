/*
  # Create info_miraubolant table and remove legal_content

  1. Changes
    - Drop existing legal_content table
    - Create new info_miraubolant table for site configuration
    - Add contact email field with validation
    - Add RLS policies for admin access
    - Add function to update contact email

  2. Security
    - Enable RLS
    - Only admins can modify settings
    - Public can read settings
*/

-- Drop existing table and functions
DROP TABLE IF EXISTS legal_content CASCADE;
DROP FUNCTION IF EXISTS update_contact_email CASCADE;

-- Create info_miraubolant table
CREATE TABLE IF NOT EXISTS info_miraubolant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_email text NOT NULL DEFAULT 'contact@miraubolant.com',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE info_miraubolant ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public can read info"
  ON info_miraubolant
  FOR SELECT
  TO public
  USING (true);

-- Only admins can modify
CREATE POLICY "Only admins can modify info"
  ON info_miraubolant
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
CREATE OR REPLACE FUNCTION update_info_miraubolant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_info_miraubolant_updated_at
  BEFORE UPDATE ON info_miraubolant
  FOR EACH ROW
  EXECUTE FUNCTION update_info_miraubolant_updated_at();

-- Create function to update contact email
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

  -- Update contact_email
  UPDATE info_miraubolant
  SET contact_email = new_email;

  -- Get number of updated rows
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Check if any rows were updated
  IF v_count = 0 THEN
    RAISE EXCEPTION 'No rows were updated';
  END IF;
END;
$$;

-- Insert default record
INSERT INTO info_miraubolant (contact_email)
VALUES ('contact@miraubolant.com');