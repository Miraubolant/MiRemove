/*
  # Fix legal content duplicate key error

  1. Changes
    - Drop existing content to avoid conflicts
    - Insert new content with proper unique constraints
    - Use ON CONFLICT DO UPDATE to handle duplicates

  2. Security
    - Maintain existing RLS policies
    - No changes to table structure
*/

-- First, delete any existing content to avoid conflicts
DELETE FROM legal_content;

-- Insert new content with ON CONFLICT handling
INSERT INTO legal_content (type, content) VALUES
('privacy', 'Politique de confidentialité

MiRemover s''engage à protéger votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données.

1. Données collectées
  - Adresse email pour l''authentification
  - Images téléchargées (temporairement)
  - Statistiques d''utilisation anonymes
  - Données de connexion sécurisées

2. Utilisation des données
  - Fournir le service de suppression d''arrière-plan
  - Améliorer la qualité du service
  - Assurer la sécurité de votre compte
  - Vous contacter si nécessaire

3. Protection des données
  - Chiffrement de bout en bout
  - Stockage sécurisé en Europe
  - Suppression automatique des images
  - Accès strictement contrôlé

4. Vos droits
  - Accès à vos données
  - Rectification des informations
  - Suppression du compte
  - Export des données

5. Cookies essentiels
  - Authentification sécurisée
  - Préférences utilisateur
  - Performance du service

6. Nous contacter
Pour toute question sur vos données :
privacy@miremover.com')
ON CONFLICT (type) DO UPDATE SET content = EXCLUDED.content;

INSERT INTO legal_content (type, content) VALUES
('terms', 'Conditions d''utilisation

En utilisant MiRemover, vous acceptez les présentes conditions.

1. Notre service
  - Suppression d''arrière-plan par IA
  - Traitement haute qualité
  - Export PNG/JPG optimisé
  - Stockage temporaire sécurisé

2. Règles d''utilisation
  - Usage légal uniquement
  - Pas de surcharge du service
  - Contenu approprié
  - Respect des droits d''auteur

3. Votre compte
  - Un compte par personne
  - Informations véridiques
  - Sécurité des accès
  - Respect des quotas

4. Propriété et droits
  - Vos images restent vôtres
  - Service protégé
  - Usage personnel
  - Pas de copie du service

5. Mises à jour
Les conditions peuvent évoluer. Les changements prennent effet immédiatement.

6. Contact
Questions ou suggestions :
terms@miremover.com')
ON CONFLICT (type) DO UPDATE SET content = EXCLUDED.content;

INSERT INTO legal_content (type, content) VALUES
('gdpr', 'Conformité RGPD

Protection de vos données selon le Règlement Général sur la Protection des Données.

1. Bases légales
  - Votre consentement explicite
  - Exécution de nos services
  - Obligations réglementaires
  - Intérêts légitimes

2. Vos droits garantis
  - Accès complet
  - Correction immédiate
  - Suppression définitive
  - Portabilité simplifiée
  - Opposition possible
  - Traitement limité

3. Conservation
  - Compte : jusqu''à suppression
  - Images : effacées après usage
  - Logs : 12 mois maximum
  - Backups : 30 jours

4. Sécurité des données
  - Hébergement européen
  - Aucun transfert hors UE
  - Partenaires conformes
  - Protection renforcée

5. Exercer vos droits
  - Contact direct DPO
  - Réponse sous 30 jours
  - Processus simplifié
  - Identité vérifiée

6. Délégué à la Protection
Notre DPO est à votre écoute :
dpo@miremover.com')
ON CONFLICT (type) DO UPDATE SET content = EXCLUDED.content;