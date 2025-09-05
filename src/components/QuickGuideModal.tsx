import React, { useState } from 'react';
import { 
  X, Upload, Wand2, Download, Info, ZoomIn, ZoomOut, 
  RotateCcw, SplitSquareVertical, Copy, Maximize2, Timer,
  Image, Trash2, LogIn, Settings2, ChevronLeft, ChevronRight,
  Layers, Scissors, Sparkles, Shield, Eye, Activity, Users,
  Lock, Crown, Star, Check, AlertTriangle, Lightbulb, Gauge,
  Monitor, Cpu, Zap, Wifi, RefreshCw
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
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-3 rounded-xl border border-emerald-500/30">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Fonctionnalités Principales</h3>
                  <p className="text-gray-400 text-sm">Découvrez les outils essentiels de MiRemover</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/60 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-gradient-to-br from-emerald-500/20 via-emerald-500/30 to-emerald-400/20 p-3 rounded-xl group-hover:scale-110 transition-all duration-300 border border-emerald-500/30 shadow-lg">
                      <feature.icon className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg group-hover:text-emerald-100 transition-colors tracking-tight mb-1">{feature.title}</h4>
                      <p className="text-sm text-emerald-400/80 font-medium group-hover:text-emerald-300/90 transition-colors">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {feature.steps.map((step, stepIndex) => (
                      <div 
                        key={stepIndex}
                        className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-xl group-hover:bg-slate-900/60 transition-all duration-300"
                      >
                        <div className="bg-emerald-500/20 p-1.5 rounded-full group-hover:bg-emerald-500/30 transition-all duration-300 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-500 group-hover:text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className={`transition-all duration-500 ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-xl border border-blue-500/30">
                  <Settings2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Boîte à Outils</h3>
                  <p className="text-gray-400 text-sm">Tous les outils disponibles pour vos traitements d'images</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tools.map((tool, index) => (
                <div 
                  key={index}
                  className="group bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/60 hover:border-slate-600/80 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col items-center text-center gap-4 h-full">
                    <div className={`${tool.bgColor} p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 border border-slate-600/50 shadow-lg`}>
                      <tool.icon className={`w-8 h-8 ${tool.color} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-base mb-2 group-hover:text-gray-100 transition-colors">{tool.name}</h4>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed transition-colors">{tool.description}</p>
                    </div>
                    
                    <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden group-hover:h-1.5 transition-all duration-300">
                      <div className={`h-full rounded-full transition-all duration-1000 group-hover:w-full ${
                        tool.color.includes('blue') ? 'bg-gradient-to-r from-blue-500 to-blue-400 w-3/4' :
                        tool.color.includes('purple') ? 'bg-gradient-to-r from-purple-500 to-purple-400 w-4/5' :
                        tool.color.includes('red') ? 'bg-gradient-to-r from-red-500 to-red-400 w-2/3' :
                        tool.color.includes('amber') ? 'bg-gradient-to-r from-amber-500 to-amber-400 w-full' :
                        'bg-gradient-to-r from-emerald-500 to-emerald-400 w-5/6'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className={`transition-all duration-500 ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 rounded-xl border border-purple-500/30">
                  <Lightbulb className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Conseils d'Expert</h3>
                  <p className="text-gray-400 text-sm">Optimisez vos résultats avec ces bonnes pratiques</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {tips.map((tip, index) => {
                const colors = {
                  0: { bg: 'from-purple-500/20 to-purple-600/20', text: 'text-purple-300', border: 'border-purple-500/30', accent: 'purple' },
                  1: { bg: 'from-amber-500/20 to-amber-600/20', text: 'text-amber-300', border: 'border-amber-500/30', accent: 'amber' },
                  2: { bg: 'from-emerald-500/20 to-emerald-600/20', text: 'text-emerald-300', border: 'border-emerald-500/30', accent: 'emerald' }
                };
                const color = colors[index as keyof typeof colors];
                
                return (
                  <div 
                    key={index}
                    className={`group bg-gradient-to-br ${color.bg} backdrop-blur-sm rounded-2xl p-6 border ${color.border} transition-all duration-300 hover:shadow-xl hover:shadow-${color.accent}-500/10 transform hover:scale-[1.02]`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`bg-${color.accent}-500/20 p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 border border-${color.accent}-500/30 shadow-lg`}>
                        <tip.icon className={`w-7 h-7 text-${color.accent}-400 group-hover:text-${color.accent}-300`} />
                      </div>
                      <div>
                        <h4 className={`font-bold text-xl ${color.text} group-hover:text-white transition-colors mb-2`}>{tip.title}</h4>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {tip.advice.map((item, itemIndex) => (
                        <div 
                          key={itemIndex}
                          className="flex items-start gap-3 p-4 bg-slate-900/30 rounded-xl group-hover:bg-slate-900/50 transition-all duration-300 border border-slate-700/30"
                        >
                          <div className={`bg-${color.accent}-500/20 p-2 rounded-full group-hover:bg-${color.accent}-500/30 transition-all duration-300`}>
                            <Check className={`w-4 h-4 text-${color.accent}-500 group-hover:text-${color.accent}-400`} />
                          </div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed flex-1">{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className={`mt-6 p-4 bg-${color.accent}-500/10 rounded-xl border border-${color.accent}-500/20`}>
                      <div className="flex items-center gap-2">
                        <Star className={`w-4 h-4 text-${color.accent}-500`} />
                        <span className="text-xs font-semibold text-gray-300">
                          {index === 0 && 'Conseil Pro: Images haute qualité = meilleurs résultats'}
                          {index === 1 && 'Astuce: Utilisez les statistiques pour suivre vos performances'}
                          {index === 2 && 'Important: Toujours tester avant de traiter en masse'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 3:
        return (
          <div className={`transition-all duration-500 ${animationDirection === 'next' ? 'translate-x-full opacity-0' : animationDirection === 'prev' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-3 rounded-xl border border-amber-500/30">
                  <Monitor className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">MiRemover Desktop</h3>
                  <p className="text-gray-400 text-sm">La puissance du traitement local sur votre ordinateur</p>
                </div>
              </div>
              
              {/* CTA pour télécharger */}
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-amber-500/30 to-orange-500/30 p-4 rounded-2xl border border-amber-500/40 shadow-xl">
                      <Download className="w-8 h-8 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-amber-300 mb-1">Téléchargez maintenant</h4>
                      <p className="text-gray-300 text-sm">Version gratuite disponible pour Windows, Mac et Linux</p>
                    </div>
                  </div>
                  <div className="bg-amber-500/20 px-4 py-2 rounded-xl border border-amber-500/30">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Gratuit</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {desktop.map((item, index) => {
                const colors = {
                  0: { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-300', border: 'border-blue-500/30', accent: 'blue', icon: '⚡' },
                  1: { bg: 'from-green-500/20 to-emerald-500/20', text: 'text-green-300', border: 'border-green-500/30', accent: 'green', icon: '🚀' },
                  2: { bg: 'from-purple-500/20 to-violet-500/20', text: 'text-purple-300', border: 'border-purple-500/30', accent: 'purple', icon: '🌐' }
                };
                const color = colors[index as keyof typeof colors];
                
                return (
                  <div 
                    key={index}
                    className={`group bg-gradient-to-br ${color.bg} backdrop-blur-sm rounded-2xl p-6 border ${color.border} transition-all duration-300 hover:shadow-xl hover:shadow-${color.accent}-500/10 transform hover:scale-[1.02]`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {color.icon}
                      </div>
                      <h4 className={`font-bold text-xl ${color.text} group-hover:text-white transition-colors mb-2`}>{item.title}</h4>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{item.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {item.details.map((detail, detailIndex) => (
                        <div 
                          key={detailIndex}
                          className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-xl group-hover:bg-slate-900/50 transition-all duration-300 border border-slate-700/30"
                        >
                          <div className={`bg-${color.accent}-500/20 p-1.5 rounded-full group-hover:bg-${color.accent}-500/30 transition-all duration-300`}>
                            <Check className={`w-3 h-3 text-${color.accent}-500 group-hover:text-${color.accent}-400`} />
                          </div>
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed flex-1">{detail}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Performance indicator */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">Performance</span>
                        <span className={`text-xs font-bold text-${color.accent}-400`}>
                          {index === 0 && '3x plus rapide'}
                          {index === 1 && 'Très efficace'}
                          {index === 2 && 'Toujours connecté'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 bg-gradient-to-r from-${color.accent}-500 to-${color.accent}-400`}
                          style={{ width: index === 0 ? '90%' : index === 1 ? '85%' : '75%' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-800/50 w-full max-w-7xl h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header modernisé */}
        <div className="flex-shrink-0 relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-slate-800/60 via-slate-800/80 to-slate-800/60 backdrop-blur-sm p-6 border-b border-slate-700/60">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 via-blue-500/30 to-blue-400/20 p-4 rounded-2xl border border-blue-500/30 shadow-xl">
                <Info className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-gray-100 to-blue-100 bg-clip-text text-transparent tracking-tight">
                  Guide MiRemover
                </h2>
                <p className="text-blue-400/90 mt-1 font-medium text-base">
                  Maîtrisez tous les outils en quelques minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-300 font-medium">Guide interactif</span>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="group p-3 text-gray-400 hover:text-white bg-slate-800/70 hover:bg-slate-700/70 rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-red-500/40 shadow-lg transform hover:scale-105"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation modernisée */}
        <div className="flex-shrink-0 p-6 bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-3">
              {sections.map((section, index) => {
                const isActive = activeSection === index;
                const colors = {
                  0: { bg: 'from-emerald-500/20 to-emerald-600/20', text: 'text-emerald-300', border: 'border-emerald-500/30', icon: '📚' },
                  1: { bg: 'from-blue-500/20 to-blue-600/20', text: 'text-blue-300', border: 'border-blue-500/30', icon: '🛠️' },
                  2: { bg: 'from-purple-500/20 to-purple-600/20', text: 'text-purple-300', border: 'border-purple-500/30', icon: '💡' },
                  3: { bg: 'from-amber-500/20 to-amber-600/20', text: 'text-amber-300', border: 'border-amber-500/30', icon: '💻' }
                };
                const color = colors[index as keyof typeof colors];
                
                return (
                  <button
                    key={section}
                    className={`group relative p-4 rounded-2xl text-sm font-semibold transition-all duration-300 border ${
                      isActive
                        ? `bg-gradient-to-br ${color.bg} ${color.text} ${color.border} shadow-lg transform scale-105` 
                        : 'text-gray-400 hover:text-gray-200 bg-slate-800/40 hover:bg-slate-700/60 border-slate-700/50 hover:border-slate-600/70'
                    }`}
                    onClick={() => setActiveSection(index)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`text-2xl transition-transform duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`}>
                        {color.icon}
                      </div>
                      <div className="text-center">
                        <div className={`font-bold ${
                          isActive ? color.text : 'group-hover:text-white'
                        }`}>
                          {section}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {index === 0 && 'Découvrir les bases'}
                          {index === 1 && 'Outils disponibles'}
                          {index === 2 && 'Optimiser l\'usage'}
                          {index === 3 && 'Version locale'}
                        </div>
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${color.bg} rounded-2xl opacity-20 animate-pulse`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            {renderSection()}
          </div>
          
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700/50">
            <button
              onClick={() => handleNavigation('prev')}
              className="group flex items-center gap-3 bg-slate-800/70 hover:bg-slate-700/70 text-gray-300 hover:text-white px-6 py-3 rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-blue-500/40 shadow-lg hover:shadow-blue-500/10 transform hover:scale-105"
            >
              <div className="bg-blue-500/20 p-1.5 rounded-lg group-hover:bg-blue-500/30 transition-all duration-300">
                <ChevronLeft className="w-4 h-4 text-blue-500" />
              </div>
              <span className="font-medium">Précédent</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium">
                    {activeSection + 1} / {sections.length}
                  </span>
                  <div className="flex space-x-2">
                    {sections.map((_, index) => {
                      const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
                      return (
                        <div 
                          key={index} 
                          className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            activeSection === index 
                              ? `${colors[index]} scale-150 shadow-lg` 
                              : 'bg-gray-600 hover:bg-gray-500 hover:scale-125'
                          }`}
                          onClick={() => setActiveSection(index)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleNavigation('next')}
              className="group flex items-center gap-3 bg-slate-800/70 hover:bg-slate-700/70 text-gray-300 hover:text-white px-6 py-3 rounded-xl transition-all duration-300 border border-slate-700/50 hover:border-blue-500/40 shadow-lg hover:shadow-blue-500/10 transform hover:scale-105"
            >
              <span className="font-medium">Suivant</span>
              <div className="bg-blue-500/20 p-1.5 rounded-lg group-hover:bg-blue-500/30 transition-all duration-300">
                <ChevronRight className="w-4 h-4 text-blue-500" />
              </div>
            </button>
          </div>
        </div>

        {/* Footer modernisé */}
        <div className="flex-shrink-0 bg-slate-800/40 backdrop-blur-sm p-6 rounded-b-2xl border-t border-slate-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                <Lightbulb className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-300">Guide terminé !</p>
                <p className="text-xs text-gray-500">Vous êtes prêt à utiliser MiRemover</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveSection(0)}
                className="group bg-slate-700/70 hover:bg-slate-600/70 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-300 border border-slate-600/50 hover:border-blue-500/40 flex items-center gap-2 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Recommencer
              </button>
              
              <button
                onClick={onClose}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white px-8 py-3 rounded-xl transition-all duration-300 font-bold text-sm shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-500/50 transform hover:scale-105"
              >
                <div className="flex items-center gap-2 relative z-10">
                  <span>Commencer à utiliser</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}