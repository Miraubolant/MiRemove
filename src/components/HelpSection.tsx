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
        "10MB max par image"
      ]
    },
    {
      icon: Settings2,
      title: "2. Configurez",
      description: "Ajustez les paramètres selon vos besoins",
      tips: [
        "5 modèles d'IA spécialisés",
        "Dimensions personnalisables",
        "Fond blanc optionnel"
      ]
    },
    {
      icon: Wand2,
      title: "3. Traitez",
      description: "L'IA supprime automatiquement l'arrière-plan",
      tips: [
        "Traitement par lots",
        "Haute précision",
        "Prévisualisation instantanée"
      ]
    },
    {
      icon: Download,
      title: "4. Exportez",
      description: "Téléchargez vos images sans fond",
      tips: [
        "Export en JPG avec fond blanc",
        "Zoom et aperçu détaillé",
        "Téléchargement groupé"
      ]
    }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-500">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <Info className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-200">
            Guide rapide
          </h2>
        </div>
        <ChevronDown 
          className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div 
        className={`transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.tips.map((tip, tipIndex) => (
                    <li 
                      key={tipIndex}
                      className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
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