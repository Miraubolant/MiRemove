import React, { useState, useEffect } from 'react';
import { X, Upload, Wand2, Download, Info, ChevronRight, CheckCircle, HelpCircle, ExternalLink } from 'lucide-react';

interface QuickGuideModalProps {
  onClose: () => void;
}

// Composant pour les étapes
const StepCard = ({ step, index, isActive }: { 
  step: { 
    icon: React.ElementType; 
    title: string; 
    description: string; 
    tips: string[]; 
  }; 
  index: number; 
  isActive: boolean; 
}) => {
  return (
    <div 
      className={`bg-slate-800/50 rounded-xl p-6 border transition-all duration-500 
        ${isActive 
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 scale-105' 
          : 'border-gray-700/50 hover:border-emerald-500/30'}
        transform-gpu`}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`
      }}
    >
      {/* Step Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300
          ${isActive ? 'bg-emerald-500/30' : 'bg-emerald-500/10'}`}>
          <step.icon className={`w-6 h-6 transition-all duration-300
            ${isActive ? 'text-emerald-400 scale-110' : 'text-emerald-500'}`} />
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
      <ul className="space-y-3 mt-4">
        {step.tips.map((tip, tipIndex) => (
          <li 
            key={tipIndex}
            className="flex items-start gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300"
            style={{
              animation: `fadeInRight 0.4s ease-out ${(index * 0.15) + (tipIndex * 0.1) + 0.3}s both`
            }}
          >
            <CheckCircle className="w-4 h-4 text-emerald-500/70 mt-0.5 flex-shrink-0" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Composant pour les FAQ
const FaqItem = ({ 
  faq, 
  isOpen, 
  toggleOpen 
}: { 
  faq: { question: string; answer: string; }; 
  isOpen: boolean; 
  toggleOpen: () => void; 
}) => {
  return (
    <div 
      className={`bg-slate-800/50 rounded-xl border overflow-hidden transition-all duration-300
        ${isOpen 
          ? 'border-emerald-500/50 shadow-md' 
          : 'border-gray-700/50 hover:border-emerald-500/30'}`}
    >
      <button 
        onClick={toggleOpen}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className={`w-5 h-5 transition-colors duration-300
            ${isOpen ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <h4 className="text-base font-semibold text-gray-200">
            {faq.question}
          </h4>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300
          ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-sm text-gray-400 p-4 pt-0 border-t border-gray-700/30">
          {faq.answer}
        </p>
      </div>
    </div>
  );
};

export default function QuickGuideModal({ onClose }: QuickGuideModalProps) {
  // État pour suivre l'étape active et les FAQs ouvertes
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Animation qui change automatiquement l'étape active
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % steps.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Fonction pour basculer l'état d'ouverture d'une FAQ
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const steps = [
    {
      icon: Upload,
      title: "1. Importez vos images",
      description: "Glissez-déposez ou sélectionnez vos images",
      tips: [
        "Formats supportés : JPG, PNG, WEBP, HEIC",
        "Importation multiple jusqu'à 50 images",
        "Compression automatique intelligente",
        "Taille maximale : 25 Mo par image"
      ]
    },
    {
      icon: Wand2,
      title: "2. Traitement IA",
      description: "Suppression intelligente du fond",
      tips: [
        "Détection précise des contours par IA avancée",
        "Préservation des détails fins et transparence",
        "Traitement par lots optimisé",
        "Ajustement manuel avec outils professionnels"
      ]
    },
    {
      icon: Download,
      title: "3. Exportez",
      description: "Téléchargez vos images sans fond",
      tips: [
        "PNG avec transparence haute qualité",
        "JPG avec fond blanc ou personnalisé",
        "Export groupé avec compression optimale",
        "Options d'exportation avancées (résolution, format)"
      ]
    }
  ];

  const faqs = [
    {
      question: "Quels formats d'image sont supportés ?",
      answer: "Nous supportons les formats JPG, PNG, WEBP et HEIC. Notre technologie optimise automatiquement chaque type d'image pour des résultats parfaits."
    },
    {
      question: "Puis-je traiter plusieurs images à la fois ?",
      answer: "Oui, MiRemover permet le traitement par lots jusqu'à 50 images simultanément, tout en préservant la qualité de chaque image traitée."
    },
    {
      question: "Comment puis-je optimiser les résultats ?",
      answer: "Assurez-vous que vos images sont bien éclairées et nettes. Pour les objets complexes, utilisez notre outil d'ajustement manuel après le traitement automatique."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Vos images sont traitées localement et ne sont jamais stockées sur nos serveurs. Elles sont automatiquement supprimées après traitement."
    },
    {
      question: "Y a-t-il une limite d'utilisation ?",
      answer: "La version gratuite permet de traiter jusqu'à 10 images. Les abonnés premium bénéficient d'un usage plus rapide et des fonctionnalités avancées et d'un quota par jour/mois augmenté."
    }
  ];

  // Contenu additionnel: section des conseils avancés
  const advancedTips = [
    {
      title: "Pour les photographes",
      content: "Utilisez l'option de préservation des ombres pour conserver la profondeur dans vos compositions."
    },
    {
      title: "Pour le e-commerce",
      content: "Exportez en lot avec fond transparent pour une intégration rapide sur votre site web."
    },
    {
      title: "Pour les designers",
      content: "Activez la détection de contours haute précision pour les objets complexes."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-8 duration-500"
        style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <Info className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-100 tracking-tight">
                  Guide rapide MiRemover
                </h2>
                <p className="text-sm text-gray-400 mt-1 max-w-lg">
                  Découvrez comment utiliser MiRemover pour supprimer le fond de vos images en quelques étapes simples et obtenir des résultats professionnels.
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="bg-slate-800/70 hover:bg-slate-700 p-2 rounded-lg transition-colors duration-300"
              aria-label="Fermer le guide"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Introduction avec animation */}
          <div 
            className="mb-10 bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-5 rounded-xl border-l-4 border-emerald-500"
            style={{ animation: 'fadeInLeft 0.8s ease-out 0.2s both' }}
          >
            <p className="text-gray-300 leading-relaxed">
              MiRemover est un outil professionnel qui utilise l'intelligence artificielle avancée pour supprimer 
              le fond de vos images avec une précision exceptionnelle. Notre technologie analyse 
              intelligemment chaque pixel pour des résultats parfaits, même avec les images les plus complexes.
            </p>
          </div>

          {/* Navigation des étapes (nouveau) */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStepIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeStepIndex === index
                      ? 'bg-emerald-500 scale-125'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Voir l'étape ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Steps Grid avec interaction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {steps.map((step, index) => (
              <StepCard 
                key={index}
                step={step}
                index={index}
                isActive={activeStepIndex === index}
              />
            ))}
          </div>

          {/* Nouvelle section: Conseils avancés */}
          <div 
            className="mb-10"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}
          >
            <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-emerald-500" />
              Conseils avancés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advancedTips.map((tip, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/30 rounded-xl p-4 border border-gray-700/30 hover:border-emerald-500/30 hover:bg-slate-800/50 transition-all duration-300"
                  style={{ animation: `fadeInRight 0.6s ease-out ${0.7 + index * 0.1}s both` }}
                >
                  <h4 className="text-base font-medium text-emerald-400 mb-2">{tip.title}</h4>
                  <p className="text-sm text-gray-400">{tip.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section améliorée avec accordion */}
          <div 
            className="mt-8"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.8s both' }}
          >
            <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" />
              Questions fréquentes
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <FaqItem 
                  key={index}
                  faq={faq}
                  isOpen={openFaqIndex === index}
                  toggleOpen={() => toggleFaq(index)}
                />
              ))}
            </div>
          </div>

          {/* Footer avec CTA */}
          <div 
            className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-800"
            style={{ animation: 'fadeInUp 0.8s ease-out 1s both' }}
          >
            <p className="text-sm text-gray-400">
              Prêt à transformer vos images ? Commencez dès maintenant !
            </p>
            <button 
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20"
            >
              Commencer
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { QuickGuideModal }