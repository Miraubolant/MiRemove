/*
  # Remove Groups System
  
  1. Changes
    - Drop groups table and related objects
    - Drop group_members table and related objects
    - Remove all related triggers and functions
    - Clean up any related policies
    
  2. Security
    - Safe removal of all components
    - Use DO blocks for conditional drops
*/

DO $$ 
BEGIN
  -- Drop function if it exists
  DROP FUNCTION IF EXISTS get_group_stats(uuid);

  -- Drop tables if they exist (this will cascade to related objects)
  DROP TABLE IF EXISTS group_members CASCADE;
  DROP TABLE IF EXISTS groups CASCADE;

  -- Drop trigger if it exists
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_groups_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
  END IF;
END $$;