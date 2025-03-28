/*
  # Fix group stats function parameter name
  
  1. Changes
    - Drop existing function
    - Recreate with correct parameter name
    - Add alias to table references for clarity
    
  2. Security
    - Maintain security definer
    - Keep existing permissions
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS get_group_stats(uuid);

-- Recreate function with fixed parameter name and table aliases
CREATE OR REPLACE FUNCTION get_group_stats(group_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_processed integer;
  v_image_limit integer;
  v_member_count integer;
BEGIN
  -- Get group limit with table alias
  SELECT g.image_limit INTO v_image_limit
  FROM groups g
  WHERE g.id = group_id;

  -- Get total processed images and member count with table aliases
  SELECT 
    COALESCE(SUM(us.processed_images), 0),
    COUNT(DISTINCT gm.user_id)
  INTO v_total_processed, v_member_count
  FROM group_members gm
  LEFT JOIN user_stats us ON us.user_id = gm.user_id
  WHERE gm.group_id = group_id
  GROUP BY gm.group_id;

  RETURN jsonb_build_object(
    'total_processed', v_total_processed,
    'remaining_limit', GREATEST(0, v_image_limit - v_total_processed),
    'member_count', v_member_count,
    'image_limit', v_image_limit
  );
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION get_group_stats(uuid) IS 'Get statistics for a specific group including processed images and member count';