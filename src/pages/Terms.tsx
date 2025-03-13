import React, { useEffect } from 'react';
import { ScrollText, ArrowLeft, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Terms() {
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
                  <ScrollText className="w-6 h-6 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-200">
                  Conditions d'utilisation
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
                    1. Notre service
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Suppression d'arrière-plan par IA</li>
                    <li>Traitement haute qualité</li>
                    <li>Export PNG/JPG optimisé</li>
                    <li>Stockage temporaire sécurisé</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    2. Règles d'utilisation
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Usage légal uniquement</li>
                    <li>Pas de surcharge du service</li>
                    <li>Contenu approprié</li>
                    <li>Respect des droits d'auteur</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    3. Votre compte
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Un compte par personne</li>
                    <li>Informations véridiques</li>
                    <li>Sécurité des accès</li>
                    <li>Respect des quotas</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    4. Propriété et droits
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Vos images restent vôtres</li>
                    <li>Service protégé</li>
                    <li>Usage personnel</li>
                    <li>Pas de copie du service</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    5. Mises à jour
                  </h2>
                  <p className="text-gray-400">
                    Les conditions peuvent évoluer. Les changements prennent effet immédiatement.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    6. Contact
                  </h2>
                  <p className="text-gray-400">
                    Questions ou suggestions :<br />
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