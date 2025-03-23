/*
  # Fonction de gestion des webhooks Stripe
  
  1. Nouvelle fonction
    - Nom: handle_stripe_webhook
    - Arguments: event_type text, event_data jsonb
    - Retourne: jsonb
    
  2. Sécurité
    - Security definer pour s'exécuter avec les privilèges élevés
    - Gestion des différents types d'événements Stripe
*/

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
  v_current_period_end timestamptz;
  v_cancel_at timestamptz;
BEGIN
  -- Extraire les données communes
  v_subscription := CASE
    WHEN event_type = 'checkout.session.completed' THEN
      event_data->'subscription'
    ELSE
      event_data
  END;

  v_customer_id := (event_data->>'customer')::text;
  v_subscription_id := (v_subscription->>'id')::text;
  v_status := (v_subscription->>'status')::text;
  v_plan_id := (v_subscription->'items'->'data'->0->'price'->>'product')::text;
  v_current_period_end := to_timestamp((v_subscription->>'current_period_end')::bigint);
  v_cancel_at := CASE
    WHEN v_subscription->>'cancel_at' IS NOT NULL THEN
      to_timestamp((v_subscription->>'cancel_at')::bigint)
    ELSE
      NULL
  END;

  -- Récupérer l'ID utilisateur depuis les métadonnées
  v_user_id := (v_subscription->'metadata'->>'supabaseUid')::uuid;

  -- Gérer les différents types d'événements
  CASE event_type
    WHEN 'checkout.session.completed' THEN
      -- Créer ou mettre à jour l'abonnement
      INSERT INTO subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        plan_id,
        status,
        current_period_end,
        cancel_at
      ) VALUES (
        v_user_id,
        v_customer_id,
        v_subscription_id,
        v_plan_id,
        v_status,
        v_current_period_end,
        v_cancel_at
      )
      ON CONFLICT (user_id) DO UPDATE SET
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        plan_id = EXCLUDED.plan_id,
        status = EXCLUDED.status,
        current_period_end = EXCLUDED.current_period_end,
        cancel_at = EXCLUDED.cancel_at,
        updated_at = now();

    WHEN 'customer.subscription.updated',
         'customer.subscription.deleted' THEN
      -- Mettre à jour l'abonnement existant
      UPDATE subscriptions
      SET status = v_status,
          plan_id = v_plan_id,
          current_period_end = v_current_period_end,
          cancel_at = v_cancel_at,
          updated_at = now()
      WHERE stripe_subscription_id = v_subscription_id;

  END CASE;

  -- Mettre à jour les limites utilisateur en fonction du plan
  UPDATE user_stats
  SET image_limit = CASE v_plan_id
    WHEN 'prod_Rxa1floPbtBu3t' THEN 1000    -- Personal
    WHEN 'prod_Rxa1zKK2MAm2eD' THEN 5000    -- Pro
    WHEN 'prod_Rxa1dCzpDIZiv1' THEN 10000   -- Elite
    ELSE image_limit  -- Garder la limite actuelle si plan non reconnu
  END,
  updated_at = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'subscription_id', v_subscription_id,
    'status', v_status
  );
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION handle_stripe_webhook(text, jsonb) TO service_role;

-- Commentaires explicatifs
COMMENT ON FUNCTION handle_stripe_webhook(text, jsonb) IS 'Gère les webhooks Stripe pour les abonnements';