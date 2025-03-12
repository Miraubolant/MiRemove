import React from 'react';
import { Shield, X } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-200">
                Politique de confidentialité
              </h2>
            </div>
            <button onClick={onClose} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 text-gray-400">
            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                1. Collecte des données
              </h3>
              <p>
                Nous collectons uniquement les données nécessaires au fonctionnement du service :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Adresse email pour l'authentification</li>
                <li>Images téléchargées pour le traitement</li>
                <li>Statistiques d'utilisation anonymisées</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                2. Utilisation des données
              </h3>
              <p>
                Vos données sont utilisées uniquement pour :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Fournir le service de suppression d'arrière-plan</li>
                <li>Améliorer la qualité du service</li>
                <li>Assurer la sécurité de votre compte</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                3. Conservation des données
              </h3>
              <p>
                Les images sont automatiquement supprimées après traitement. Les données de compte sont conservées tant que votre compte est actif.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                4. Vos droits
              </h3>
              <p>
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                5. Sécurité
              </h3>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès, modification, divulgation ou destruction non autorisés.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                6. Contact
              </h3>
              <p>
                Pour toute question concernant vos données personnelles, contactez-nous à privacy@miremover.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}