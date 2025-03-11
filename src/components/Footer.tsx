import React from 'react';
import { Wand2, Coffee, Heart, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section principale */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* À propos */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-xl"></div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg relative">
                  <Wand2 className="w-6 h-6 text-white transform -rotate-45" />
                </div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                MiRemover
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Un outil simple et puissant pour supprimer l'arrière-plan de vos images en quelques clics grâce à l'intelligence artificielle.
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-400 bg-slate-800/50 p-4 rounded-xl border border-gray-700/50">
              <Shield className="w-5 h-5 text-emerald-500" />
              <p>Vos photos ne sont jamais stockées sur nos serveurs</p>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Fonctionnalités
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-gray-700/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-300">Suppression d'arrière-plan IA</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-gray-700/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-300">Personnalisation du fond</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-gray-700/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-300">Compatible mobile</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-gray-700/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-300">Traitement rapide</span>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Support
            </h3>
            <div>
              <a
                href="https://buymeacoffee.com/victorim"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block"
              >
                {/* Bouton principal avec animation de hover */}
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25">
                  {/* Effet de particules */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30 animate-particle-1"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30 animate-particle-2"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30 animate-particle-3"></div>
                  </div>

                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                  {/* Contenu du bouton */}
                  <div className="relative px-6 py-3">
                    <div className="flex items-center justify-center gap-3">
                      {/* Icône avec animation */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Coffee className="w-5 h-5 text-white transform group-hover:rotate-12 transition-transform duration-500" />
                      </div>
                      {/* Texte avec animation */}
                      <span className="text-white font-medium transform group-hover:scale-105 transition-transform duration-500">
                        Buy me a coffee
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Section du bas */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <span>Créé avec</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span>par</span>
            <a
              href="https://victormirault.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Victor Mirault
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}