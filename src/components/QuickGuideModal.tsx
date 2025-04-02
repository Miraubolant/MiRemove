import React, { useState } from 'react';
import { 
  X, Upload, Wand2, Download, Info, ZoomIn, ZoomOut, 
  RotateCcw, SplitSquareVertical, Copy, Maximize2, Timer,
  Image, Trash2, LogIn, Settings2, ChevronLeft, ChevronRight,
  Layers, Scissors, Sparkles, Shield, Eye, Activity, Users,
  Lock, Crown, Star, Check, AlertTriangle, Lightbulb, Gauge
} from 'lucide-react';

interface QuickGuideModalProps {
  onClose: () => void;
}

export function QuickGuideModal({ onClose }: QuickGuideModalProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [animationDirection, setAnimationDirection] = useState('');

  const features = [
    {
      title: "Importation d'images",
      icon: Upload,
      description: "Importez vos images facilement",
      steps: [
        "Glissez-déposez vos images directement",
        "Ou utilisez le bouton d'importation",
        "Formats supportés : JPG, PNG, WEBP",
        "Importation multiple possible"
      ]
    },
    {
      title: "Modes de traitement",
      icon: Layers,
      description: "Différentes options de traitement",
      steps: [
        "Redimensionnement automatique",
        "Suppression d'arrière-plan par IA",
        "Suppression de la tête",
        "Tous les traitements combinés"
      ]
    },
    {
      title: "Prévisualisation avancée",
      icon: Eye,
      description: "Outils de prévisualisation complets",
      steps: [
        "Zoom avant/arrière (Ctrl + Molette)",
        "Déplacement de l'image (Glisser-déposer)",
        "Comparaison avant/après",
        "Vue plein écran"
      ]
    },
    {
      title: "Gestion par lots",
      icon: Activity,
      description: "Traitement efficace de plusieurs images",
      steps: [
        "Sélection multiple d'images",
        "Traitement par lots automatique",
        "File d'attente intelligente",
        "Statistiques en temps réel"
      ]
    }
  ];

  const tools = [
    {
      icon: Maximize2,
      name: "Redimensionnement",
      description: "Ajuster la taille des images",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Wand2,
      name: "Traitement IA",
      description: "Supprimer l'arrière-plan",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Scissors,
      name: "Suppression tête",
      description: "Recadrer sous le menton",
      color: "text-red-400",
      bgColor: "bg-red-500/10"
    },
    {
      icon: Sparkles,
      name: "Tous les traitements",
      description: "Appliquer tous les traitements",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10"
    },
    {
      icon: Eye,
      name: "Prévisualisation",
      description: "Comparer avant/après",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: Download,
      name: "Exportation",
      description: "Télécharger en JPG/PNG",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Timer,
      name: "File d'attente",
      description: "Traitement par lots",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Activity,
      name: "Statistiques",
      description: "Suivi des performances",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    }
  ];

  const tips = [
    {
      icon: Lightbulb,
      title: "Optimisation des images",
      description: "Pour de meilleurs résultats",
      advice: [
        "Utilisez des images de bonne qualité",
        "Évitez les images floues ou pixelisées",
        "Préférez un éclairage uniforme",
        "Assurez un bon contraste avec l'arrière-plan"
      ]
    },
    {
      icon: Gauge,
      title: "Performance",
      description: "Conseils pour un traitement efficace",
      advice: [
        "Traitez les images par lots",
        "Utilisez le mode approprié",
        "Redimensionnez avant l'IA si possible",
        "Surveillez vos statistiques"
      ]
    },
    {
      icon: Shield,
      title: "Bonnes pratiques",
      description: "Pour une utilisation optimale",
      advice: [
        "Sauvegardez vos images originales",
        "Vérifiez les résultats avant export",
        "Utilisez les prévisualisations",
        "Gérez bien votre quota d'images"
      ]
    }
  ];

  const sections = ["Fonctionnalités", "Outils", "Conseils"];

  const handleNavigation = (direction) => {
    setAnimationDirection(direction);
    
    setTimeout(() => {
      if (direction === 'next') {
        setActiveSection((prev) => (prev === sections.length - 1 ? 0 : prev + 1));
      } else {
        setActiveSection((prev) => (prev === 0 ? sections.length - 1 : prev - 1));
      }
    }, 300);
    
    setTimeout(() => {
      setAnimationDirection('');
    }, 600);
  };

  const renderSection = () => {
    switch(activeSection) {
      case 0:
        return (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-500 ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-900 rounded-xl p-4 border border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-500/20 p-2.5 rounded-lg group-hover:bg-emerald-500/30 transition-all duration-300 transform group-hover:scale-110">
                    <feature.icon className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100 text-base group-hover:text-white transition-colors">{feature.title}</h3>
                    <p className="text-xs text-gray-400 group-hover:text-gray-300">{feature.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {feature.steps.map((step, stepIndex) => (
                    <li 
                      key={stepIndex}
                      className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-gray-300"
                      style={{ animationDelay: `${(index * 100) + (stepIndex * 50)}ms` }}
                    >
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full group-hover:scale-125 transition-all duration-300" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      case 1:
        return (
          <div className={`transition-all duration-500 ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tools.map((tool, index) => (
                <div 
                  key={index}
                  className="bg-slate-900 rounded-xl p-4 border border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`${tool.bgColor} p-2.5 rounded-full group-hover:scale-110 transition-all duration-300`}>
                      <tool.icon className={`w-5 h-5 ${tool.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-200 group-hover:text-white text-sm mb-1">{tool.name}</p>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300">{tool.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-500 ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            {tips.map((tip, index) => (
              <div 
                key={index}
                className="bg-slate-900 rounded-xl p-4 border border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-500/20 p-2.5 rounded-lg group-hover:bg-emerald-500/30 transition-all duration-300">
                    <tip.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200 group-hover:text-white text-sm">{tip.title}</h3>
                    <p className="text-xs text-gray-400">{tip.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {tip.advice.map((item, itemIndex) => (
                    <li 
                      key={itemIndex}
                      className="flex items-center gap-2 text-xs text-gray-400 group-hover:text-gray-300"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-emerald-500/5 border border-gray-800/30 w-full max-w-4xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl bg-slate-900 p-6 border-b border-gray-800/30">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <Info className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Guide rapide
                </h2>
                <p className="text-gray-400 mt-1">
                  Découvrez toutes les fonctionnalités de MiRemover
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-700/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center p-4 bg-slate-900 border-b border-gray-800/30">
          <div className="flex space-x-2 bg-slate-800 p-1 rounded-lg border border-gray-800/30">
            {sections.map((section, index) => (
              <button
                key={section}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeSection === index
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
                onClick={() => setActiveSection(index)}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-hidden relative bg-slate-900">
          <div className="overflow-hidden">
            {renderSection()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => handleNavigation('prev')}
              className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-gray-300 px-4 py-2 rounded-lg transition-colors border border-gray-700/30"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>
            
            <div className="flex space-x-2">
              {sections.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeSection === index 
                      ? 'bg-emerald-500 scale-125' 
                      : 'bg-gray-600'
                  }`}
                  onClick={() => setActiveSection(index)}
                />
              ))}
            </div>
            
            <button
              onClick={() => handleNavigation('next')}
              className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-gray-300 px-4 py-2 rounded-lg transition-colors border border-gray-700/30"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 p-4 rounded-b-2xl border-t border-gray-800/30 text-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-6 py-2 rounded-lg transition-all duration-300 font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}