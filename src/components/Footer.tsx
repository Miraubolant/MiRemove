import React from 'react';
import { Wand2, Github, Coffee, Heart, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-8 border-t border-olive/10 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-olive to-sage dark:from-emerald-600 dark:to-emerald-500 p-2 rounded-lg">
                <Wand2 className="w-5 h-5 text-cream" />
              </div>
              <h3 className="text-lg font-semibold text-olive dark:text-gray-200">
                MiRemover
              </h3>
            </div>
            <p className="text-sm text-olive-light dark:text-gray-400">
              Un outil simple et puissant pour supprimer l'arrière-plan de vos images en quelques clics grâce à l'intelligence artificielle.
            </p>
            <div className="flex items-center gap-2 text-sm text-olive-light dark:text-gray-400">
              <Shield className="w-4 h-4 text-olive dark:text-emerald-500" />
              <p>Vos photos ne sont jamais stockées sur nos serveurs</p>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-olive-light dark:text-gray-400">
              Fonctionnalités
            </h3>
            <ul className="space-y-2 text-sm text-olive-light dark:text-gray-400">
              <li>✨ Suppression d'arrière-plan IA</li>
              <li>🎨 Personnalisation du fond</li>
              <li>📱 Compatible mobile</li>
              <li>🚀 Traitement rapide</li>
            </ul>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-olive-light dark:text-gray-400">
              Liens
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/victormirault"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-2"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.buymeacoffee.com/victormirault"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-2"
              >
                <Coffee className="w-4 h-4" />
                <span>Buy me a coffee</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-olive/10 dark:border-gray-800">
          <div className="flex items-center justify-center gap-2 text-sm text-olive-light dark:text-gray-400">
            <span>Créé avec</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span>par</span>
            <a
              href="https://victormirault.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-olive dark:text-emerald-500 hover:underline"
            >
              Victor Mirault
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}