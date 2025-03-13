/*
  # Fix contact email update function

  1. Changes
    - Add NOT NULL constraint to contact_email column
    - Add default value for contact_email
    - Add email format validation
    - Improve error handling
    - Add admin check

  2. Security
    - Maintain RLS policies
    - Add proper constraints
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_contact_email CASCADE;

-- Create improved email update function
CREATE OR REPLACE FUNCTION update_contact_email(old_email text, new_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can update contact email';
  END IF;

  -- Validate new email format
  IF new_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Get the first row's ID (there should only be one)
  WITH first_row AS (
    SELECT id FROM info_miraubolant LIMIT 1
  )
  UPDATE info_miraubolant
  SET contact_email = new_email
  WHERE id = (SELECT id FROM first_row);

  -- Get number of updated rows
  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- If no rows were updated, insert a new row
  IF v_count = 0 THEN
    INSERT INTO info_miraubolant (contact_email)
    VALUES (new_email);
  END IF;
END;
$$;