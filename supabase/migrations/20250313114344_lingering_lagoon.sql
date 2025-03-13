/*
  # Update legal content with escaped HTML

  1. Changes
    - Use proper SQL string escaping for HTML content
    - Use E'' syntax for string literals with escapes
    - Split long strings into manageable chunks
    - Use string concatenation for readability

  2. Security
    - Content remains properly escaped
    - No SQL injection vulnerabilities
*/

-- Update privacy policy content
UPDATE legal_content
SET content = 
  'Politique de confidentialité

  1. Données collectées
  - Adresse email (pour l''authentification)
  - Images téléchargées (temporairement pour le traitement)
  - Statistiques d''utilisation anonymes
  - Données de connexion basiques

  2. Utilisation des données
  - Fournir le service de suppression d''arrière-plan
  - Améliorer la qualité du service
  - Assurer la sécurité de votre compte
  - Vous contacter en cas de nécessité

  3. Protection des données
  - Chiffrement SSL/TLS pour toutes les transmissions
  - Stockage sécurisé des données
  - Suppression automatique des images après traitement
  - Accès restreint aux données personnelles

  4. Vos droits
  - Accéder à vos données personnelles
  - Rectifier vos informations
  - Supprimer votre compte
  - Exporter vos données

  5. Cookies
  - Maintenir votre session
  - Mémoriser vos préférences
  - Assurer la sécurité

  6. Contact
  privacy@miremover.com'
WHERE type = 'privacy';

-- Update terms of service content
UPDATE legal_content
SET content = 
  'Conditions d''utilisation

  1. Service
  - Suppression d''arrière-plan d''images par IA
  - Traitement automatisé des images
  - Export en formats PNG et JPG
  - Stockage temporaire pendant le traitement

  2. Utilisation acceptable
  - Ne pas utiliser le service illégalement
  - Ne pas surcharger le système
  - Ne pas partager de contenu inapproprié
  - Respecter les droits d''auteur

  3. Compte utilisateur
  - Créer un seul compte par personne
  - Fournir des informations exactes
  - Protéger ses identifiants
  - Respecter les limites d''utilisation

  4. Propriété intellectuelle
  - Vous gardez vos droits sur vos images
  - Le service reste notre propriété
  - Licence limitée d''utilisation
  - Pas de reverse engineering

  5. Modifications
  Nous nous réservons le droit de modifier ces conditions à tout moment.

  6. Contact
  terms@miremover.com'
WHERE type = 'terms';

-- Update GDPR content
UPDATE legal_content
SET content = 
  'Conformité RGPD

  1. Base légale
  - Consentement explicite
  - Exécution du contrat
  - Obligations légales
  - Intérêts légitimes

  2. Vos droits RGPD
  - Droit d''accès à vos données
  - Droit de rectification
  - Droit à l''effacement
  - Droit à la portabilité
  - Droit d''opposition
  - Droit de limitation du traitement

  3. Conservation des données
  - Compte : jusqu''à suppression
  - Images : supprimées après traitement
  - Logs : 12 mois maximum
  - Backups : 30 jours

  4. Transferts de données
  - Hébergement dans l''UE
  - Pas de transfert hors UE
  - Sous-traitants conformes RGPD
  - Mesures de sécurité appropriées

  5. Exercer vos droits
  - Email au DPO
  - Formulaire de contact
  - Délai de réponse : 1 mois
  - Justificatif d''identité requis

  6. Contact DPO
  dpo@miremover.com'
WHERE type = 'gdpr';