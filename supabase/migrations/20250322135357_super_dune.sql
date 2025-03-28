/*
  # Fix group stats function and constraints
  
  1. Changes
    - Drop and recreate get_group_stats function with fixed parameter name
    - Add check constraint for image_limit
    - Add indexes for better performance
    - Update user_stats constraint

  2. Security
    - Maintain existing RLS policies
    - Add validation for image limits
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS get_group_stats(uuid);

-- Recreate function with fixed parameter name
CREATE OR REPLACE FUNCTION get_group_stats(p_group_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_processed integer;
  v_image_limit integer;
  v_member_count integer;
BEGIN
  -- Get group limit
  SELECT image_limit INTO v_image_limit
  FROM groups g
  WHERE g.id = p_group_id;

  -- Get total processed images and member count for group
  SELECT 
    COALESCE(SUM(us.processed_images), 0),
    COUNT(DISTINCT gm.user_id)
  INTO v_total_processed, v_member_count
  FROM group_members gm
  LEFT JOIN user_stats us ON us.user_id = gm.user_id
  WHERE gm.group_id = p_group_id
  GROUP BY gm.group_id;

  RETURN jsonb_build_object(
    'total_processed', v_total_processed,
    'remaining_limit', GREATEST(0, v_image_limit - v_total_processed),
    'member_count', v_member_count,
    'image_limit', v_image_limit
  );
END;
$$;

-- Add check constraint for image_limit
ALTER TABLE groups ADD CONSTRAINT valid_image_limit 
  CHECK (image_limit >= 0);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_group_members_user_id 
  ON group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id 
  ON group_members(group_id);

-- Update user_stats constraint
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE user_stats DROP CONSTRAINT IF EXISTS enforce_image_limit;
  
  -- Add new constraint that allows higher limits
  ALTER TABLE user_stats ADD CONSTRAINT enforce_image_limit 
    CHECK (image_limit >= 0 AND image_limit <= 1000000);
END $$;

-- Add helpful comments
COMMENT ON FUNCTION get_group_stats(uuid) IS 'Get statistics for a specific group with fixed group_id reference';
COMMENT ON CONSTRAINT valid_image_limit ON groups IS 'Ensures group image limit is non-negative';
COMMENT ON CONSTRAINT enforce_image_limit ON user_stats IS 'Ensures user image limit is between 0 and 1,000,000';