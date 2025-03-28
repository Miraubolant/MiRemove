/*
  # Fix group stats function
  
  1. Changes
    - Drop existing function
    - Recreate with proper table aliases
    - Fix ambiguous column references
    
  2. Security
    - Maintain security definer
    - Keep existing permissions
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS get_group_stats(uuid);

-- Recreate function with proper table aliases
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
  -- Get group limit with explicit table alias
  SELECT g.image_limit INTO v_image_limit
  FROM groups g
  WHERE g.id = p_group_id;

  -- Get total processed images and member count with explicit table aliases
  SELECT 
    COALESCE(SUM(us.processed_images), 0),
    COUNT(DISTINCT gm.user_id)
  INTO v_total_processed, v_member_count
  FROM group_members gm
  LEFT JOIN user_stats us ON us.user_id = gm.user_id
  WHERE gm.group_id = p_group_id;

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