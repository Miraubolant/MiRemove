/*
  # Add group statistics support
  
  1. New Tables
    - `groups`
      - `id` (uuid, primary key)
      - `name` (text) - Group name
      - `image_limit` (integer) - Shared image limit
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `group_members`
      - `id` (uuid, primary key)
      - `group_id` (uuid) - Reference to groups
      - `user_id` (uuid) - Reference to auth.users
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Admins can manage groups and members
    - Users can view their group info
*/

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_limit integer NOT NULL DEFAULT 10000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for groups
CREATE POLICY "Admins can manage groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ));

CREATE POLICY "Users can view their groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
  ));

-- Create policies for group_members
CREATE POLICY "Admins can manage group members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ));

CREATE POLICY "Users can view their group memberships"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create updated_at trigger for groups
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get group stats
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
  -- Get group limit
  SELECT image_limit INTO v_image_limit
  FROM groups
  WHERE id = group_id;

  -- Get total processed images for group
  SELECT 
    COALESCE(SUM(us.processed_images), 0),
    COUNT(DISTINCT gm.user_id)
  INTO v_total_processed, v_member_count
  FROM group_members gm
  LEFT JOIN user_stats us ON us.user_id = gm.user_id
  WHERE gm.group_id = group_id;

  RETURN jsonb_build_object(
    'total_processed', v_total_processed,
    'remaining_limit', GREATEST(0, v_image_limit - v_total_processed),
    'member_count', v_member_count,
    'image_limit', v_image_limit
  );
END;
$$;

-- Create initial Arlettie group
INSERT INTO groups (name, image_limit)
VALUES ('Arlettie', 10000)
ON CONFLICT DO NOTHING;

-- Add existing Arlettie users to group
WITH arlettie_group AS (
  SELECT id FROM groups WHERE name = 'Arlettie'
),
arlettie_users AS (
  SELECT user_id
  FROM user_stats
  WHERE email LIKE '%@arlettie.fr'
)
INSERT INTO group_members (group_id, user_id)
SELECT arlettie_group.id, arlettie_users.user_id
FROM arlettie_group, arlettie_users
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON TABLE groups IS 'Groups with shared image limits';
COMMENT ON TABLE group_members IS 'Group membership associations';
COMMENT ON FUNCTION get_group_stats IS 'Get statistics for a specific group';