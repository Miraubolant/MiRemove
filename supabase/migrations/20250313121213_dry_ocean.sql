-- Update privacy policy content
UPDATE legal_content
SET content = 
'Politique de confidentialité

MiRemover s''engage à protéger votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données.

1. Données collectées
Nous collectons uniquement les données nécessaires au fonctionnement du service : votre adresse email pour l''authentification, vos images pendant leur traitement uniquement, des statistiques d''utilisation anonymes et les données de connexion essentielles pour la sécurité.

2. Utilisation des données
Vos données servent exclusivement à fournir notre service de suppression d''arrière-plan, améliorer la qualité de nos prestations, assurer la sécurité de votre compte et vous contacter en cas de besoin. Nous ne partageons jamais vos informations avec des tiers.

3. Protection des données
La sécurité est notre priorité. Nous utilisons un chiffrement de bout en bout, stockons vos données exclusivement en Europe, supprimons automatiquement vos images après traitement et limitons strictement l''accès à vos informations personnelles.

4. Vos droits
Vous gardez le contrôle total de vos données. Vous pouvez à tout moment accéder à vos informations, les corriger, supprimer votre compte ou exporter vos données. Nous traitons toutes les demandes dans les plus brefs délais.

5. Cookies essentiels
Nous utilisons uniquement les cookies nécessaires au fonctionnement du service : authentification sécurisée, sauvegarde de vos préférences et optimisation des performances. Aucun cookie publicitaire n''est utilisé.

6. Nous contacter
Pour toute question concernant vos données personnelles, notre équipe est à votre disposition :
privacy@miremover.com'
WHERE type = 'privacy';

-- Update terms of service content
UPDATE legal_content
SET content = 
'Conditions d''utilisation

En utilisant MiRemover, vous acceptez les présentes conditions qui définissent nos engagements mutuels.

1. Notre service
MiRemover propose un service professionnel de suppression d''arrière-plan d''images par intelligence artificielle. Nous garantissons un traitement haute qualité, des exports optimisés en PNG ou JPG et un stockage temporaire sécurisé de vos fichiers pendant le traitement.

2. Règles d''utilisation
Notre service doit être utilisé dans le respect de la loi et des bonnes pratiques. Cela implique un usage légal, pas de surcharge intentionnelle du système, le partage de contenu approprié uniquement et le respect des droits d''auteur.

3. Votre compte
Chaque utilisateur doit créer un seul compte avec des informations véridiques. Vous êtes responsable de la sécurité de vos identifiants et devez respecter les quotas d''utilisation définis pour votre type de compte.

4. Propriété et droits
Vous conservez tous les droits sur vos images. Notre service et sa technologie restent notre propriété. Nous vous accordons une licence personnelle d''utilisation, sans droit de copie ou de reproduction du service.

5. Mises à jour
Nous améliorons constamment notre service et pouvons modifier ces conditions. Les changements prennent effet dès leur publication. Nous vous informerons des modifications importantes.

6. Contact
Notre équipe est à votre écoute pour toute question :
terms@miremover.com'
WHERE type = 'terms';

-- Update GDPR content
UPDATE legal_content
SET content = 
'Conformité RGPD

Nous nous engageons à protéger vos données conformément au Règlement Général sur la Protection des Données (RGPD).

1. Bases légales
Notre traitement de vos données repose sur des bases légales solides : votre consentement explicite, l''exécution de nos services, nos obligations légales et nos intérêts légitimes. Chaque traitement est documenté et justifié.

2. Vos droits garantis
Le RGPD vous garantit des droits étendus que nous respectons scrupuleusement : accès complet à vos données, correction immédiate des inexactitudes, suppression définitive sur demande, portabilité simplifiée, opposition au traitement et limitation selon vos souhaits.

3. Conservation des données
Nous appliquons une politique de conservation stricte : vos données de compte sont conservées jusqu''à votre demande de suppression, les images sont effacées après traitement, les logs techniques sont gardés 12 mois maximum et les sauvegardes 30 jours.

4. Sécurité des données
Vos données sont protégées par des mesures strictes : hébergement exclusif dans l''Union Européenne, aucun transfert hors UE, collaboration uniquement avec des partenaires conformes RGPD et protection technique renforcée.

5. Exercer vos droits
Nous facilitons l''exercice de vos droits : contactez directement notre DPO, recevez une réponse sous 30 jours maximum, suivez un processus simple et sécurisé après vérification de votre identité.

6. Délégué à la Protection
Notre Délégué à la Protection des Données veille au respect de vos droits :
dpo@miremover.com'
WHERE type = 'gdpr';