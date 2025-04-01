/*
  # Add processed_images column
  
  1. Changes
    - Add processed_images column to user_stats table
    - Set default value to 0
    - Make column nullable
    - Add comment for documentation
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add processed_images column if it doesn't exist
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS processed_images integer DEFAULT 0;

-- Add helpful comment
COMMENT ON COLUMN user_stats.processed_images IS 'Number of images processed by the user';