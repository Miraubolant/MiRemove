import React, { useEffect } from 'react';
import { FileText, ArrowLeft, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function GDPR() {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem('seen-legal', 'true');
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <FileText className="w-6 h-6 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-200">
                  Conformité RGPD
                </h1>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-300 transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    1. Bases légales
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Votre consentement explicite</li>
                    <li>Exécution de nos services</li>
                    <li>Obligations réglementaires</li>
                    <li>Intérêts légitimes</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    2. Vos droits garantis
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Accès complet</li>
                    <li>Correction immédiate</li>
                    <li>Suppression définitive</li>
                    <li>Portabilité simplifiée</li>
                    <li>Opposition possible</li>
                    <li>Traitement limité</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    3. Conservation
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Compte : jusqu'à suppression</li>
                    <li>Images : effacées après usage</li>
                    <li>Logs : 12 mois maximum</li>
                    <li>Backups : 30 jours</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    4. Sécurité des données
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Hébergement européen</li>
                    <li>Aucun transfert hors UE</li>
                    <li>Partenaires conformes</li>
                    <li>Protection renforcée</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    5. Exercer vos droits
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Contact direct DPO</li>
                    <li>Réponse sous 30 jours</li>
                    <li>Processus simplifié</li>
                    <li>Identité vérifiée</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    6. Délégué à la Protection
                  </h2>
                  <p className="text-gray-400">
                    Notre DPO est à votre écoute :<br />
                    <a href="mailto:contact@miraubolant.com" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                      contact@miraubolant.com
                    </a>
                  </p>
                </section>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="text-gray-400 hover:text-emerald-500 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}