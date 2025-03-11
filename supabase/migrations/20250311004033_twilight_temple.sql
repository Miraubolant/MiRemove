/*
  # Fix user_stats policies

  1. Changes
    - Drop existing policies that may cause recursion
    - Create new, simplified policies for user_stats table
    
  2. Security
    - Enable RLS
    - Add policies for:
      - Users can read their own stats
      - Admins can read all stats
      - Users can update their own stats
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable insert for users own rows" ON user_stats;
DROP POLICY IF EXISTS "Enable read for admins" ON user_stats;
DROP POLICY IF EXISTS "Enable read for users own rows" ON user_stats;
DROP POLICY IF EXISTS "Enable update for users own rows" ON user_stats;

-- Create new simplified policies
CREATE POLICY "Users can read own stats"
ON user_stats FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all stats"
ON user_stats FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_stats admin
    WHERE admin.user_id = auth.uid()
    AND admin.is_admin = true
  )
);

CREATE POLICY "Users can update own stats"
ON user_stats FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
ON user_stats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);