import React, { useState } from 'react';
import { Info, Upload, Wand2, Download, Palette, ChevronDown, Zap, Shield, Sparkles } from 'lucide-react';

export function HelpSection() {
  const [isExpanded, setIsExpanded] = useState(true);

  const features = [
    {
      icon: Upload,
      title: "1. Importez vos images",
      description: "Glissez-déposez vos images ou utilisez le sélecteur de fichiers. Compatible avec JPG, PNG et WEBP.",
      tips: ["Importez plusieurs images à la fois", "Taille maximale : 10MB par image"]
    },
    {
      icon: Wand2,
      title: "2. Sélectionnez le modèle",
      description: "Choisissez le modèle d'IA adapté à vos besoins pour des résultats optimaux.",
      tips: ["Silueta : parfait pour les portraits et vêtements", "U2Net : idéal pour les objets"]
    },
    {
      icon: Palette,
      title: "3. Personnalisez",
      description: "Ajustez la couleur d'arrière-plan selon vos préférences après le traitement.",
      tips: ["Fond transparent par défaut", "Couleurs prédéfinies disponibles"]
    },
    {
      icon: Download,
      title: "4. Téléchargez",
      description: "Récupérez vos images sans fond au format PNG haute qualité.",
      tips: ["Conserve la transparence", "Qualité d'origine préservée"]
    }
  ];

  const highlights = [
    {
      icon: Zap,
      title: "Traitement rapide",
      description: "Suppression d'arrière-plan en quelques secondes"
    },
    {
      icon: Shield,
      title: "Sécurisé",
      description: "Vos images ne sont jamais stockées"
    },
    {
      icon: Sparkles,
      title: "Haute qualité",
      description: "Résultats professionnels garantis"
    }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <Info className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-200">
            Guide d'utilisation
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
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-6 pt-0">
          {/* Highlights */}
          <div className="flex flex-wrap gap-4 mb-8">
            {highlights.map((highlight, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-4 flex-1 min-w-[250px]"
              >
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <highlight.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-200">{highlight.title}</h4>
                  <p className="text-sm text-gray-400">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-colors duration-300"
              >
                <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
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
                      className="flex items-center gap-2 text-xs text-gray-400"
                    >
                      <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
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