import React, { useState } from 'react';
import { 
  X, Upload, Wand2, Download, Info, ZoomIn, ZoomOut, 
  RotateCcw, SplitSquareVertical, Copy, Maximize2, Timer,
  Image, Trash2, LogIn, Settings2, ChevronLeft, ChevronRight
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
      title: "Traitement IA",
      icon: Wand2,
      description: "Suppression intelligente de l'arrière-plan",
      steps: [
        "Détection précise des contours",
        "Préservation des détails",
        "Traitement par lots possible",
        "Qualité optimale garantie"
      ]
    },
    {
      title: "Redimensionnement",
      icon: Maximize2,
      description: "Options de redimensionnement avancées",
      steps: [
        "Redimensionnement automatique",
        "Préservation des proportions",
        "Dimensions personnalisables",
        "Qualité optimale préservée"
      ]
    },
    {
      title: "Prévisualisation avancée",
      icon: ZoomIn,
      description: "Outils de prévisualisation complets",
      steps: [
        "Zoom avant/arrière (Ctrl + Molette)",
        "Déplacement de l'image (Glisser-déposer)",
        "Comparaison avant/après",
        "Vue plein écran"
      ]
    }
  ];

  const tools = [
    {
      icon: ZoomIn,
      name: "Zoom avant",
      description: "Agrandir l'image"
    },
    {
      icon: ZoomOut,
      name: "Zoom arrière",
      description: "Réduire l'image"
    },
    {
      icon: RotateCcw,
      name: "Réinitialiser",
      description: "Rétablir la vue initiale"
    },
    {
      icon: SplitSquareVertical,
      name: "Comparaison",
      description: "Comparer avant/après"
    },
    {
      icon: Copy,
      name: "Copier",
      description: "Copier l'image"
    },
    {
      icon: Download,
      name: "Télécharger",
      description: "Télécharger l'image"
    },
    {
      icon: Timer,
      name: "Traitement par lots",
      description: "Traiter plusieurs images"
    },
    {
      icon: Trash2,
      name: "Supprimer",
      description: "Supprimer les images"
    }
  ];

  const tips = [
    {
      icon: LogIn,
      title: "Compte utilisateur",
      description: "Connectez-vous pour profiter de plus d'images et de fonctionnalités"
    },
    {
      icon: Settings2,
      title: "Paramètres",
      description: "Personnalisez les options de traitement selon vos besoins"
    },
    {
      icon: Image,
      title: "Formats supportés",
      description: "JPG, PNG et WEBP sont pris en charge"
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
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-500 ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-900 rounded-xl p-6 border border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-emerald-500/20 p-3 rounded-lg group-hover:bg-emerald-500/30 transition-all duration-300 transform group-hover:scale-110">
                    <feature.icon className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100 text-lg group-hover:text-white transition-colors">{feature.title}</h3>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">{feature.description}</p>
                  </div>
                </div>
                <ul className="space-y-2.5 mt-5">
                  {feature.steps.map((step, stepIndex) => (
                    <li 
                      key={stepIndex}
                      className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300"
                      style={{ animationDelay: `${(index * 100) + (stepIndex * 50)}ms` }}
                    >
                      <span className="w-2 h-2 bg-emerald-500 rounded-full group-hover:scale-125 transition-all duration-300" />
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
                  className="bg-slate-900 rounded-xl p-5 border border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="bg-emerald-500/20 p-3 rounded-full group-hover:bg-emerald-500/30 transition-all duration-300 transform group-hover:scale-110">
                      <tool.icon className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-200 group-hover:text-white mb-1">{tool.name}</p>
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
          <div className={`space-y-5 transition-all duration-500 ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            {tips.map((tip, index) => (
              <div 
                key={index}
                className="bg-slate-900 rounded-xl p-5 border border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/20 p-3 rounded-lg group-hover:bg-emerald-500/30 transition-all duration-300 transform group-hover:scale-110">
                    <tip.icon className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-200 group-hover:text-white">{tip.title}</p>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">{tip.description}</p>
                  </div>
                </div>
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
      <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-emerald-500/5 border border-gray-800/30 w-full max-w-5xl animate-in zoom-in-95 duration-300">
        {/* Header avec fond unifié */}
        <div className="relative overflow-hidden rounded-t-2xl bg-slate-900 p-8 border-b border-gray-800/30">
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

        {/* Tabs Navigation avec fond unifié */}
        <div className="flex justify-center p-4 bg-slate-900 border-b border-gray-800/30">
          <div className="flex space-x-2 bg-slate-800 p-1 rounded-lg border border-gray-800/30">
            {sections.map((section, index) => (
              <button
                key={section}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
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

        {/* Main Content avec fond unifié */}
        <div className="p-8 overflow-hidden relative bg-slate-900">
          <div className="overflow-hidden">
            {renderSection()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => handleNavigation('prev')}
              className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-gray-300 px-5 py-2.5 rounded-lg transition-colors border border-gray-700/30"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>
            
            <div className="flex space-x-2">
              {sections.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
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
              className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-gray-300 px-5 py-2.5 rounded-lg transition-colors border border-gray-700/30"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer avec fond unifié */}
        <div className="bg-slate-900 p-6 rounded-b-2xl border-t border-gray-800/30 text-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}