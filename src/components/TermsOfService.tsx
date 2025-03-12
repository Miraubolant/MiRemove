import React from 'react';
import { ScrollText, X } from 'lucide-react';

interface TermsOfServiceProps {
  onClose: () => void;
}

export function TermsOfService({ onClose }: TermsOfServiceProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <ScrollText className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-200">
                Conditions d'utilisation
              </h2>
            </div>
            <button onClick={onClose} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 text-gray-400">
            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                1. Acceptation des conditions
              </h3>
              <p>
                En utilisant MiRemover, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                2. Description du service
              </h3>
              <p>
                MiRemover est un service de suppression d'arrière-plan d'images utilisant l'intelligence artificielle. Le service est fourni "tel quel" et peut être modifié à tout moment.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                3. Utilisation du service
              </h3>
              <p>
                Vous vous engagez à :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Ne pas utiliser le service à des fins illégales</li>
                <li>Ne pas télécharger de contenu inapproprié ou offensant</li>
                <li>Ne pas tenter de perturber le service</li>
                <li>Respecter les limites d'utilisation de votre compte</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                4. Propriété intellectuelle
              </h3>
              <p>
                Vous conservez tous les droits sur vos images. En utilisant le service, vous nous accordez le droit de traiter vos images uniquement dans le but de fournir le service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                5. Limitation de responsabilité
              </h3>
              <p>
                Nous ne pouvons garantir que le service sera ininterrompu ou sans erreur. Nous ne sommes pas responsables des pertes ou dommages résultant de l'utilisation du service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                6. Modifications
              </h3>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur dès leur publication sur le site.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}