/*
  # Correction de la politique RLS pour user_stats

  1. Modifications
    - Mise à jour de la politique SELECT pour permettre aux admins de voir toutes les statistiques
    - Les utilisateurs normaux peuvent toujours voir uniquement leurs propres statistiques

  2. Sécurité
    - Maintien de la sécurité des données en vérifiant le rôle admin
    - Protection des données personnelles des utilisateurs
*/

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Users can read own stats" ON public.user_stats;

-- Créer la nouvelle politique
CREATE POLICY "Users can read stats"
ON public.user_stats
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id -- L'utilisateur peut voir ses propres stats
  OR 
  (SELECT is_admin FROM public.user_stats WHERE user_id = auth.uid()) -- OU si l'utilisateur est admin
);