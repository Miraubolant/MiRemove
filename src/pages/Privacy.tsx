import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="bg-slate-800/50 rounded-2xl p-8 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-200">
              Politique de confidentialité
            </h1>
          </div>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                1. Collecte des données
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Nous collectons uniquement les données nécessaires au fonctionnement du service :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-400">
                <li>Adresse email (pour l'authentification)</li>
                <li>Images téléchargées (temporairement pour le traitement)</li>
                <li>Statistiques d'utilisation anonymes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                2. Utilisation des données
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-400">
                <li>Fournir le service de suppression d'arrière-plan</li>
                <li>Gérer votre compte et vos préférences</li>
                <li>Améliorer la qualité du service</li>
                <li>Vous contacter en cas de nécessité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                3. Protection des données
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité pour protéger vos données :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-400">
                <li>Chiffrement des données en transit et au repos</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Suppression automatique des images après traitement</li>
                <li>Audits de sécurité réguliers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                4. Vos droits
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-400">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                5. Contact
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Pour toute question concernant vos données personnelles, contactez-nous à :
                <a href="mailto:privacy@miremover.com" className="text-emerald-500 ml-2 hover:underline">
                  privacy@miremover.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}