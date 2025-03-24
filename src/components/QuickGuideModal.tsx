import React from 'react';
import { X, Upload, Wand2, Download, Info, Ruler, PaintBucket } from 'lucide-react';

interface QuickGuideModalProps {
  onClose: () => void;
}

export function QuickGuideModal({ onClose }: QuickGuideModalProps) {
  const steps = [
    {
      icon: Upload,
      title: "1. Importez vos images",
      description: "Glissez-déposez ou sélectionnez vos images",
      tips: [
        "Formats supportés : JPG, PNG, WEBP",
        "Importation multiple possible"
      ]
    },
    {
      icon: Ruler,
      title: "2. Configurez",
      description: "Définissez la taille de sortie",
      tips: [
        "Redimensionnement automatique",
        "Dimensions personnalisables"
      ]
    },
    {
      icon: Wand2,
      title: "3. Traitez",
      description: "Suppression de l'arrière-plan",
      tips: [
        "Détection précise des contours",
        "Traitement par lots"
      ]
    },
    {
      icon: PaintBucket,
      title: "4. Personnalisez",
      description: "Ajoutez un fond blanc",
      tips: [
        "Fond transparent par défaut",
        "Application en un clic"
      ]
    },
    {
      icon: Download,
      title: "5. Exportez",
      description: "Téléchargez vos images",
      tips: [
        "Format JPG avec fond blanc",
        "Export groupé"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-3xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Info className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-200">
                  Guide rapide
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Découvrez comment utiliser MiRemover en quelques étapes simples
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg">
                      <step.icon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-200">{step.title}</h3>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {step.tips.map((tip, tipIndex) => (
                      <li 
                        key={tipIndex}
                        className="flex items-center gap-2 text-sm text-gray-400"
                      >
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-200">
                Questions fréquentes
              </h3>
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Comment redimensionner mes images ?
                  </h4>
                  <p className="text-sm text-gray-400">
                    Cliquez sur l'icône règle, activez le redimensionnement et saisissez les dimensions souhaitées.
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Comment ajouter un fond blanc ?
                  </h4>
                  <p className="text-sm text-gray-400">
                    Utilisez le bouton avec l'icône de pinceau pour ajouter ou retirer un fond blanc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}