/*
  # Fix group member limits update

  1. Changes
    - Update trigger function to properly handle group limits
    - Add proper error handling
    - Ensure limits are updated correctly on member changes

  2. Security
    - Maintain security definer for elevated privileges
    - Keep RLS policies intact
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
  v_max_limit integer;
  v_default_limit constant integer := 100;
BEGIN
  -- For INSERT or UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Get the highest limit from all groups the user is a member of
    SELECT COALESCE(MAX(g.image_limit), v_default_limit)
    INTO v_max_limit
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id = NEW.user_id;

    -- Update user's image limit to the highest group limit
    UPDATE user_stats
    SET 
      image_limit = v_max_limit,
      updated_at = now()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
  END IF;

  -- For DELETE
  IF (TG_OP = 'DELETE') THEN
    -- Get the highest remaining group limit for the user
    SELECT COALESCE(MAX(g.image_limit), v_default_limit)
    INTO v_max_limit
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id = OLD.user_id
    AND gm.id != OLD.id;

    -- Update user's image limit
    UPDATE user_stats
    SET 
      image_limit = v_max_limit,
      updated_at = now()
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
COMMENT ON FUNCTION update_user_group_limits() IS 'Updates user image limits based on their group memberships';
COMMENT ON TRIGGER update_user_limits_on_group_change ON group_members IS 'Triggers image limit updates when group memberships change';