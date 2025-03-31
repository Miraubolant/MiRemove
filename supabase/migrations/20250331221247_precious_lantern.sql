/*
  # Add detailed statistics columns to user_stats table
  
  1. New Columns
    - `resize_count` - Number of resize operations
    - `ai_count` - Number of AI background removal operations
    - `crop_head_count` - Number of head cropping operations
    - `all_processing_count` - Number of full processing operations
    - `resize_processing_time` - Total time spent on resize operations
    - `ai_processing_time` - Total time spent on AI operations
    - `crop_head_processing_time` - Total time spent on head cropping
    - `all_processing_time` - Total time spent on full processing

  2. Security
    - Maintain existing RLS policies
    - Add default values for new columns
*/

-- Add new columns for detailed statistics
ALTER TABLE user_stats 
  -- Operation counts
  ADD COLUMN IF NOT EXISTS resize_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crop_head_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS all_processing_count integer DEFAULT 0,
  
  -- Processing times
  ADD COLUMN IF NOT EXISTS resize_processing_time double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_processing_time double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crop_head_processing_time double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS all_processing_time double precision DEFAULT 0;

-- Create function to update specific operation stats
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
  UPDATE user_stats
  SET
    -- Update general stats
    processed_images = processed_images + 1,
    success_count = success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    failure_count = failure_count + CASE WHEN p_success THEN 0 ELSE 1 END,
    total_processing_time = total_processing_time + p_processing_time,
    
    -- Update specific operation stats
    resize_count = CASE 
      WHEN p_operation = 'resize' THEN resize_count + 1 
      ELSE resize_count 
    END,
    resize_processing_time = CASE 
      WHEN p_operation = 'resize' THEN resize_processing_time + p_processing_time 
      ELSE resize_processing_time 
    END,
    
    ai_count = CASE 
      WHEN p_operation = 'ai' THEN ai_count + 1 
      ELSE ai_count 
    END,
    ai_processing_time = CASE 
      WHEN p_operation = 'ai' THEN ai_processing_time + p_processing_time 
      ELSE ai_processing_time 
    END,
    
    crop_head_count = CASE 
      WHEN p_operation = 'crop-head' THEN crop_head_count + 1 
      ELSE crop_head_count 
    END,
    crop_head_processing_time = CASE 
      WHEN p_operation = 'crop-head' THEN crop_head_processing_time + p_processing_time 
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

-- Add helpful comments
COMMENT ON COLUMN user_stats.resize_count IS 'Number of resize operations performed';
COMMENT ON COLUMN user_stats.ai_count IS 'Number of AI background removal operations performed';
COMMENT ON COLUMN user_stats.crop_head_count IS 'Number of head cropping operations performed';
COMMENT ON COLUMN user_stats.all_processing_count IS 'Number of full processing operations performed';
COMMENT ON COLUMN user_stats.resize_processing_time IS 'Total time spent on resize operations';
COMMENT ON COLUMN user_stats.ai_processing_time IS 'Total time spent on AI operations';
COMMENT ON COLUMN user_stats.crop_head_processing_time IS 'Total time spent on head cropping';
COMMENT ON COLUMN user_stats.all_processing_time IS 'Total time spent on full processing';
COMMENT ON FUNCTION update_operation_stats IS 'Updates user statistics for specific image processing operations';