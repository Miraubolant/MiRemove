/*
  # Correction des politiques RLS pour user_stats

  1. Modifications
    - Suppression des politiques existantes
    - Création de nouvelles politiques sans récursion
    - Ajout d'une politique pour les admins
    - Ajout d'une politique pour les utilisateurs normaux

  2. Sécurité
    - Maintien de la sécurité des données
    - Prévention de la récursion infinie
    - Séparation claire des permissions
*/

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can read own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can read stats" ON public.user_stats;
DROP POLICY IF EXISTS "Admins can read all stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;

-- Politique pour les utilisateurs normaux (lecture de leurs propres stats)
CREATE POLICY "Enable read for users own rows"
ON public.user_stats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour les admins (lecture de toutes les stats)
CREATE POLICY "Enable read for admins"
ON public.user_stats
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.user_stats admin_stats
  WHERE admin_stats.user_id = auth.uid()
  AND admin_stats.is_admin = true
));

-- Politique pour l'insertion (utilisateurs peuvent créer leurs propres stats)
CREATE POLICY "Enable insert for users own rows"
ON public.user_stats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politique pour la mise à jour (utilisateurs peuvent modifier leurs propres stats)
CREATE POLICY "Enable update for users own rows"
ON public.user_stats
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);