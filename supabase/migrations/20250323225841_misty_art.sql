/*
  # Update default image limit
  
  1. Changes
    - Set default image limit to 10 instead of 100
    - Update existing functions and constraints
    - Ensure consistent limits across the system
*/

-- Update default value in user_stats table
ALTER TABLE user_stats ALTER COLUMN image_limit SET DEFAULT 10;

-- Update the update_user_group_limits function
CREATE OR REPLACE FUNCTION update_user_group_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_limit integer;
  v_default_limit constant integer := 10; -- Changed from 100 to 10
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