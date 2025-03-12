/*
  # Add image processing limit per user

  1. Changes
    - Add `image_limit` column to user_stats table with default 1000
    - Add check constraint to ensure image limit is positive
    - Add check constraint to prevent processing more images than the limit

  2. Security
    - No changes to RLS policies needed

  Note: This migration includes safety checks to prevent duplicate constraints
*/

DO $$ 
BEGIN
  -- Add image_limit column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' AND column_name = 'image_limit'
  ) THEN
    ALTER TABLE user_stats 
    ADD COLUMN image_limit integer NOT NULL DEFAULT 1000;
  END IF;

  -- Add valid_image_limit constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'user_stats' AND constraint_name = 'valid_image_limit'
  ) THEN
    ALTER TABLE user_stats
    ADD CONSTRAINT valid_image_limit 
    CHECK (image_limit >= 0);
  END IF;

  -- Add enforce_image_limit constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'user_stats' AND constraint_name = 'enforce_image_limit'
  ) THEN
    ALTER TABLE user_stats
    ADD CONSTRAINT enforce_image_limit 
    CHECK (processed_images <= image_limit);
  END IF;
END $$;