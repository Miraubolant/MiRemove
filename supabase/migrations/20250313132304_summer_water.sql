-- Update legal content with more detailed information
UPDATE legal_content
SET content = 
'1. Données collectées
  - Adresse email pour l''authentification et la communication
  - Images téléchargées (stockées temporairement pendant le traitement)
  - Statistiques d''utilisation anonymisées pour améliorer le service
  - Données de connexion sécurisées (IP, date, navigateur)
  - Préférences utilisateur (paramètres de traitement d''image)
  - Informations de paiement (uniquement pour les comptes premium)

2. Utilisation des données
  - Fournir le service de suppression d''arrière-plan d''images
  - Optimiser et améliorer la qualité du service
  - Assurer la sécurité de votre compte
  - Vous contacter pour des informations importantes
  - Analyser l''utilisation du service de manière anonyme
  - Prévenir les utilisations frauduleuses

3. Protection des données
  - Chiffrement de bout en bout de toutes les transmissions
  - Stockage sécurisé sur des serveurs européens certifiés
  - Suppression automatique des images après traitement
  - Accès strictement contrôlé aux données personnelles
  - Audits de sécurité réguliers
  - Surveillance continue des accès

4. Vos droits
  - Accès complet à vos données personnelles
  - Rectification des informations inexactes
  - Suppression de votre compte et des données associées
  - Export de vos données au format standard
  - Opposition au traitement de vos données
  - Limitation du traitement sur demande

5. Cookies essentiels
  - Authentification sécurisée de votre compte
  - Sauvegarde de vos préférences utilisateur
  - Optimisation des performances du service
  - Mesures de sécurité (prévention des fraudes)
  - Session de travail (paramètres temporaires)
  - Statistiques anonymes d''utilisation

6. Nous contacter
Pour toute question concernant vos données personnelles :
  - Email : contact@miraubolant.com
  - Délai de réponse : 48h maximum
  - Service disponible 7j/7'
WHERE type = 'privacy';

UPDATE legal_content
SET content = 
'1. Notre service
  - Suppression d''arrière-plan par intelligence artificielle avancée
  - Traitement haute qualité avec préservation des détails
  - Export optimisé en PNG (transparent) et JPG (fond blanc)
  - Stockage temporaire sécurisé pendant le traitement
  - Support multi-formats d''images (JPG, PNG, WEBP)
  - Traitement par lots disponible

2. Règles d''utilisation
  - Usage strictement légal et éthique du service
  - Pas de surcharge intentionnelle des serveurs
  - Contenu approprié et respectueux uniquement
  - Respect des droits d''auteur et de la propriété intellectuelle
  - Interdiction de reverse engineering du service
  - Utilisation personnelle ou professionnelle autorisée

3. Votre compte
  - Un seul compte actif par utilisateur
  - Informations de profil véridiques et à jour
  - Responsabilité de la sécurité des accès
  - Respect des quotas selon le type de compte
  - Interdiction de partage de compte
  - Suspension possible en cas d''abus

4. Propriété et droits
  - Vous conservez tous les droits sur vos images
  - Notre technologie reste notre propriété exclusive
  - Licence d''utilisation personnelle non-transférable
  - Interdiction de copier ou reproduire le service
  - Protection des innovations techniques
  - Marques et logos déposés

5. Mises à jour
  - Évolution régulière des conditions d''utilisation
  - Notification des changements importants
  - Application immédiate des nouvelles conditions
  - Droit de refus impliquant l''arrêt d''utilisation
  - Archivage des versions précédentes
  - Clarté des modifications

6. Contact
Pour toute question ou suggestion :
  - Email : contact@miraubolant.com
  - Support technique disponible
  - Réponse sous 24h ouvrées'
WHERE type = 'terms';

UPDATE legal_content
SET content = 
'1. Bases légales
  - Consentement explicite pour le traitement des données
  - Exécution du contrat de service d''imagerie
  - Obligations légales et réglementaires
  - Intérêts légitimes (sécurité, amélioration)
  - Protection des données personnelles
  - Respect des normes européennes

2. Vos droits garantis
  - Accès complet à vos données personnelles
  - Correction immédiate des informations inexactes
  - Suppression définitive sur demande (droit à l''oubli)
  - Portabilité des données vers d''autres services
  - Opposition au traitement des données
  - Limitation du traitement selon vos souhaits

3. Conservation
  - Compte actif : conservation jusqu''à suppression
  - Images : effacées après traitement (24h max)
  - Logs techniques : 12 mois maximum
  - Backups : rotation sur 30 jours
  - Données de paiement : selon obligations légales
  - Statistiques : anonymisation après 6 mois

4. Sécurité des données
  - Hébergement exclusif dans l''Union Européenne
  - Aucun transfert de données hors UE
  - Partenaires techniques certifiés RGPD
  - Protection renforcée contre les intrusions
  - Chiffrement systématique des données
  - Audits de sécurité réguliers

5. Exercer vos droits
  - Contact direct avec notre DPO
  - Réponse sous 30 jours maximum
  - Processus de vérification d''identité
  - Formulaires de demande simplifiés
  - Assistance pour les demandes complexes
  - Recours possibles (CNIL)

6. Délégué à la Protection
Notre DPO veille au respect de vos droits :
  - Email : contact@miraubolant.com
  - Réponse garantie sous 48h
  - Procédures documentées
  - Registre des traitements disponible'
WHERE type = 'gdpr';