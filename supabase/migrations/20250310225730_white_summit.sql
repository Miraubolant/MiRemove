/*
  # Ajout de la colonne email à la table user_stats

  1. Modifications
    - Ajout de la colonne `email` à la table `user_stats`
    - Mise à jour des données existantes avec les emails des utilisateurs
    - Ajout d'une contrainte unique sur la colonne email
*/

-- Ajout de la colonne email
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS email text;

-- Mise à jour des emails existants à partir de la table auth.users
UPDATE user_stats
SET email = users.email
FROM auth.users
WHERE user_stats.user_id = users.id;

-- Rendre la colonne email non nullable et unique
ALTER TABLE user_stats ALTER COLUMN email SET NOT NULL;
ALTER TABLE user_stats ADD CONSTRAINT user_stats_email_key UNIQUE (email);