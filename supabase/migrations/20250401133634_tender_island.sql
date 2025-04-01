/*
  # Add operation stats update function
  
  1. New Function
    - update_operation_stats - Updates user stats for specific operations
    - Takes operation type, success status, and processing time
    - Updates both general and operation-specific stats
    
  2. Security
    - Security definer for elevated privileges
    - Validates operation type
*/

-- Create function to update operation stats
CREATE OR REPLACE FUNCTION update_operation_stats(
  p_user_id uuid,
  p_operation text,
  p_success boolean,
  p_processing_time double precision
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate operation type
  IF p_operation NOT IN ('resize', 'ai', 'crop-head', 'both', 'all') THEN
    RAISE EXCEPTION 'Invalid operation type: %', p_operation;
  END IF;

  -- Update user stats
  UPDATE user_stats
  SET
    -- Update general stats
    processed_images = processed_images + 1,
    success_count = success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    failure_count = failure_count + CASE WHEN p_success THEN 0 ELSE 1 END,
    total_processing_time = total_processing_time + p_processing_time,
    
    -- Update operation-specific stats
    resize_count = CASE 
      WHEN p_operation IN ('resize', 'both', 'all') THEN resize_count + 1 
      ELSE resize_count 
    END,
    resize_processing_time = CASE 
      WHEN p_operation IN ('resize', 'both', 'all') THEN resize_processing_time + p_processing_time 
      ELSE resize_processing_time 
    END,
    
    ai_count = CASE 
      WHEN p_operation IN ('ai', 'both', 'all') THEN ai_count + 1 
      ELSE ai_count 
    END,
    ai_processing_time = CASE 
      WHEN p_operation IN ('ai', 'both', 'all') THEN ai_processing_time + p_processing_time 
      ELSE ai_processing_time 
    END,
    
    crop_head_count = CASE 
      WHEN p_operation IN ('crop-head', 'all') THEN crop_head_count + 1 
      ELSE crop_head_count 
    END,
    crop_head_processing_time = CASE 
      WHEN p_operation IN ('crop-head', 'all') THEN crop_head_processing_time + p_processing_time 
      ELSE crop_head_processing_time 
    END,
    
    all_processing_count = CASE 
      WHEN p_operation = 'all' THEN all_processing_count + 1 
      ELSE all_processing_count 
    END,
    all_processing_time = CASE 
      WHEN p_operation = 'all' THEN all_processing_time + p_processing_time 
      ELSE all_processing_time 
    END,
    
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION update_operation_stats IS 'Updates user statistics for specific image processing operations';