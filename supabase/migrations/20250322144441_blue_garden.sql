/*
  # Add Group Statistics Function
  
  1. New Function
    - `get_group_stats_with_users` - Get detailed group statistics including user details
    
  2. Changes
    - Add function to retrieve group statistics with user details
    - Include processed images, success rate, and processing time per user
*/

-- Create function to get detailed group statistics
CREATE OR REPLACE FUNCTION get_group_stats_with_users(p_group_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_stats jsonb;
  v_user_stats jsonb;
BEGIN
  -- Get basic group stats
  SELECT get_group_stats(p_group_id) INTO v_group_stats;

  -- Get detailed user statistics
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', us.user_id,
      'email', us.email,
      'processed_images', us.processed_images,
      'success_rate', CASE 
        WHEN us.processed_images > 0 
        THEN ROUND((us.success_count::numeric / us.processed_images) * 100)
        ELSE 0
      END,
      'avg_processing_time', CASE 
        WHEN us.processed_images > 0 
        THEN ROUND((us.total_processing_time / us.processed_images)::numeric, 2)
        ELSE 0
      END,
      'total_processing_time', us.total_processing_time
    )
  )
  INTO v_user_stats
  FROM group_members gm
  JOIN user_stats us ON us.user_id = gm.user_id
  WHERE gm.group_id = p_group_id;

  -- Combine group and user stats
  RETURN jsonb_build_object(
    'group_stats', v_group_stats,
    'user_stats', COALESCE(v_user_stats, '[]'::jsonb)
  );
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION get_group_stats_with_users(uuid) IS 'Get detailed group statistics including per-user metrics';