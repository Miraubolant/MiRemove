/*
  # Fonction de mise à jour des limites d'images par groupe
  
  1. Nouvelle fonction
    - `update_user_group_limits()`
    - Déclenché après INSERT/UPDATE/DELETE sur group_members
    - Met à jour la limite d'images des utilisateurs en fonction de leur groupe

  2. Sécurité
    - Security definer pour s'exécuter avec les privilèges élevés
    - Vérifie les appartenances aux groupes
*/

-- Créer la fonction de mise à jour des limites
CREATE OR REPLACE FUNCTION update_user_group_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Pour un INSERT ou UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Mettre à jour la limite d'images de l'utilisateur
    UPDATE user_stats
    SET image_limit = (
      SELECT g.image_limit
      FROM groups g
      INNER JOIN group_members gm ON gm.group_id = g.id
      WHERE gm.user_id = NEW.user_id
      ORDER BY g.image_limit DESC
      LIMIT 1
    ),
    updated_at = now()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
  END IF;

  -- Pour un DELETE
  IF (TG_OP = 'DELETE') THEN
    -- Réinitialiser la limite d'images de l'utilisateur
    -- à la limite du groupe restant avec la plus haute limite
    -- ou à la limite par défaut s'il n'est plus dans aucun groupe
    UPDATE user_stats
    SET image_limit = COALESCE(
      (
        SELECT g.image_limit
        FROM groups g
        INNER JOIN group_members gm ON gm.group_id = g.id
        WHERE gm.user_id = OLD.user_id
        ORDER BY g.image_limit DESC
        LIMIT 1
      ),
      100  -- Limite par défaut pour les utilisateurs sans groupe
    ),
    updated_at = now()
    WHERE user_id = OLD.user_id;
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Créer le trigger sur la table group_members
CREATE TRIGGER update_user_limits_on_group_change
  AFTER INSERT OR UPDATE OR DELETE
  ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_user_group_limits();

-- Ajouter des commentaires
COMMENT ON FUNCTION update_user_group_limits() IS 'Met à jour les limites d''images des utilisateurs en fonction de leur groupe';
COMMENT ON TRIGGER update_user_limits_on_group_change ON group_members IS 'Déclenche la mise à jour des limites d''images lors des changements de groupe';