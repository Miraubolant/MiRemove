/*
  # Update subscription handling

  1. Changes
    - Add trigger to update user_stats on subscription changes
    - Add function to handle subscription status changes
    - Ensure image limits are updated correctly

  2. Security
    - Security definer for elevated privileges
    - RLS policies remain unchanged
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_image_limit_on_subscription ON subscriptions;
DROP FUNCTION IF EXISTS handle_subscription_update();

-- Create improved function to handle subscription updates
CREATE OR REPLACE FUNCTION handle_subscription_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only proceed if status is 'active' or this is a new subscription
  IF (TG_OP = 'INSERT' OR NEW.status = 'active') THEN
    -- Update user_stats with new limits and premium status
    UPDATE user_stats
    SET 
      image_limit = CASE 
        WHEN NEW.plan_id = 'prod_Rxa1floPbtBu3t' THEN 1000    -- Personal
        WHEN NEW.plan_id = 'prod_Rxa1zKK2MAm2eD' THEN 5000    -- Pro
        WHEN NEW.plan_id = 'prod_Rxa1dCzpDIZiv1' THEN 10000   -- Elite
        ELSE 100  -- Default limit for free users
      END,
      is_premium = true,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSIF NEW.status IN ('canceled', 'incomplete_expired', 'unpaid') THEN
    -- Reset to free tier limits when subscription ends
    UPDATE user_stats
    SET 
      image_limit = 100,  -- Default free tier limit
      is_premium = false,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create new trigger
CREATE TRIGGER update_image_limit_on_subscription
  AFTER INSERT OR UPDATE
  ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_update();

-- Add comments
COMMENT ON FUNCTION handle_subscription_update() IS 'Updates user stats and limits based on subscription changes';