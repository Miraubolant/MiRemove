import React, { useEffect, useState } from 'react';
import { ScrollText, ArrowLeft, X, CheckCircle, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Terms() {
  const navigate = useNavigate();
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    // Only set when user explicitly accepts
    const seenLegal = sessionStorage.getItem('seen-legal');
    if (seenLegal === 'true') {
      setHasAccepted(true);
    }
    
    // Add escape key handler
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  const handleClose = () => {
    if (hasAccepted) {
      navigate('/');
    } else {
      // Show confirmation dialog if trying to leave without accepting
      if (window.confirm('Vous n\'avez pas accepté les conditions. Êtes-vous sûr de vouloir quitter?')) {
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
      title: "Notre service",
      intro: "Miraubolant propose un service innovant de traitement d'images utilisant des technologies d'intelligence artificielle avancées pour répondre à vos besoins de retouche photo.",
      items: [
        "Suppression d'arrière-plan par IA",
        "Traitement haute qualité",
        "Export PNG/JPG optimisé",
        "Stockage temporaire sécurisé"
      ]
    },
    {
      id: 2,
      title: "Règles d'utilisation",
      intro: "Pour maintenir la qualité et l'intégrité de notre service, nous établissons certaines règles d'utilisation que tous les utilisateurs doivent respecter pour garantir une expérience positive et équitable.",
      items: [
        "Usage légal uniquement",
        "Pas de surcharge du service",
        "Contenu approprié",
        "Respect des droits d'auteur"
      ]
    },
    {
      id: 3,
      title: "Votre compte",
      intro: "Votre compte Miraubolant est personnel et vous êtes responsable de toutes les activités qui s'y déroulent. Nous vous recommandons de prendre les précautions nécessaires pour en assurer la sécurité.",
      items: [
        "Un compte par personne",
        "Informations véridiques",
        "Sécurité des accès",
        "Respect des quotas"
      ]
    },
    {
      id: 4,
      title: "Propriété et droits",
      intro: "Nous respectons vos droits de propriété intellectuelle et nous attendons de vous que vous respectiez les nôtres. Cette section clarifie les aspects juridiques concernant la propriété des contenus et l'utilisation du service.",
      items: [
        "Vos images restent vôtres",
        "Service protégé",
        "Usage personnel",
        "Pas de copie du service"
      ]
    },
    {
      id: 5,
      title: "Mises à jour",
      intro: "Notre service évolue constamment pour s'améliorer. Par conséquent, nous nous réservons le droit de modifier périodiquement ces conditions d'utilisation pour refléter ces évolutions.",
      content: "Les conditions peuvent évoluer avec l'amélioration de nos services. Toutes les modifications prennent effet immédiatement après leur publication sur notre site. Il est de votre responsabilité de consulter régulièrement cette page pour vous tenir informé des changements. Votre utilisation continue du service après la publication des modifications constitue votre acceptation de ces nouvelles conditions."
    },
    {
      id: 6,
      title: "Contact",
      intro: "Notre équipe est à votre disposition pour répondre à toutes vos questions concernant ces conditions d'utilisation ou pour vous aider à résoudre tout problème lié à l'utilisation de notre service.",
      content: "Questions ou suggestions concernant nos conditions d'utilisation :"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300" 
        role="dialog" 
        aria-labelledby="terms-title"
      >
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <ScrollText className="w-6 h-6 text-emerald-500" aria-hidden="true" />
                </div>
                <h1 id="terms-title" className="text-2xl font-bold text-gray-200">
                  Conditions d'utilisation
                </h1>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-300 transition-colors rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            {/* Introduction */}
            <div className="mt-4 pr-2">
              <p className="text-gray-400 text-sm leading-relaxed">
                Bienvenue sur Miraubolant. En utilisant notre service, vous acceptez d'être lié par ces conditions d'utilisation.
                Veuillez les lire attentivement avant d'utiliser notre plateforme.
              </p>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6" tabIndex="0">
            <div className="prose prose-invert max-w-none">
              {/* Dernière mise à jour */}
              <div className="mb-8 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                <p className="text-sm text-gray-400 mb-0 flex items-center gap-2">
                  <span className="text-emerald-500 font-medium">Dernière mise à jour :</span> 
                  13 mars 2025
                </p>
              </div>
              
              <div className="space-y-10">
                {sections.map((section) => (
                  <section 
                    key={section.id} 
                    id={`section-${section.id}`}
                    className="scroll-mt-20 pb-6 last:pb-0"
                  >
                    <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                      <span className="bg-emerald-500/10 text-emerald-500 rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">
                        {section.id}
                      </span>
                      {section.title}
                    </h2>
                    
                    {/* Introduction paragraph for each section */}
                    {section.intro && (
                      <p className="text-gray-400 mb-4">
                        {section.intro}
                      </p>
                    )}
                    
                    {section.items ? (
                      <ul className="list-none space-y-3 text-gray-400">
                        {section.items.map((item, index) => (
                          <li key={`item-${section.id}-${index}`} className="flex items-start gap-3">
                            <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400">
                        <p>{section.content}</p>
                        {section.id === 6 && (
                          <div className="mt-3 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="bg-emerald-500/10 p-2 rounded-full">
                                <ScrollText className="w-5 h-5 text-emerald-500" />
                              </div>
                              <a 
                                href="mailto:contact@miraubolant.com" 
                                className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                              >
                                contact@miraubolant.com
                              </a>
                            </div>
                            <p className="text-gray-400 text-sm">
                              Notre équipe s'engage à répondre à toutes vos questions dans un délai de 48 heures ouvrables.
                              Pour un traitement plus rapide, veuillez préciser dans l'objet de votre message "Conditions d'utilisation - Question".
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                ))}
                
                {/* Additional Information */}
                <section className="scroll-mt-20 pb-6">
                  <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                    <span className="bg-emerald-500/10 text-emerald-500 rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">
                      7
                    </span>
                    Limitation de responsabilité
                  </h2>
                  
                  <p className="text-gray-400 mb-4">
                    Miraubolant s'efforce de fournir un service de la plus haute qualité, mais nous ne pouvons garantir que notre service sera ininterrompu, 
                    sécurisé ou exempt d'erreurs. Le service est fourni "tel quel" et "selon disponibilité" sans garantie d'aucune sorte.
                  </p>
                  
                  <p className="text-gray-400 mb-4">
                    En aucun cas, Miraubolant, ses directeurs, employés ou agents ne seront responsables de tout dommage direct, indirect, 
                    accessoire, spécial ou consécutif résultant de l'utilisation ou de l'impossibilité d'utiliser le service.
                  </p>
                  
                  <div className="mt-6 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                    <h3 className="text-md font-medium text-gray-300 mb-2">Loi applicable</h3>
                    <p className="text-gray-400 text-sm">
                      Ces conditions d'utilisation sont régies et interprétées conformément aux lois françaises, sans égard aux 
                      principes de conflit de lois. Tout litige relatif à ces conditions sera soumis à la compétence exclusive des 
                      tribunaux de Paris, France.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Footer with actions */}
          <div className="p-6 border-t border-gray-800 flex-shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/"
                className="text-gray-400 hover:text-gray-300 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-2"
                aria-label="Retour à l'accueil"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </Link>
              
              <button
                onClick={handleAccept}
                disabled={hasAccepted}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  hasAccepted
                    ? 'bg-emerald-600/20 text-emerald-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 focus:ring-offset-emerald-700'
                }`}
              >
                {hasAccepted ? (
                  <>
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    <span>Accepté</span>
                  </>
                ) : (
                  'J\'accepte les conditions'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}