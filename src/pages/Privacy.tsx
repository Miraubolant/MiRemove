import React, { useEffect, useState } from 'react';
import { Shield, ArrowLeft, X, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Privacy() {
  const navigate = useNavigate();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [activeSection, setActiveSection] = useState(1);

  useEffect(() => {
    // Only set when user explicitly accepts
    const seenLegal = sessionStorage.getItem('seen-legal');
    if (seenLegal === 'true') {
      setHasAccepted(true);
    }
  }, []);

  const handleClose = () => {
    if (hasAccepted) {
      navigate('/');
    } else {
      // Show confirmation dialog if trying to leave without accepting
      if (window.confirm('Vous n\'avez pas accepté la politique de confidentialité. Êtes-vous sûr de vouloir quitter?')) {
        navigate('/');
      }
    }
  };

  const handleAccept = () => {
    sessionStorage.setItem('seen-legal', 'true');
    setHasAccepted(true);
    // Optional: redirect after a short delay
    setTimeout(() => navigate('/'), 1000);
  };

  const sections = [
    {
      id: 1,
      title: "Données collectées",
      items: [
        "Adresse email (pour l'authentification)",
        "Images téléchargées (temporairement)",
        "Statistiques d'utilisation anonymes",
        "Données de connexion sécurisées"
      ]
    },
    {
      id: 2,
      title: "Utilisation des données",
      items: [
        "Fournir le service de suppression d'arrière-plan",
        "Améliorer la qualité du service",
        "Assurer la sécurité de votre compte",
        "Vous contacter si nécessaire"
      ]
    },
    {
      id: 3,
      title: "Protection des données",
      items: [
        "Chiffrement de bout en bout",
        "Stockage sécurisé en Europe",
        "Suppression automatique des images",
        "Accès strictement contrôlé"
      ]
    },
    {
      id: 4,
      title: "Vos droits",
      items: [
        "Accès à vos données",
        "Rectification des informations",
        "Suppression du compte",
        "Export des données"
      ]
    },
    {
      id: 5,
      title: "Cookies essentiels",
      items: [
        "Authentification sécurisée",
        "Préférences utilisateur",
        "Performance du service"
      ]
    },
    {
      id: 6,
      title: "Contact",
      content: "Pour toute question sur vos données : contact@miraubolant.com"
    }
  ];

  // Navigation between sections
  const goToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToPrevSection = () => {
    if (activeSection > 1) {
      goToSection(activeSection - 1);
    }
  };

  const goToNextSection = () => {
    if (activeSection < sections.length) {
      goToSection(activeSection + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-200">
                  Politique de confidentialité
                </h1>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-300 transition-colors rounded-lg hover:bg-white/5"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Section navigation */}
            <div className="mt-4 flex gap-1 overflow-x-auto pb-2 hide-scrollbar">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => goToSection(section.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    activeSection === section.id
                      ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {section.id}. {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8">
                {sections.map((section) => (
                  <section key={section.id} id={`section-${section.id}`} className="scroll-mt-20">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      <span className="bg-emerald-500/10 text-emerald-500 rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">
                        {section.id}
                      </span>
                      {section.title}
                    </h2>
                    
                    {section.items ? (
                      <ul className="list-none space-y-3 text-gray-400">
                        {section.items.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">
                        {section.content}
                        {section.id === 6 && (
                          <>
                            <br />
                            <a href="mailto:contact@miraubolant.com" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                              contact@miraubolant.com
                            </a>
                          </>
                        )}
                      </p>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </div>

          {/* Footer with navigation and actions */}
          <div className="p-6 border-t border-gray-800 flex-shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={goToPrevSection}
                  disabled={activeSection === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 1
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </button>
                
                <button
                  onClick={goToNextSection}
                  disabled={activeSection === sections.length}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeSection === sections.length
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  Suivant
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="text-gray-400 hover:text-gray-300 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Retour à l'accueil
                </Link>
                
                <button
                  onClick={handleAccept}
                  disabled={hasAccepted}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    hasAccepted
                      ? 'bg-emerald-600/20 text-emerald-500 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {hasAccepted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Accepté
                    </>
                  ) : (
                    'J\'accepte la politique'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}