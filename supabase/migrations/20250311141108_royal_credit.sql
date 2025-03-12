/*
  # Fix admin settings JSON validation

  1. Changes
    - Update JSON validation constraints for admin_settings table
    - Add proper type checking for user_limits values
    - Ensure backward compatibility with existing data

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with proper constraints
*/

-- Drop existing constraints if they exist
ALTER TABLE admin_settings DROP CONSTRAINT IF EXISTS valid_json_value;
ALTER TABLE admin_settings DROP CONSTRAINT IF EXISTS valid_user_limits;

-- Add new JSON validation constraint
ALTER TABLE admin_settings
ADD CONSTRAINT valid_json_value CHECK (
  value IS NOT NULL AND 
  jsonb_typeof(value) = 'object'
);

-- Add specific validation for user_limits
ALTER TABLE admin_settings
ADD CONSTRAINT valid_user_limits CHECK (
  key != 'user_limits' OR (
    jsonb_typeof(value) = 'object' AND
    jsonb_typeof(value->'free_user_max_images') = 'number' AND
    jsonb_typeof(value->'max_file_size_mb') = 'number' AND
    jsonb_typeof(value->'max_concurrent_processes') = 'number' AND
    jsonb_typeof(value->'cooldown_period_minutes') = 'number' AND
    (value->>'free_user_max_images')::int >= 0 AND
    (value->>'max_file_size_mb')::int >= 0 AND
    (value->>'max_concurrent_processes')::int >= 0 AND
    (value->>'cooldown_period_minutes')::int >= 0
  )
);

-- Update existing user_limits entry if needed
UPDATE admin_settings
SET value = jsonb_build_object(
  'free_user_max_images', COALESCE((value->>'free_user_max_images')::int, 10),
  'max_file_size_mb', COALESCE((value->>'max_file_size_mb')::int, 10),
  'max_concurrent_processes', COALESCE((value->>'max_concurrent_processes')::int, 1),
  'cooldown_period_minutes', COALESCE((value->>'cooldown_period_minutes')::int, 0)
)
WHERE key = 'user_limits';