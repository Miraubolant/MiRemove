/*
  # Fonction de création de session de paiement
  
  1. Nouvelle fonction
    - Nom: create_checkout_session
    - Arguments: product_id text
    - Retourne: jsonb
    
  2. Sécurité
    - Accessible uniquement aux utilisateurs authentifiés
    - Vérifie l'existence du produit
*/

CREATE OR REPLACE FUNCTION create_checkout_session(product_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_customer_id text;
  v_amount numeric;
BEGIN
  -- Récupérer l'ID de l'utilisateur authentifié
  v_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est authentifié
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  -- Déterminer le montant en fonction du produit
  v_amount := CASE product_id
    WHEN 'prod_Rxa1floPbtBu3t' THEN 6900  -- Personal 69€
    WHEN 'prod_Rxa1zKK2MAm2eD' THEN 29900 -- Pro 299€
    WHEN 'prod_Rxa1dCzpDIZiv1' THEN 49900 -- Elite 499€
    ELSE NULL
  END;

  -- Vérifier que le produit est valide
  IF v_amount IS NULL THEN
    RAISE EXCEPTION 'Produit invalide';
  END IF;

  -- Récupérer l'ID client Stripe existant
  SELECT stripe_customer_id INTO v_customer_id
  FROM subscriptions
  WHERE user_id = v_user_id
  LIMIT 1;

  -- Retourner les informations nécessaires
  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'customer_id', v_customer_id,
    'product_id', product_id,
    'amount', v_amount
  );
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION create_checkout_session(text) TO authenticated;