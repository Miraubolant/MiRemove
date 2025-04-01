/*
  # Add operation-specific statistics columns
  
  1. New Columns
    - Operation counts:
      - resize_count
      - ai_count  
      - crop_head_count
      - all_processing_count
    
    - Processing times:
      - resize_processing_time
      - ai_processing_time
      - crop_head_processing_time
      - all_processing_time

  2. Comments
    - Add descriptive comments for each column
*/

-- Add operation count columns
ALTER TABLE user_stats 
  ADD COLUMN IF NOT EXISTS resize_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crop_head_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS all_processing_count integer DEFAULT 0;

-- Add processing time columns  
ALTER TABLE user_stats
  ADD COLUMN IF NOT EXISTS resize_processing_time double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_processing_time double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crop_head_processing_time double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS all_processing_time double precision DEFAULT 0;

-- Add helpful comments
COMMENT ON COLUMN user_stats.resize_count IS 'Number of resize operations performed';
COMMENT ON COLUMN user_stats.ai_count IS 'Number of AI background removal operations performed';
COMMENT ON COLUMN user_stats.crop_head_count IS 'Number of head cropping operations performed';
COMMENT ON COLUMN user_stats.all_processing_count IS 'Number of full processing operations performed';

COMMENT ON COLUMN user_stats.resize_processing_time IS 'Total time spent on resize operations';
COMMENT ON COLUMN user_stats.ai_processing_time IS 'Total time spent on AI operations';
COMMENT ON COLUMN user_stats.crop_head_processing_time IS 'Total time spent on head cropping';
COMMENT ON COLUMN user_stats.all_processing_time IS 'Total time spent on full processing';