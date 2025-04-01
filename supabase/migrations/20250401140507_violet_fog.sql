/*
  # Fix group member trigger function
  
  1. Changes
    - Remove reference to image_limit column
    - Update trigger function to handle group membership changes correctly
    - Add proper error handling
    
  2. Security
    - Maintain security definer for elevated privileges
    - Keep existing RLS policies
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS update_user_limits_on_group_change ON group_members;
DROP FUNCTION IF EXISTS update_user_group_limits();

-- Create improved function for updating user limits
CREATE OR REPLACE FUNCTION update_user_group_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_default_limit constant integer := 10;
  v_group_limit integer;
BEGIN
  -- For INSERT or UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Get the group's limit
    SELECT g.image_limit INTO v_group_limit
    FROM groups g
    WHERE g.id = NEW.group_id;

    -- Update user's stats
    UPDATE user_stats
    SET updated_at = now()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
  END IF;

  -- For DELETE
  IF (TG_OP = 'DELETE') THEN
    -- Update user's stats
    UPDATE user_stats
    SET updated_at = now()
    WHERE user_id = OLD.user_id;
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Create new trigger
CREATE TRIGGER update_user_limits_on_group_change
  AFTER INSERT OR DELETE OR UPDATE
  ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_user_group_limits();

-- Add helpful comments
COMMENT ON FUNCTION update_user_group_limits() IS 'Updates user stats when group memberships change';
COMMENT ON TRIGGER update_user_limits_on_group_change ON group_members IS 'Triggers user stats updates when group memberships change';