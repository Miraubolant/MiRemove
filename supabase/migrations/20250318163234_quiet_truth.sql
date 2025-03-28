/*
  # Enhanced Subscription Management

  1. Changes
    - Create subscriptions table first
    - Add webhook handler function
    - Add subscription logs table
    - Add trigger for subscription changes
    
  2. Security
    - Enable RLS on all tables
    - Functions run with security definer
    - Proper policies for access control
*/

-- Create subscriptions table first
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_id text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id),
  UNIQUE(stripe_customer_id),
  UNIQUE(stripe_subscription_id)
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create subscription logs table for auditing
CREATE TABLE IF NOT EXISTS subscription_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  old_plan_id text,
  new_plan_id text NOT NULL,
  old_status text,
  new_status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on subscription logs
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;

-- Create or replace the webhook handler function
CREATE OR REPLACE FUNCTION handle_stripe_webhook(event_type text, event_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription jsonb;
  v_customer_id text;
  v_subscription_id text;
  v_user_id uuid;
  v_status text;
  v_plan_id text;
BEGIN
  -- Extract subscription data based on event type
  v_subscription := CASE
    WHEN event_type = 'checkout.session.completed' THEN
      event_data->'subscription'
    ELSE
      event_data
  END;

  -- Get basic subscription info
  v_customer_id := (event_data->>'customer')::text;
  v_subscription_id := (v_subscription->>'id')::text;
  v_status := (v_subscription->>'status')::text;
  v_plan_id := (v_subscription->'items'->'data'->0->'price'->>'product')::text;
  v_user_id := (v_subscription->'metadata'->>'supabaseUid')::uuid;

  -- Update user_stats based on subscription status
  UPDATE user_stats
  SET 
    image_limit = CASE 
      WHEN v_plan_id = 'prod_Rxa1floPbtBu3t' AND v_status = 'active' THEN 1000    -- Personal
      WHEN v_plan_id = 'prod_Rxa1zKK2MAm2eD' AND v_status = 'active' THEN 5000    -- Pro
      WHEN v_plan_id = 'prod_Rxa1dCzpDIZiv1' AND v_status = 'active' THEN 10000   -- Elite
      ELSE 100  -- Default/Free tier
    END,
    is_premium = CASE 
      WHEN v_status = 'active' THEN true
      ELSE false
    END,
    updated_at = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'subscription_id', v_subscription_id,
    'status', v_status,
    'plan_id', v_plan_id
  );
END;
$$;

-- Create or replace the subscription update trigger function
CREATE OR REPLACE FUNCTION handle_subscription_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user_stats based on subscription status
  UPDATE user_stats
  SET 
    image_limit = CASE 
      WHEN NEW.plan_id = 'prod_Rxa1floPbtBu3t' AND NEW.status = 'active' THEN 1000    -- Personal
      WHEN NEW.plan_id = 'prod_Rxa1zKK2MAm2eD' AND NEW.status = 'active' THEN 5000    -- Pro
      WHEN NEW.plan_id = 'prod_Rxa1dCzpDIZiv1' AND NEW.status = 'active' THEN 10000   -- Elite
      ELSE 100  -- Default/Free tier
    END,
    is_premium = CASE 
      WHEN NEW.status = 'active' THEN true
      ELSE false
    END,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  -- Log subscription change
  INSERT INTO subscription_logs (
    user_id,
    action,
    old_plan_id,
    new_plan_id,
    old_status,
    new_status
  ) VALUES (
    NEW.user_id,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
      ELSE TG_OP::text
    END,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.plan_id ELSE NULL END,
    NEW.plan_id,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
    NEW.status
  );

  RETURN NEW;
END;
$$;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ));

-- Create policies for subscription logs
CREATE POLICY "Admins can view all subscription logs"
  ON subscription_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_stats
    WHERE user_stats.user_id = auth.uid()
    AND user_stats.is_admin = true
  ));

CREATE POLICY "Users can view their own subscription logs"
  ON subscription_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create trigger
CREATE TRIGGER update_image_limit_on_subscription
  AFTER INSERT OR UPDATE
  ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_update();

-- Add helpful comments
COMMENT ON FUNCTION handle_stripe_webhook(text, jsonb) IS 'Handles Stripe webhook events and updates user limits accordingly';
COMMENT ON FUNCTION handle_subscription_update() IS 'Updates user limits and logs subscription changes';
COMMENT ON TABLE subscription_logs IS 'Audit log for subscription changes';
COMMENT ON TABLE subscriptions IS 'User subscription information from Stripe';