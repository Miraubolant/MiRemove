/*
  # Create settings table

  1. New Tables
    - `settings`
      - `key` (text, primary key) - The setting identifier
      - `value` (text) - The setting value
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `settings` table
    - Add policies for admin access
*/

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read settings
CREATE POLICY "Admins can read settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_id = auth.uid()
      AND is_admin = true
    )
  );

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_id = auth.uid()
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_id = auth.uid()
      AND is_admin = true
    )
  );

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_id = auth.uid()
      AND is_admin = true
    )
  );

-- Insert default guest image limit
INSERT INTO settings (key, value)
VALUES ('guest_image_limit', '5')
ON CONFLICT (key) DO NOTHING;

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();