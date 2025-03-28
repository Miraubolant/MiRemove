/*
  # Clean up Stripe Integration

  1. Changes
    - Safely remove subscriptions table and related objects if they exist
    - Clean up any related policies and triggers
    - Use DO blocks to handle conditional drops

  2. Security
    - Safe removal of policies
*/

DO $$ 
BEGIN
  -- Drop policies if the table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'subscriptions'
  ) THEN
    -- Drop policies
    IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'subscriptions' 
      AND policyname = 'Users can view their own subscriptions'
    ) THEN
      DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
    END IF;

    IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'subscriptions' 
      AND policyname = 'Admins can manage all subscriptions'
    ) THEN
      DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;
    END IF;

    -- Drop trigger if it exists
    IF EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'update_subscriptions_updated_at'
    ) THEN
      DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
    END IF;

    -- Finally drop the table
    DROP TABLE subscriptions;
  END IF;
END $$;