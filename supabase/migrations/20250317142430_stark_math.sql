/*
  # Fix Stripe subscriptions policies
  
  1. Drop existing policies if they exist
  2. Recreate policies with proper checks
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop the view policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can view their own subscriptions'
  ) THEN
    DROP POLICY "Users can view their own subscriptions" ON subscriptions;
  END IF;

  -- Drop the admin policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Admins can manage all subscriptions'
  ) THEN
    DROP POLICY "Admins can manage all subscriptions" ON subscriptions;
  END IF;
END $$;

-- Create policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_stats
      WHERE user_stats.user_id = auth.uid()
      AND user_stats.is_admin = true
    )
  );