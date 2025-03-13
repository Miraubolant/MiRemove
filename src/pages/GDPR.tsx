import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function GDPR() {
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
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-200">
              Conformité RGPD
            </h1>
          </div>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                1. Base légale du traitement
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Nous traitons vos données personnelles sur les bases légales suivantes :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-400">
                <li>Votre consentement explicite</li>
                <li>L'exécution du contrat de service</li>
                <li>Nos obligations légales</li>
                <li>Nos intérêts légitimes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                2. Données collectées
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Les données personnelles que nous collectons incluent :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-400">
                <li>Adresse email</li>
                <li>Images téléchargées (temporairement)</li>
                <li>Données de connexion</li>
                <li>Préférences d'utilisation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                3. Durée de conservation
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Nous conservons vos données selon les durées suivantes :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-400">
                <li>Données de compte : jusqu'à la suppression du compte</li>
                <li>Images : supprimées après traitement</li>
                <li>Logs de connexion : 1 an</li>
                <li>Données de facturation : 10 ans (obligation légale)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                4. Vos droits RGPD
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement ("droit à l'oubli")</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition</li>
                <li>Droit de retirer votre consentement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                5. Exercer vos droits
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Pour exercer vos droits RGPD, vous pouvez :
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-400">
                <li>Utiliser les paramètres de votre compte</li>
                <li>Contacter notre DPO par email</li>
                <li>Envoyer une demande écrite à notre adresse postale</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                6. Transferts de données
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Vos données sont hébergées dans l'Union Européenne. Si un transfert hors UE est nécessaire, nous nous assurons qu'il est encadré par les garanties appropriées conformément au RGPD.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-200 mb-4">
                7. Contact DPO
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Notre Délégué à la Protection des Données est joignable à :
                <a href="mailto:dpo@miremover.com" className="text-emerald-500 ml-2 hover:underline">
                  dpo@miremover.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}