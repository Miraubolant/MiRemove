/*
  # Fix default image limit update function
  
  1. Changes
    - Add WHERE clause to UPDATE statement
    - Ensure single row update
    - Add error handling
    
  2. Security
    - Maintain existing admin checks
    - Keep validation rules
*/

-- Create or replace the function to update default limit
CREATE OR REPLACE FUNCTION update_default_image_limit(new_limit integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings_id uuid;
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

  -- Get the ID of the settings row to update
  SELECT id INTO v_settings_id
  FROM default_settings
  LIMIT 1;

  IF v_settings_id IS NULL THEN
    -- Insert new settings if none exist
    INSERT INTO default_settings (default_image_limit)
    VALUES (new_limit);
  ELSE
    -- Update existing settings
    UPDATE default_settings
    SET 
      default_image_limit = new_limit,
      updated_at = now()
    WHERE id = v_settings_id;
  END IF;

  -- Update the constant in the update_user_group_limits function
  CREATE OR REPLACE FUNCTION update_user_group_limits()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $func$
  DECLARE
    v_max_limit integer;
    v_default_limit integer;
  BEGIN
    -- Get current default limit
    SELECT default_image_limit INTO v_default_limit
    FROM default_settings
    LIMIT 1;

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