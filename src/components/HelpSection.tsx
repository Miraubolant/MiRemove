import React from 'react';
import { Info, Upload, Wand2, Download, Palette } from 'lucide-react';

export function HelpSection() {
  return (
    <div className="bg-cream-dark/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-olive/10 dark:bg-emerald-500/10 p-2 rounded-lg">
            <Info className="w-6 h-6 text-olive dark:text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-olive dark:text-gray-200">
            Comment ça marche ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-cream/50 dark:bg-slate-800/50 p-6 rounded-xl">
            <div className="bg-olive/10 dark:bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-olive dark:text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-olive dark:text-gray-200 mb-2">1. Importez vos images</h3>
            <p className="text-olive-light dark:text-gray-400">
              Glissez-déposez vos images ou cliquez pour les sélectionner. Formats supportés : JPG, PNG, WEBP
            </p>
          </div>

          <div className="bg-cream/50 dark:bg-slate-800/50 p-6 rounded-xl">
            <div className="bg-olive/10 dark:bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Wand2 className="w-6 h-6 text-olive dark:text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-olive dark:text-gray-200 mb-2">2. Sélectionnez le modèle</h3>
            <p className="text-olive-light dark:text-gray-400">
              Choisissez le modèle d'IA le plus adapté à vos images pour un résultat optimal
            </p>
          </div>

          <div className="bg-cream/50 dark:bg-slate-800/50 p-6 rounded-xl">
            <div className="bg-olive/10 dark:bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-olive dark:text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-olive dark:text-gray-200 mb-2">3. Personnalisez</h3>
            <p className="text-olive-light dark:text-gray-400">
              Ajustez la couleur de fond selon vos besoins après le traitement
            </p>
          </div>

          <div className="bg-cream/50 dark:bg-slate-800/50 p-6 rounded-xl">
            <div className="bg-olive/10 dark:bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-olive dark:text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-olive dark:text-gray-200 mb-2">4. Téléchargez</h3>
            <p className="text-olive-light dark:text-gray-400">
              Téléchargez vos images sans fond au format PNG avec transparence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}