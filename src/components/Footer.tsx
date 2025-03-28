import React from 'react';
import { Wand2, Coffee, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-8 border-t border-gray-800 relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/90 backdrop-blur-sm" />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`absolute bg-emerald-500/30 rounded-full blur-xl animate-particle-${i + 1}`}
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section principale */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* À propos */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 group">
              <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                {/* Effet de lueur derrière le logo */}
                <div className="absolute inset-0 bg-emerald-500/20 rounded-lg blur-2xl transition-all duration-500"></div>
                
                {/* Conteneur du logo avec effets */}
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 sm:p-3.5 rounded-lg shadow-lg overflow-hidden">
                  {/* Icône avec rotation */}
                  <Wand2 
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Titre et sous-titre avec nouveau style */}
              <div>
                <div className="relative group">
                  <h3 className="text-2xl sm:text-3xl tracking-tight">
                    <span className="text-white">
                      MiRemover
                    </span>
                  </h3>
                  {/* Ligne de soulignement améliorée */}
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-gray-400 leading-relaxed">
                Un outil simple et puissant pour supprimer l'arrière-plan de vos images en quelques clics grâce à l'intelligence artificielle.
              </p>
              <div className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-xl border border-gray-700/30">
                <Shield className="w-5 h-5 text-emerald-500 mt-0.5" />
                <p className="text-sm text-gray-400">
                  Vos images sont traitées instantanément et ne sont jamais stockées sur nos serveurs. Votre confidentialité est notre priorité.
                </p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Soutenez le projet
            </h3>
            <a
              href="https://buymeacoffee.com/victorim"
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-fit"
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-[#FFDD00] to-[#FBB034] rounded-lg transition-all duration-500 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#FFDD00]/25">
                <div className="relative px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Coffee className="w-4 h-4 text-[#0D0C0C] transform group-hover:rotate-12 transition-transform duration-500" />
                    <span className="text-sm font-medium text-[#0D0C0C]">
                      Buy me a coffee
                    </span>
                    <div className="bg-[#0D0C0C] text-white text-xs px-2 py-0.5 rounded">
                      3 €
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Section du bas */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Créé avec</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>par</span>
              <span className="text-emerald-500">Miraubolant</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-emerald-500 transition-colors">
                Politique de confidentialité
              </Link>
              <Link to="/terms" className="hover:text-emerald-500 transition-colors">
                Conditions d'utilisation
              </Link>
              <Link to="/gdpr" className="hover:text-emerald-500 transition-colors">
                RGPD
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}