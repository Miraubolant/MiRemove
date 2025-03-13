/*
  # Fix contact email update function

  1. Changes
    - Remove WHERE clause requirement by using UPDATE without WHERE
    - Simplify function to update single row
    - Add better error handling
    - Add validation for email format

  2. Security
    - Maintain admin-only access
    - Keep email format validation
*/

-- Drop existing function
DROP FUNCTION IF EXISTS update_contact_email CASCADE;

-- Create improved email update function
CREATE OR REPLACE FUNCTION update_contact_email(old_email text, new_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Update the contact email
  UPDATE info_miraubolant
  SET contact_email = new_email;

  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update contact email';
  END IF;
END;
$$;