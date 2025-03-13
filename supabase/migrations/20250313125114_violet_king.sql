-- Create function to update contact email in all legal content
CREATE OR REPLACE FUNCTION update_contact_email(old_email text, new_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_id = auth.uid()
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Update all legal content
  UPDATE legal_content
  SET 
    content = REPLACE(content, old_email, new_email),
    last_updated_at = now()
  WHERE type IN ('privacy', 'terms', 'gdpr');
END;
$$;