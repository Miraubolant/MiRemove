import React, { useState } from 'react';
import { Info, Upload, Wand2, Download, ChevronDown, Settings2, Sparkles, Maximize2, PaintBucket } from 'lucide-react';

export function HelpSection() {
  const [isExpanded, setIsExpanded] = useState(true);

  const features = [
    {
      icon: Upload,
      title: "1. Importez vos images",
      description: "Glissez-déposez ou sélectionnez vos images",
      tips: [
        "Formats : JPG, PNG, WEBP",
        "Importation multiple",
        "Compression automatique",
        "Redimensionnement intelligent"
      ]
    },
    {
      icon: Settings2,
      title: "2. Configurez",
      description: "Choisissez votre niveau de qualité",
      tips: [
        "MiRemover Max - Qualité maximale",
        "MiRemover Pro - Optimisé mode",
        "MiRemover Plus - Polyvalent",
        "MiRemover Light - Ultra rapide"
      ]
    },
    {
      icon: Wand2,
      title: "3. Traitez",
      description: "L'IA supprime automatiquement l'arrière-plan",
      tips: [
        "Traitement par lots",
        "Haute précision",
        "Prévisualisation instantanée",
        "Comparaison avant/après"
      ]
    },
    {
      icon: Download,
      title: "4. Exportez",
      description: "Téléchargez vos images sans fond",
      tips: [
        "Export PNG transparent",
        "Export JPG avec fond blanc",
        "Zoom et aperçu détaillé",
        "Téléchargement groupé"
      ]
    }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-500">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-200">
            Guide rapide
          </h2>
        </div>
        <ChevronDown 
          className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div 
        className={`transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="bg-emerald-500/10 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.tips.map((tip, tipIndex) => (
                    <li 
                      key={tipIndex}
                      className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
                    >
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full group-hover:scale-125 transition-transform duration-300" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}