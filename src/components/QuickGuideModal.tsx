import React from 'react';
import { X, Upload, Wand2, Download, Info } from 'lucide-react';

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
        "Importation multiple possible",
        "Compression automatique",
        "Taille maximale : 10 Mo par image"
      ]
    },
    {
      icon: Wand2,
      title: "2. Traitement IA",
      description: "Suppression intelligente du fond",
      tips: [
        "Détection précise des contours",
        "Préservation des détails",
        "Traitement par lots",
        "Ajustez manuellement si nécessaire"
      ]
    },
    {
      icon: Download,
      title: "3. Exportez",
      description: "Téléchargez vos images sans fond",
      tips: [
        "PNG avec transparence",
        "JPG avec fond blanc",
        "Export groupé",
        "Résolution maximale préservée"
      ]
    }
  ];

  const faqs = [
    {
      question: "Quels formats d'image sont supportés ?",
      answer: "Nous supportons les formats JPG, PNG, et WEBP."
    },
    {
      question: "Puis-je traiter plusieurs images à la fois ?",
      answer: "Oui, MiRemover permet le traitement par lots."
    },
    {
      question: "Comment puis-je optimiser les résultats ?",
      answer: "Assurez-vous que vos images sont bien éclairées et nettes pour de meilleurs résultats."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-3xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Info className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-200">
                  Guide rapide
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Découvrez comment utiliser MiRemover pour supprimer le fond de vos images en quelques étapes simples.
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="btn-icon hover:bg-slate-800/50 transition-colors duration-300"
              aria-label="Fermer le guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Introduction */}
          <div className="mb-8">
            <p className="text-gray-300">
              MiRemover est un outil puissant qui utilise l'intelligence artificielle pour supprimer le fond de vos images rapidement et efficacement. Suivez les étapes ci-dessous pour commencer.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 group"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Step Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500/10 w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors duration-300">
                    <step.icon className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-200">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Tips List */}
                <ul className="space-y-2">
                  {step.tips.map((tip, tipIndex) => (
                    <li 
                      key={tipIndex}
                      className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
                    >
                      <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full group-hover:scale-150 transition-transform duration-300" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">
              Questions fréquentes
            </h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300"
                >
                  <h4 className="text-base font-semibold text-gray-200">
                    {faq.question}
                  </h4>
                  <p className="text-sm text-gray-400 mt-2">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}