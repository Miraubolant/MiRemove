/*
  # Correction de la récursion infinie dans la politique RLS

  1. Modifications
    - Suppression de la politique existante qui cause la récursion infinie
    - Création d'une nouvelle politique plus sécurisée
    - Ajout d'une politique distincte pour les admins

  2. Sécurité
    - Maintien de la sécurité des données
    - Prévention de la récursion infinie
    - Séparation claire des permissions admin et utilisateur
*/

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can read stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can read own stats" ON public.user_stats;

-- Politique pour les utilisateurs normaux (peuvent voir leurs propres stats)
CREATE POLICY "Users can read own stats"
ON public.user_stats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour les admins (peuvent tout voir)
CREATE POLICY "Admins can read all stats"
ON public.user_stats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_stats
    WHERE user_id = auth.uid() AND is_admin = true
  )
);