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
  v_id uuid;
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

  -- Get the ID of the row to update
  SELECT id INTO v_id
  FROM info_miraubolant
  WHERE contact_email = old_email
  LIMIT 1;

  IF v_id IS NULL THEN
    -- If no matching row found, get any existing row
    SELECT id INTO v_id
    FROM info_miraubolant
    LIMIT 1;
  END IF;

  IF v_id IS NOT NULL THEN
    -- Update existing row
    UPDATE info_miraubolant
    SET contact_email = new_email
    WHERE id = v_id;
  ELSE
    -- Insert new row if none exists
    INSERT INTO info_miraubolant (contact_email)
    VALUES (new_email);
  END IF;
END;
$$;

-- Ensure at least one row exists
INSERT INTO info_miraubolant (contact_email)
VALUES ('contact@miraubolant.com')
ON CONFLICT DO NOTHING;