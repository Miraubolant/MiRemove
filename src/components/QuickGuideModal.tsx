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
        "Taille maximale : 10 Mo"
      ]
    },
    {
      icon: Wand2,
      title: "2. Traitement IA",
      description: "Suppression intelligente du fond",
      tips: [
        "Détection précise des contours",
        "Préservation des détails",
        "Traitement par lots"
      ]
    },
    {
      icon: Download,
      title: "3. Exportez",
      description: "Téléchargez vos images sans fond",
      tips: [
        "Format JPG avec fond blanc",
        "Export groupé",
        "Résolution d'origine préservée"
      ]
    }
  ];

  const faqs = [
    {
      question: "Quels formats d'image sont supportés ?",
      answer: "Nous supportons les formats JPG, PNG et WEBP."
    },
    {
      question: "Puis-je traiter plusieurs images à la fois ?",
      answer: "Oui, MiRemover permet le traitement par lots de plusieurs images simultanément."
    },
    {
      question: "Comment puis-je optimiser les résultats ?",
      answer: "Assurez-vous que vos images sont bien éclairées et nettes pour des résultats optimaux."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-3xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Info className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-200">
                  Guide rapide
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Découvrez comment utiliser MiRemover en quelques étapes simples
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="bg-slate-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <step.icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {step.tips.map((tip, tipIndex) => (
                    <li 
                      key={tipIndex}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-200 mb-4">
              Questions fréquentes
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/50 rounded-lg p-4 border border-gray-700/50"
                >
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Commencer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}