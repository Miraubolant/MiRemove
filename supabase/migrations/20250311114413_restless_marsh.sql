/*
  # Amélioration des politiques RLS pour les administrateurs

  1. Changements
    - Création d'une fonction sécurisée is_admin() pour vérifier le statut administrateur
    - Suppression des anciennes politiques pour éviter les conflits
    - Création de nouvelles politiques utilisant la fonction is_admin()
    - Optimisation des vérifications d'accès

  2. Sécurité
    - Utilisation de SECURITY DEFINER pour la fonction is_admin()
    - Politiques distinctes pour les administrateurs et les utilisateurs normaux
    - Vérifications d'accès simplifiées et plus sûres

  3. Notes
    - La fonction is_admin() est créée au niveau du schéma public
    - Les politiques sont appliquées à la table user_stats
    - Les administrateurs ont un accès complet aux données
    - Les utilisateurs normaux ne peuvent voir que leurs propres données
*/

-- Supprime les anciennes politiques
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats'
  ) THEN
    DROP POLICY IF EXISTS "Les administrateurs peuvent voir toutes les statistiques" ON public.user_stats;
    DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres statistiques" ON public.user_stats;
    DROP POLICY IF EXISTS "Les administrateurs peuvent mettre à jour toutes les statistiques" ON public.user_stats;
    DROP POLICY IF EXISTS "Les administrateurs peuvent supprimer des statistiques" ON public.user_stats;
  END IF;
END $$;

-- Création de la fonction sécurisée pour identifier les administrateurs
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_stats 
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politique pour permettre aux utilisateurs de voir leurs propres statistiques
CREATE POLICY "Les utilisateurs peuvent voir leurs propres statistiques"
ON public.user_stats
FOR SELECT
USING (
  user_id = auth.uid() OR public.is_admin()
);

-- Politique pour permettre aux administrateurs de voir toutes les statistiques
CREATE POLICY "Les administrateurs peuvent voir toutes les statistiques"
ON public.user_stats
FOR SELECT
USING (public.is_admin());

-- Politique pour permettre aux administrateurs de mettre à jour toutes les statistiques
CREATE POLICY "Les administrateurs peuvent mettre à jour toutes les statistiques"
ON public.user_stats
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Politique pour permettre aux administrateurs de supprimer des statistiques
CREATE POLICY "Les administrateurs peuvent supprimer des statistiques"
ON public.user_stats
FOR DELETE
USING (public.is_admin());

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres statistiques
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres statistiques"
ON public.user_stats
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());