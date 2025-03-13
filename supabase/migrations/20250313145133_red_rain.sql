/*
  # Fix RLS policies to avoid recursion

  1. Changes
    - Remove recursive admin check from policies
    - Create a secure function to check admin status
    - Update policies to use the new function
    - Maintain existing functionality but avoid recursion

  2. Security
    - Maintain proper access control
    - Use security definer function for admin checks
*/

-- Create a secure function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_stats
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own stats" ON user_stats;
DROP POLICY IF EXISTS "Admins can read all stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;

-- Create new policies using the is_admin() function
CREATE POLICY "Enable read access"
ON user_stats
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id -- Users can read their own stats
  OR
  is_admin() -- Admins can read all stats
);

CREATE POLICY "Enable insert for users"
ON user_stats
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id -- Users can only insert their own stats
);

CREATE POLICY "Enable update for users and admins"
ON user_stats
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id -- Users can update their own stats
  OR
  is_admin() -- Admins can update any stats
)
WITH CHECK (
  auth.uid() = user_id
  OR
  is_admin()
);

CREATE POLICY "Enable delete for admins"
ON user_stats
FOR DELETE
TO authenticated
USING (is_admin());

-- Ensure RLS is enabled
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;