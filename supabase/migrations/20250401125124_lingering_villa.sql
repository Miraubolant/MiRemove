/*
  # Add success and failure count columns
  
  1. Changes
    - Add success_count column to track successful operations
    - Add failure_count column to track failed operations
    - Set default values to 0
    - Add helpful comments
    
  2. Security
    - No changes to RLS policies needed
    - Existing table permissions apply
*/

-- Add success_count column if it doesn't exist
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS success_count integer DEFAULT 0;

-- Add failure_count column if it doesn't exist
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS failure_count integer DEFAULT 0;

-- Add helpful comments
COMMENT ON COLUMN user_stats.success_count IS 'Number of successful image processing operations';
COMMENT ON COLUMN user_stats.failure_count IS 'Number of failed image processing operations';