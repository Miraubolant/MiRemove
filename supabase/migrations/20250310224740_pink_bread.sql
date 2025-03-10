/*
  # Fix user statistics schema and relationships

  1. Changes
    - Drop existing views and recreate them with proper relationships
    - Add necessary indexes for performance
    - Update RLS policies

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- First, recreate the users view with proper schema reference
DROP VIEW IF EXISTS users;
CREATE VIEW users AS
SELECT 
  id,
  email,
  created_at
FROM auth.users;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_user_stats_user_id;
DROP INDEX IF EXISTS idx_user_stats_processed_images;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_processed_images ON user_stats(processed_images DESC);

-- Update RLS policies
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;

-- Recreate policies with proper conditions
CREATE POLICY "Users can read own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) OR (is_admin = true));

CREATE POLICY "Users can insert own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);