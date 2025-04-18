import React, { useState } from 'react';
import { 
  X, Upload, Wand2, Download, Info, ZoomIn, ZoomOut, 
  RotateCcw, SplitSquareVertical, Copy, Maximize2, Timer,
  Image, Trash2, LogIn, Settings2, ChevronLeft, ChevronRight,
  Layers, Scissors, Sparkles, Shield, Eye, Activity, Users,
  Lock, Crown, Star, Check, AlertTriangle, Lightbulb, Gauge,
  Monitor, Cpu, Zap, Wifi
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
    },
    {
      title: "Version Desktop",
      icon: Monitor,
      description: "Avantages de la version locale",
      steps: [
        "Traitement plus rapide en local",
        "Interface identique à la version web",
        "Connexion internet toujours requise",
        "Synchronisation avec votre compte"
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

  const desktop = [
    {
      icon: Cpu,
      title: "Traitement local",
      description: "Utilise les ressources de votre ordinateur",
      details: [
        "Utilise le processeur et la RAM de votre machine",
        "Réduction de la latence du traitement",
        "Performance accrue pour les lots volumineux",
        "Économie de bande passante"
      ]
    },
    {
      icon: Zap,
      title: "Performance améliorée",
      description: "Vitesse et efficacité accrues",
      details: [
        "Jusqu'à 3x plus rapide que la version web",
        "Traitement en arrière-plan possible",
        "Optimisé pour les processeurs multicœurs",
        "Prise en charge des cartes graphiques"
      ]
    },
    {
      icon: Wifi,
      title: "Connectivité",
      description: "Internet toujours nécessaire",
      details: [
        "Connexion requise pour les statistiques",
        "Modèle de redimmensionnement hébergé localement",
        "Synchronisation des paramètres avec le cloud",
        "Mises à jour automatiques"
      ]
    }
  ];

  const sections = ["Fonctionnalités", "Outils", "Conseils", "Desktop"];

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
          <div className={`transition-all duration-500 ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            <div className="grid grid-cols-5 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-slate-900 rounded-xl p-4 border border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl group h-full flex flex-col"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-emerald-500/20 p-2.5 rounded-full group-hover:bg-emerald-500/30 transition-all duration-300 transform group-hover:scale-110 border border-emerald-500/30 shadow-lg">
                      <feature.icon className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-100 text-base group-hover:text-white transition-colors tracking-tight">{feature.title}</h3>
                      <p className="text-xs text-emerald-400/80 font-medium">{feature.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 ml-1 mt-auto">
                    {feature.steps.map((step, stepIndex) => (
                      <li 
                        key={stepIndex}
                        className="flex items-center gap-2 text-xs text-gray-300 group-hover:text-white"
                      >
                        <span className="flex-shrink-0 w-1.5 h-1.5 bg-emerald-500 rounded-full group-hover:scale-125 transition-all duration-300" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className={`transition-all duration-500 min-h-[320px] ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            <div className="grid grid-cols-4 gap-4">
              {tools.map((tool, index) => (
                <div 
                  key={index}
                  className="bg-slate-900 rounded-xl p-4 border border-gray-700/30 hover:border-slate-600 transition-all duration-300 hover:shadow-xl group transform hover:-translate-y-1 h-full"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col items-center text-center gap-3 h-full">
                    <div className={`${tool.bgColor} p-3 rounded-full group-hover:scale-110 transition-all duration-300 border border-slate-700/50`}>
                      <tool.icon className={`w-6 h-6 ${tool.color}`} />
                    </div>
                    <div className="mt-auto">
                      <p className="font-semibold text-gray-200 group-hover:text-white text-base mb-1">{tool.name}</p>
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
          <div className={`transition-all duration-500 min-h-[320px] ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            <div className="grid grid-cols-3 gap-4">
              {tips.map((tip, index) => (
                <div 
                  key={index}
                  className="bg-slate-900 rounded-xl p-4 border border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl group h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-emerald-500/20 p-2.5 rounded-full group-hover:bg-emerald-500/30 transition-all duration-300 border border-emerald-500/30 shadow-lg">
                      <tip.icon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200 group-hover:text-white text-base">{tip.title}</h3>
                      <p className="text-xs text-emerald-400/80 font-medium">{tip.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 pl-1">
                    {tip.advice.map((item, itemIndex) => (
                      <li 
                        key={itemIndex}
                        className="flex items-center gap-2 text-xs text-gray-300 group-hover:text-white"
                      >
                        <div className="flex-shrink-0 bg-emerald-500/20 p-1 rounded-full">
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className={`transition-all duration-500 min-h-[320px] ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            <div className="grid grid-cols-3 gap-4">
              {desktop.map((item, index) => (
                <div 
                  key={index}
                  className="bg-slate-900 rounded-xl p-4 border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl group h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-500/20 p-2.5 rounded-full group-hover:bg-blue-500/30 transition-all duration-300 border border-blue-500/30 shadow-lg">
                      <item.icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200 group-hover:text-white text-base">{item.title}</h3>
                      <p className="text-xs text-blue-400/80 font-medium">{item.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 pl-1">
                    {item.details.map((detail, detailIndex) => (
                      <li 
                        key={detailIndex}
                        className="flex items-center gap-2 text-xs text-gray-300 group-hover:text-white"
                      >
                        <div className="flex-shrink-0 bg-blue-500/20 p-1 rounded-full">
                          <Check className="w-3 h-3 text-blue-500" />
                        </div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800/50 w-full max-w-6xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl bg-slate-900 p-5 border-b border-slate-800/50">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-full border border-emerald-500/30 shadow-lg">
                <Info className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Interface MiRemover
                </h2>
                <p className="text-emerald-400 mt-0.5 font-medium text-sm">
                  Maîtrisez l'application en quelques minutes
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 text-gray-400 hover:text-emerald-500 bg-slate-800 hover:bg-slate-800 rounded-full transition-all duration-300 border border-slate-700/50 shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center p-4 bg-slate-900 border-b border-slate-800/50">
          <div className="flex space-x-2 bg-slate-800 p-1.5 rounded-full border border-slate-700/50 shadow-md">
            {sections.map((section, index) => (
              <button
                key={section}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeSection === index
                    ? index === 3 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700'
                }`}
                onClick={() => setActiveSection(index)}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Fixed Height Container */}
        <div className="p-5 overflow-hidden relative bg-slate-900">
          <div className="overflow-hidden min-h-[320px]">
            {renderSection()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => handleNavigation('prev')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-gray-300 px-4 py-2 rounded-lg transition-all duration-300 border border-slate-700/50 shadow-md hover:shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>
            
            <div className="flex space-x-3 items-center">
              {sections.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSection === index 
                      ? activeSection === 3
                        ? 'bg-blue-500 scale-125'
                        : 'bg-emerald-500 scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  onClick={() => setActiveSection(index)}
                />
              ))}
            </div>
            
            <button
              onClick={() => handleNavigation('next')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-gray-300 px-4 py-2 rounded-lg transition-all duration-300 border border-slate-700/50 shadow-md hover:shadow-lg"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 p-4 rounded-b-2xl border-t border-slate-800/50 text-center">
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg transition-all duration-300 font-bold text-sm shadow-lg transform hover:-translate-y-1 focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}