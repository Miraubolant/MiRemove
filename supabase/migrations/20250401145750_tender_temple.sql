/*
  # Add image_limit column to user_stats table
  
  1. Changes
    - Add image_limit column with default value 10
    - Add check constraint to ensure valid limits
    - Add helpful comment
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add image_limit column if it doesn't exist
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS image_limit integer DEFAULT 10;

-- Add check constraint for valid limits
ALTER TABLE user_stats 
ADD CONSTRAINT valid_image_limit CHECK (image_limit >= 0);

-- Add helpful comment
COMMENT ON COLUMN user_stats.image_limit IS 'Maximum number of images a user can process';