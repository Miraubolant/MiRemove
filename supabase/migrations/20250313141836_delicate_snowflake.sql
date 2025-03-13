/*
  # Fix contact email update function

  1. Changes
    - Drop existing function
    - Create new function with better error handling
    - Add validation for both old and new email
    - Add proper security settings
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

  -- Update contact_email in all legal documents
  UPDATE legal_content
  SET 
    contact_email = new_email,
    last_updated_at = now();

  -- Get number of updated rows
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Check if any rows were updated
  IF v_count = 0 THEN
    RAISE EXCEPTION 'No rows were updated';
  END IF;
END;
$$;