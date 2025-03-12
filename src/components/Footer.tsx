import React, { useState } from 'react';
import { Wand2, Coffee, Heart } from 'lucide-react';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsOfService } from './TermsOfService';

export function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className="mt-8 border-t border-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/90 backdrop-blur-sm" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 group">
              <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg relative">
                  <Wand2 className="w-6 h-6 text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent transform group-hover:scale-105 transition-transform duration-500">
                MiRemover
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Un outil simple et puissant pour supprimer l'arrière-plan de vos images en quelques clics grâce à l'intelligence artificielle.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-gray-400 hover:text-emerald-500 transition-colors"
              >
                Politique de confidentialité
              </button>
              <button
                onClick={() => setShowTerms(true)}
                className="text-gray-400 hover:text-emerald-500 transition-colors"
              >
                Conditions d'utilisation
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Support
            </h3>
            <a
              href="https://buymeacoffee.com/victorim"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <div className="relative group overflow-hidden bg-[#FFDD00] hover:bg-[#FFDD00]/90 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#FFDD00]/20">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="px-4 py-2 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-gray-900" />
                  <span className="text-sm font-medium text-gray-900">Buy me a coffee</span>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="py-6 border-t border-gray-800">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="font-bold text-gray-400">Créé avec</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="font-bold text-gray-400">par</span>
            <span className="relative group">
              <span className="absolute inset-0 bg-emerald-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent font-medium group-hover:scale-110 transition-transform duration-300 inline-block">
                Miraubolant
              </span>
            </span>
          </div>
        </div>
      </div>

      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
    </footer>
  );
}