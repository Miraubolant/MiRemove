-- Add total_processing_time column if it doesn't exist
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS total_processing_time double precision DEFAULT 0;

-- Add helpful comment
COMMENT ON COLUMN user_stats.total_processing_time IS 'Total time spent processing images in seconds';