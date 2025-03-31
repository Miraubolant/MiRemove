-- Create function to get group operation stats
CREATE OR REPLACE FUNCTION get_group_operation_stats(p_group_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'resize', jsonb_build_object(
      'count', COALESCE(SUM(us.resize_count), 0),
      'time', COALESCE(SUM(us.resize_processing_time), 0)
    ),
    'ai', jsonb_build_object(
      'count', COALESCE(SUM(us.ai_count), 0),
      'time', COALESCE(SUM(us.ai_processing_time), 0)
    ),
    'crop_head', jsonb_build_object(
      'count', COALESCE(SUM(us.crop_head_count), 0),
      'time', COALESCE(SUM(us.crop_head_processing_time), 0)
    ),
    'all', jsonb_build_object(
      'count', COALESCE(SUM(us.all_processing_count), 0),
      'time', COALESCE(SUM(us.all_processing_time), 0)
    )
  ) INTO v_stats
  FROM group_members gm
  JOIN user_stats us ON us.user_id = gm.user_id
  WHERE gm.group_id = p_group_id;

  RETURN v_stats;
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION get_group_operation_stats(uuid) IS 'Get detailed operation statistics for a specific group';