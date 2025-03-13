/*
  # Fix user stats loading and permissions

  1. Changes
    - Add missing columns to user_stats table
    - Update RLS policies for proper access
    - Add necessary indexes for performance
    
  2. Security
    - Ensure proper access control
    - Add appropriate constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own stats" ON user_stats;
DROP POLICY IF EXISTS "Admins can read all stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;

-- Ensure all required columns exist
DO $$ 
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN email text;
  END IF;
END $$;

-- Drop existing constraints if they exist
DO $$
BEGIN
  ALTER TABLE user_stats DROP CONSTRAINT IF EXISTS user_stats_user_id_key;
  ALTER TABLE user_stats DROP CONSTRAINT IF EXISTS user_stats_email_key;
  ALTER TABLE user_stats DROP CONSTRAINT IF EXISTS valid_email_format;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add constraints
ALTER TABLE user_stats 
  ADD CONSTRAINT user_stats_user_id_key UNIQUE (user_id),
  ADD CONSTRAINT user_stats_email_key UNIQUE (email),
  ADD CONSTRAINT valid_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create or replace indexes
DROP INDEX IF EXISTS idx_user_stats_user_id;
DROP INDEX IF EXISTS idx_user_stats_email;
DROP INDEX IF EXISTS idx_user_stats_is_admin;

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_email ON user_stats(email);
CREATE INDEX IF NOT EXISTS idx_user_stats_is_admin ON user_stats(is_admin);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can read own stats"
ON user_stats FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all stats"
ON user_stats FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_stats admin
  WHERE admin.user_id = auth.uid()
  AND admin.is_admin = true
));

CREATE POLICY "Users can update own stats"
ON user_stats FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
ON user_stats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create function to automatically set email on insert
CREATE OR REPLACE FUNCTION set_user_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email := (
    SELECT email 
    FROM auth.users 
    WHERE id = NEW.user_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set email
DROP TRIGGER IF EXISTS set_user_email_trigger ON user_stats;
CREATE TRIGGER set_user_email_trigger
  BEFORE INSERT ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION set_user_email();