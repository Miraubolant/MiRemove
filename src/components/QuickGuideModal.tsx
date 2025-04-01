import React, { useState, useEffect } from 'react';
import { 
  X, Upload, Wand2, Download, Info, ZoomIn, ZoomOut, 
  RotateCcw, SplitSquareVertical, Copy, Maximize2, Timer,
  Image, Trash2, LogIn, Settings2, ChevronLeft, ChevronRight,
  Scissors, Sparkles, Layers
} from 'lucide-react';

interface QuickGuideModalProps {
  onClose: () => void;
}

const sections = [
  {
    id: 1,
    title: "Types de traitement",
    icon: Layers,
    description: "Découvrez les différents types de traitement disponibles",
    items: [
      {
        icon: Maximize2,
        name: "Redimensionnement",
        description: "Ajustez la taille de vos images tout en conservant les proportions"
      },
      {
        icon: Wand2,
        name: "Traitement IA",
        description: "Supprimez l'arrière-plan avec notre IA avancée"
      },
      {
        icon: Scissors,
        name: "Suppression tête",
        description: "Recadrez automatiquement sous le menton"
      },
      {
        icon: Sparkles,
        name: "Tous les traitements",
        description: "Appliquez tous les traitements en une seule fois"
      }
    ]
  },
  {
    id: 2,
    title: "Importation d'images",
    icon: Upload,
    description: "Importez vos images facilement",
    items: [
      "Glissez-déposez vos images directement",
      "Ou utilisez le bouton d'importation",
      "Formats supportés : JPG, PNG, WEBP",
      "Importation multiple possible"
    ]
  },
  {
    id: 3,
    title: "Prévisualisation avancée",
    icon: ZoomIn,
    description: "Outils de prévisualisation complets",
    items: [
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

export function QuickGuideModal({ onClose }: QuickGuideModalProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [animationDirection, setAnimationDirection] = useState('');

  useEffect(() => {
    sessionStorage.setItem('seen-legal', 'true');
    
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  const handleNavigation = (direction: 'next' | 'prev') => {
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
    const section = sections[activeSection];
    
    return (
      <div className={`transition-all duration-500 ${
        animationDirection === 'next' ? 'translate-x-full opacity-0' : 
        animationDirection === 'prev' ? '-translate-x-full opacity-0' : 
        'translate-x-0 opacity-100'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-500/10 p-3 rounded-xl">
            <section.icon className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200">{section.title}</h3>
            <p className="text-sm text-gray-400">{section.description}</p>
          </div>
        </div>

        {Array.isArray(section.items) && typeof section.items[0] === 'string' ? (
          <ul className="space-y-4">
            {section.items.map((item, index) => (
              <li 
                key={index}
                className="flex items-center gap-3 text-gray-300"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.items.map((item: any, index) => (
              <div 
                key={index}
                className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <item.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="font-medium text-gray-200">{item.name}</h4>
                </div>
                <p className="text-sm text-gray-400 ml-11">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-3 rounded-xl">
                <Info className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-200">Guide rapide</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Découvrez toutes les fonctionnalités de MiRemover
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderSection()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex justify-between items-center">
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
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSection === index 
                      ? 'bg-emerald-500 scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
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
      </div>
    </div>
  );
}