/*
  # Add default image limit update function
  
  1. New Function
    - `update_default_image_limit` - Updates the default image limit for new users
    - Takes a new_limit parameter
    - Updates both the column default and the function constant
    
  2. Security
    - Only admins can update the default limit
    - Validates the new limit value
*/

-- Create or replace the function to update default image limit
CREATE OR REPLACE FUNCTION update_default_image_limit(new_limit integer)
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
    RAISE EXCEPTION 'Unauthorized: only administrators can update the default limit';
  END IF;

  -- Validate new limit
  IF new_limit < 0 THEN
    RAISE EXCEPTION 'Invalid limit: must be non-negative';
  END IF;

  -- Update default value in user_stats table
  ALTER TABLE user_stats ALTER COLUMN image_limit SET DEFAULT new_limit;

  -- Update the constant in the update_user_group_limits function
  CREATE OR REPLACE FUNCTION update_user_group_limits()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $func$
  DECLARE
    v_max_limit integer;
    v_default_limit constant integer := new_limit;
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
  $func$;
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION update_default_image_limit(integer) IS 'Updates the default image limit for new users and users without group memberships';