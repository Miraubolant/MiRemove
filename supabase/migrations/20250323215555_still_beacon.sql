/*
  # Add User Stats Archive System
  
  1. New Table
    - `user_stats_archive`
      - Same structure as user_stats
      - Additional archive_date field
      - Stores historical stats data

  2. New Function
    - `archive_user_stats()`
    - Archives current stats before reset
    - Returns success status
*/

-- Create archive table
CREATE TABLE IF NOT EXISTS user_stats_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  processed_images integer DEFAULT 0,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  total_processing_time double precision DEFAULT 0,
  is_admin boolean DEFAULT false,
  image_limit integer DEFAULT 100,
  quota_limit integer DEFAULT 100,
  quota_reset_at timestamptz DEFAULT now(),
  is_premium boolean DEFAULT false,
  last_password_change timestamptz,
  password_expires_at timestamptz,
  failed_login_attempts integer DEFAULT 0,
  account_locked boolean DEFAULT false,
  account_locked_until timestamptz,
  last_login_ip text,
  allowed_ips text[],
  two_factor_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  archive_date timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_stats_archive ENABLE ROW LEVEL SECURITY;

-- Create policy for admins
CREATE POLICY "Admins can view archives"
  ON user_stats_archive
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ));

-- Create archive function
CREATE OR REPLACE FUNCTION archive_user_stats()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert current stats into archive
  INSERT INTO user_stats_archive (
    user_id,
    email,
    processed_images,
    success_count,
    failure_count,
    total_processing_time,
    is_admin,
    image_limit,
    quota_limit,
    quota_reset_at,
    is_premium,
    last_password_change,
    password_expires_at,
    failed_login_attempts,
    account_locked,
    account_locked_until,
    last_login_ip,
    allowed_ips,
    two_factor_enabled,
    created_at,
    updated_at
  )
  SELECT
    user_id,
    email,
    processed_images,
    success_count,
    failure_count,
    total_processing_time,
    is_admin,
    image_limit,
    quota_limit,
    quota_reset_at,
    is_premium,
    last_password_change,
    password_expires_at,
    failed_login_attempts,
    account_locked,
    account_locked_until,
    last_login_ip,
    allowed_ips,
    two_factor_enabled,
    created_at,
    updated_at
  FROM user_stats
  WHERE processed_images > 0;

  RETURN true;
END;
$$;

-- Add helpful comments
COMMENT ON TABLE user_stats_archive IS 'Historical archive of user statistics';
COMMENT ON FUNCTION archive_user_stats IS 'Archives current user statistics before reset';