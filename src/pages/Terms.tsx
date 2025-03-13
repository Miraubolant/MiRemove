import React from 'react';
import { ScrollText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Terms() {
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
              <ScrollText className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-200">
              Conditions d'utilisation
            </h1>
          </div>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                1. Acceptation des conditions
              </h2>
              <p className="text-gray-400 leading-relaxed">
                En utilisant MiRemover, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                2. Description du service
              </h2>
              <p className="text-gray-400 leading-relaxed">
                MiRemover est un service de suppression d'arrière-plan d'images utilisant l'intelligence artificielle. Le service est fourni "tel quel" et nous ne garantissons pas que le service sera ininterrompu ou sans erreur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                3. Utilisation du service
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li>Ne pas utiliser le service à des fins illégales</li>
                <li>Ne pas télécharger de contenu inapproprié ou offensant</li>
                <li>Ne pas tenter de perturber le fonctionnement du service</li>
                <li>Respecter les limites d'utilisation de votre compte</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                4. Propriété intellectuelle
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Vous conservez tous les droits sur les images que vous téléchargez. En utilisant le service, vous nous accordez le droit de traiter vos images pour fournir le service. Nous ne revendiquons aucun droit sur vos images.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                5. Limitation de responsabilité
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Nous ne sommes pas responsables des dommages directs ou indirects résultant de l'utilisation du service. Notre responsabilité est limitée au montant que vous avez payé pour le service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                6. Modifications
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur dès leur publication. Votre utilisation continue du service après toute modification constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                7. Contact
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Pour toute question concernant ces conditions, contactez-nous à :
                <a href="mailto:terms@miremover.com" className="text-emerald-500 ml-2 hover:underline">
                  terms@miremover.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}