/*
  # Add image processing limit per user

  1. Changes
    - Add `image_limit` column to user_stats table with default 1000
    - Add check constraint to ensure image limit is positive
    - Add check constraint to prevent processing more images than the limit

  2. Security
    - No changes to RLS policies needed
*/

-- Add image_limit column with default value of 1000
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS image_limit integer NOT NULL DEFAULT 1000;

-- Add check constraint to ensure image limit is positive
ALTER TABLE user_stats
ADD CONSTRAINT valid_image_limit 
CHECK (image_limit >= 0);

-- Add check constraint to prevent processing more images than the limit
ALTER TABLE user_stats
ADD CONSTRAINT enforce_image_limit 
CHECK (processed_images <= image_limit);