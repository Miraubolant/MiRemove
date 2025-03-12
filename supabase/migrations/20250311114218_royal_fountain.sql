/*
  # Ajout des politiques RLS pour les administrateurs

  1. Sécurité
    - Ajout d'une politique permettant aux administrateurs de voir toutes les statistiques
    - Ajout d'une politique permettant aux utilisateurs de voir leurs propres statistiques
    - Ajout d'une politique permettant aux administrateurs de mettre à jour toutes les statistiques
    - Ajout d'une politique permettant aux administrateurs de supprimer des statistiques

  2. Notes
    - Les administrateurs sont identifiés par le champ is_admin dans la table user_stats
    - Les utilisateurs normaux ne peuvent voir que leurs propres statistiques
    - Seuls les administrateurs peuvent voir et gérer les statistiques de tous les utilisateurs
*/

-- Supprime les anciennes politiques si elles existent
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats' 
    AND policyname = 'Les administrateurs peuvent voir toutes les statistiques'
  ) THEN
    DROP POLICY "Les administrateurs peuvent voir toutes les statistiques" ON public.user_stats;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_stats' 
    AND policyname = 'Les utilisateurs peuvent voir leurs propres statistiques'
  ) THEN
    DROP POLICY "Les utilisateurs peuvent voir leurs propres statistiques" ON public.user_stats;
  END IF;
END $$;

-- Politique pour permettre aux administrateurs de voir toutes les statistiques
CREATE POLICY "Les administrateurs peuvent voir toutes les statistiques"
ON public.user_stats
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_stats
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Politique pour permettre aux utilisateurs de voir leurs propres statistiques
CREATE POLICY "Les utilisateurs peuvent voir leurs propres statistiques"
ON public.user_stats
FOR SELECT
USING (user_id = auth.uid());

-- Politique pour permettre aux administrateurs de mettre à jour toutes les statistiques
CREATE POLICY "Les administrateurs peuvent mettre à jour toutes les statistiques"
ON public.user_stats
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_stats
    WHERE user_id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_stats
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Politique pour permettre aux administrateurs de supprimer des statistiques
CREATE POLICY "Les administrateurs peuvent supprimer des statistiques"
ON public.user_stats
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_stats
    WHERE user_id = auth.uid() AND is_admin = true
  )
);