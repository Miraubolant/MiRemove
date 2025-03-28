/*
  # Remove Stripe Integration

  1. Changes
    - Drop all Stripe-related functions
    - Drop subscriptions table and related objects
    - Clean up any related policies and triggers
    - Use DO blocks to handle conditional drops safely

  2. Security
    - Safe removal of all Stripe components
*/

DO $$ 
BEGIN
  -- Drop functions if they exist
  DROP FUNCTION IF EXISTS create_checkout_session(text);
  DROP FUNCTION IF EXISTS handle_stripe_webhook(text, jsonb);

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
    DROP TABLE IF EXISTS subscriptions;
  END IF;
END $$;