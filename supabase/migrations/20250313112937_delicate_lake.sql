/*
  # Fix legal content migration

  1. Changes
    - Use INSERT ... ON CONFLICT DO UPDATE instead of plain UPDATE
    - This ensures we either create new entries or update existing ones
    - Prevents duplicate key violations

  2. Security
    - No changes to existing security policies
    - Content remains publicly readable
*/

-- Insert or update privacy policy content
INSERT INTO legal_content (type, content)
VALUES (
  'privacy',
  '<div class="space-y-8">
    <section>
      <h2 class="text-2xl font-bold text-gray-200 mb-4">Politique de confidentialité</h2>
      <p class="text-gray-400 leading-relaxed">MiRemover s''engage à protéger votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données.</p>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">1. Données collectées</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Adresse email (pour l''authentification)</li>
        <li>Images téléchargées (temporairement pour le traitement)</li>
        <li>Statistiques d''utilisation anonymes</li>
        <li>Données de connexion basiques</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">2. Utilisation des données</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Fournir le service de suppression d''arrière-plan</li>
        <li>Améliorer la qualité du service</li>
        <li>Assurer la sécurité de votre compte</li>
        <li>Vous contacter en cas de nécessité</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">3. Protection des données</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Chiffrement SSL/TLS pour toutes les transmissions</li>
        <li>Stockage sécurisé des données</li>
        <li>Suppression automatique des images après traitement</li>
        <li>Accès restreint aux données personnelles</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">4. Vos droits</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Accéder à vos données personnelles</li>
        <li>Rectifier vos informations</li>
        <li>Supprimer votre compte</li>
        <li>Exporter vos données</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">5. Cookies</h3>
      <p class="text-gray-400 leading-relaxed">Nous utilisons des cookies essentiels pour :</p>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Maintenir votre session</li>
        <li>Mémoriser vos préférences</li>
        <li>Assurer la sécurité</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">6. Contact</h3>
      <p class="text-gray-400 leading-relaxed">Pour toute question concernant vos données :</p>
      <p class="text-emerald-500">privacy@miremover.com</p>
    </section>
  </div>'
)
ON CONFLICT (type) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = now();

-- Insert or update terms of service content
INSERT INTO legal_content (type, content)
VALUES (
  'terms',
  '<div class="space-y-8">
    <section>
      <h2 class="text-2xl font-bold text-gray-200 mb-4">Conditions d''utilisation</h2>
      <p class="text-gray-400 leading-relaxed">En utilisant MiRemover, vous acceptez les présentes conditions d''utilisation.</p>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">1. Service</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Suppression d''arrière-plan d''images par IA</li>
        <li>Traitement automatisé des images</li>
        <li>Export en formats PNG et JPG</li>
        <li>Stockage temporaire pendant le traitement</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">2. Utilisation acceptable</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Ne pas utiliser le service illégalement</li>
        <li>Ne pas surcharger le système</li>
        <li>Ne pas partager de contenu inapproprié</li>
        <li>Respecter les droits d''auteur</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">3. Compte utilisateur</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Créer un seul compte par personne</li>
        <li>Fournir des informations exactes</li>
        <li>Protéger ses identifiants</li>
        <li>Respecter les limites d''utilisation</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">4. Propriété intellectuelle</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Vous gardez vos droits sur vos images</li>
        <li>Le service reste notre propriété</li>
        <li>Licence limitée d''utilisation</li>
        <li>Pas de reverse engineering</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">5. Modifications</h3>
      <p class="text-gray-400 leading-relaxed">Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur dès leur publication.</p>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">6. Contact</h3>
      <p class="text-gray-400 leading-relaxed">Pour toute question :</p>
      <p class="text-emerald-500">terms@miremover.com</p>
    </section>
  </div>'
)
ON CONFLICT (type) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = now();

-- Insert or update GDPR content
INSERT INTO legal_content (type, content)
VALUES (
  'gdpr',
  '<div class="space-y-8">
    <section>
      <h2 class="text-2xl font-bold text-gray-200 mb-4">Conformité RGPD</h2>
      <p class="text-gray-400 leading-relaxed">Conformément au Règlement Général sur la Protection des Données (RGPD), nous nous engageons à protéger vos données personnelles.</p>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">1. Base légale</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Consentement explicite</li>
        <li>Exécution du contrat</li>
        <li>Obligations légales</li>
        <li>Intérêts légitimes</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">2. Vos droits RGPD</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Droit d''accès à vos données</li>
        <li>Droit de rectification</li>
        <li>Droit à l''effacement</li>
        <li>Droit à la portabilité</li>
        <li>Droit d''opposition</li>
        <li>Droit de limitation du traitement</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">3. Conservation des données</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Compte : jusqu''à suppression</li>
        <li>Images : supprimées après traitement</li>
        <li>Logs : 12 mois maximum</li>
        <li>Backups : 30 jours</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">4. Transferts de données</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Hébergement dans l''UE</li>
        <li>Pas de transfert hors UE</li>
        <li>Sous-traitants conformes RGPD</li>
        <li>Mesures de sécurité appropriées</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">5. Exercer vos droits</h3>
      <ul class="list-disc list-inside space-y-2 text-gray-400">
        <li>Email au DPO</li>
        <li>Formulaire de contact</li>
        <li>Délai de réponse : 1 mois</li>
        <li>Justificatif d''identité requis</li>
      </ul>
    </section>

    <section>
      <h3 class="text-xl font-semibold text-gray-200 mb-3">6. Contact DPO</h3>
      <p class="text-gray-400 leading-relaxed">Notre Délégué à la Protection des Données :</p>
      <p class="text-emerald-500">dpo@miremover.com</p>
    </section>
  </div>'
)
ON CONFLICT (type) DO UPDATE
SET content = EXCLUDED.content,
    updated_at = now();