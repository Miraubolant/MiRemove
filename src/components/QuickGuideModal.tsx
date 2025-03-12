import React from 'react';
import { X, Upload, Wand2, Download, Info, ImageIcon, Settings2, Sparkles, Maximize2, PaintBucket, Layers, FileType, Crop, Palette, ZoomIn, Share2, Clock, Shield } from 'lucide-react';

interface QuickGuideModalProps {
  onClose: () => void;
}

export function QuickGuideModal({ onClose }: QuickGuideModalProps) {
  const features = [
    {
      icon: Upload,
      title: "1. Importation",
      description: "Importez vos images facilement",
      sections: [
        {
          title: "Méthodes d'importation",
          items: [
            "Glisser-déposer multiple",
            "Sélection via l'explorateur",
            "Importation par lot"
          ]
        },
        {
          title: "Formats supportés",
          items: [
            "JPG/JPEG - Photos et images",
            "PNG - Images avec transparence",
            "WebP - Format web optimisé"
          ]
        },
        {
          title: "Optimisations automatiques",
          items: [
            "Compression intelligente",
            "Redimensionnement adaptatif",
            "Conversion de format"
          ]
        }
      ]
    },
    {
      icon: Settings2,
      title: "2. Configuration",
      description: "Personnalisez le traitement",
      sections: [
        {
          title: "Intelligence artificielle",
          items: [
            "Technologie de pointe",
            "Détection précise des sujets",
            "Traitement optimisé"
          ]
        },
        {
          title: "Paramètres avancés",
          items: [
            "Ajustement des dimensions",
            "Contrôle de la compression",
            "Gestion des bords"
          ]
        },
        {
          title: "Options de qualité",
          items: [
            "Qualité optimale",
            "Compression adaptative",
            "Optimisation automatique"
          ]
        }
      ]
    },
    {
      icon: Wand2,
      title: "3. Traitement IA",
      description: "Suppression intelligente du fond",
      sections: [
        {
          title: "Technologies",
          items: [
            "Intelligence artificielle avancée",
            "Détection précise des contours",
            "Préservation des détails fins"
          ]
        },
        {
          title: "Fonctionnalités",
          items: [
            "Traitement par lot",
            "Prévisualisation en temps réel",
            "Comparaison avant/après"
          ]
        },
        {
          title: "Optimisations",
          items: [
            "Traitement en arrière-plan",
            "File d'attente intelligente",
            "Reprise automatique"
          ]
        }
      ]
    },
    {
      icon: Download,
      title: "4. Exportation",
      description: "Téléchargez vos images traitées",
      sections: [
        {
          title: "Formats d'export",
          items: [
            "PNG avec transparence",
            "JPG avec fond blanc",
            "ZIP pour les lots"
          ]
        },
        {
          title: "Options d'export",
          items: [
            "Qualité optimale",
            "Compression intelligente",
            "Export groupé"
          ]
        },
        {
          title: "Partage",
          items: [
            "Téléchargement direct",
            "Sauvegarde locale",
            "Export multiple"
          ]
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-6xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Info className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-200">
                  Guide complet
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Découvrez toutes les fonctionnalités de MiRemover
                </p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Feature Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Feature Sections */}
                <div className="space-y-6">
                  {feature.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        {section.title}
                      </h4>
                      <ul className="space-y-2 pl-3">
                        {section.items.map((item, itemIndex) => (
                          <li 
                            key={itemIndex}
                            className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
                          >
                            <div className="w-1 h-1 bg-emerald-500/50 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-slate-800/30 rounded-xl p-6 border border-gray-700/30">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Astuces pro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Shield,
                  title: "Compte Premium",
                  description: "Accédez à toutes les fonctionnalités sans limite"
                },
                {
                  icon: Clock,
                  title: "File d'attente",
                  description: "Traitez plusieurs images en arrière-plan"
                },
                {
                  icon: Share2,
                  title: "Partage facile",
                  description: "Partagez vos images traitées en un clic"
                },
                {
                  icon: Layers,
                  title: "Traitement par lot",
                  description: "Gagnez du temps avec le traitement groupé"
                }
              ].map((tip, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <tip.icon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}