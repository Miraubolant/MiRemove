/*
  # Update admin settings structure
  
  1. Changes
    - Remove JSON-based admin_settings table
    - Create new admin_settings table with numeric columns
    - Add appropriate constraints and defaults
    
  2. Security
    - Maintain existing RLS policies
    - Add appropriate constraints for data validation
*/

-- Drop existing table and type
DROP TABLE IF EXISTS admin_settings;
DROP TYPE IF EXISTS admin_setting_key;

-- Create new admin_settings table with numeric columns
CREATE TABLE admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  free_user_max_images integer NOT NULL DEFAULT 10,
  max_file_size_mb integer NOT NULL DEFAULT 10,
  max_concurrent_processes integer NOT NULL DEFAULT 1,
  cooldown_period_minutes integer NOT NULL DEFAULT 0,
  max_width integer NOT NULL DEFAULT 2048,
  max_height integer NOT NULL DEFAULT 2048,
  default_quality integer NOT NULL DEFAULT 80,
  compression_enabled boolean NOT NULL DEFAULT true,
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add constraints
ALTER TABLE admin_settings ADD CONSTRAINT valid_free_user_max_images 
  CHECK (free_user_max_images >= 0);
ALTER TABLE admin_settings ADD CONSTRAINT valid_max_file_size 
  CHECK (max_file_size_mb >= 0);
ALTER TABLE admin_settings ADD CONSTRAINT valid_max_concurrent_processes 
  CHECK (max_concurrent_processes >= 0);
ALTER TABLE admin_settings ADD CONSTRAINT valid_cooldown_period 
  CHECK (cooldown_period_minutes >= 0);
ALTER TABLE admin_settings ADD CONSTRAINT valid_max_dimensions 
  CHECK (max_width > 0 AND max_height > 0);
ALTER TABLE admin_settings ADD CONSTRAINT valid_quality 
  CHECK (default_quality BETWEEN 0 AND 100);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Admins can read settings" ON admin_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_stats.user_id = auth.uid()
      AND user_stats.is_admin = true
    )
  );

CREATE POLICY "Admins can modify settings" ON admin_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_stats.user_id = auth.uid()
      AND user_stats.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_stats.user_id = auth.uid()
      AND user_stats.is_admin = true
    )
  );

-- Insert default settings
INSERT INTO admin_settings (
  free_user_max_images,
  max_file_size_mb,
  max_concurrent_processes,
  cooldown_period_minutes,
  max_width,
  max_height,
  default_quality,
  compression_enabled,
  maintenance_mode,
  maintenance_message
) VALUES (
  10, -- free_user_max_images
  10, -- max_file_size_mb
  1,  -- max_concurrent_processes
  0,  -- cooldown_period_minutes
  2048, -- max_width
  2048, -- max_height
  80,   -- default_quality
  true, -- compression_enabled
  false, -- maintenance_mode
  'Site en maintenance, merci de revenir plus tard.' -- maintenance_message
);