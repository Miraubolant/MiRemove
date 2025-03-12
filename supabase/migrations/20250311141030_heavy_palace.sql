/*
  # Fix admin settings JSON validation

  1. Changes
    - Remove the strict JSON object validation
    - Add more flexible JSON validation
    - Update existing constraints
    - Keep existing data

  2. Security
    - Maintain RLS policies
    - Ensure data integrity
*/

-- Temporarily disable the constraint
ALTER TABLE admin_settings DROP CONSTRAINT IF EXISTS valid_json_value;

-- Add new, more flexible JSON validation
ALTER TABLE admin_settings
ADD CONSTRAINT valid_json_value CHECK (
  value IS NOT NULL AND
  jsonb_typeof(value) IS NOT NULL
);

-- Update the user_limits validation to be more flexible
ALTER TABLE admin_settings DROP CONSTRAINT IF EXISTS valid_user_limits;
ALTER TABLE admin_settings
ADD CONSTRAINT valid_user_limits CHECK (
  key != 'user_limits' OR (
    value ? 'free_user_max_images' AND
    value ? 'max_file_size_mb' AND
    value ? 'max_concurrent_processes' AND
    value ? 'cooldown_period_minutes' AND
    (value->>'free_user_max_images')::int >= 0 AND
    (value->>'max_file_size_mb')::int >= 0 AND
    (value->>'max_concurrent_processes')::int >= 0 AND
    (value->>'cooldown_period_minutes')::int >= 0
  )
);

-- Ensure all existing values are proper JSONB
UPDATE admin_settings
SET value = value::jsonb
WHERE jsonb_typeof(value) IS NULL;

-- Refresh the default values if needed
INSERT INTO admin_settings (key, value, description)
VALUES
  (
    'user_limits',
    '{
      "free_user_max_images": 15,
      "max_file_size_mb": 10,
      "max_concurrent_processes": 1,
      "cooldown_period_minutes": 0
    }'::jsonb,
    'Limites de traitement pour les utilisateurs'
  )
ON CONFLICT (key) 
DO UPDATE SET value = EXCLUDED.value
WHERE admin_settings.value IS NULL OR jsonb_typeof(admin_settings.value) IS NULL;