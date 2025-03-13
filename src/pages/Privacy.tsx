import React, { useEffect } from 'react';
import { Shield, ArrowLeft, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Privacy() {
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
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-200">
                  Politique de confidentialité
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
                    1. Données collectées
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Adresse email (pour l'authentification)</li>
                    <li>Images téléchargées (temporairement)</li>
                    <li>Statistiques d'utilisation anonymes</li>
                    <li>Données de connexion sécurisées</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    2. Utilisation des données
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Fournir le service de suppression d'arrière-plan</li>
                    <li>Améliorer la qualité du service</li>
                    <li>Assurer la sécurité de votre compte</li>
                    <li>Vous contacter si nécessaire</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    3. Protection des données
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Chiffrement de bout en bout</li>
                    <li>Stockage sécurisé en Europe</li>
                    <li>Suppression automatique des images</li>
                    <li>Accès strictement contrôlé</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    4. Vos droits
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Accès à vos données</li>
                    <li>Rectification des informations</li>
                    <li>Suppression du compte</li>
                    <li>Export des données</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    5. Cookies essentiels
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-400">
                    <li>Authentification sécurisée</li>
                    <li>Préférences utilisateur</li>
                    <li>Performance du service</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    6. Contact
                  </h2>
                  <p className="text-gray-400">
                    Pour toute question sur vos données :<br />
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