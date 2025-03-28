/*
  # Fix default image limit update function
  
  1. Changes
    - Remove ALTER TABLE approach
    - Use trigger-based solution instead
    - Add default_image_limit table for storing the value
    
  2. Security
    - Only admins can update the default limit
    - Validates the new limit value
*/

-- Create table to store default limit
CREATE TABLE IF NOT EXISTS default_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_image_limit integer NOT NULL DEFAULT 10,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE default_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins
CREATE POLICY "Admins can manage default settings"
  ON default_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ));

-- Insert initial value if not exists
INSERT INTO default_settings (default_image_limit)
SELECT 10
WHERE NOT EXISTS (SELECT 1 FROM default_settings);

-- Create function to update default limit
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

  -- Update default value
  UPDATE default_settings
  SET 
    default_image_limit = new_limit,
    updated_at = now();

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

-- Create trigger for new users
CREATE OR REPLACE FUNCTION set_default_image_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_default_limit integer;
BEGIN
  -- Get current default limit
  SELECT default_image_limit INTO v_default_limit
  FROM default_settings
  LIMIT 1;

  -- Set default limit for new user
  NEW.image_limit := v_default_limit;
  RETURN NEW;
END;
$$;

-- Add trigger to user_stats
DROP TRIGGER IF EXISTS set_default_image_limit_trigger ON user_stats;
CREATE TRIGGER set_default_image_limit_trigger
  BEFORE INSERT ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION set_default_image_limit();

-- Add helpful comments
COMMENT ON TABLE default_settings IS 'Stores global default settings like image limits';
COMMENT ON FUNCTION update_default_image_limit(integer) IS 'Updates the default image limit for new users';
COMMENT ON FUNCTION set_default_image_limit() IS 'Sets default image limit for new users';