import React, { useEffect, useState } from 'react';
import { Shield, ArrowLeft, X, CheckCircle, Mail, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Privacy() {
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
      intro: "Pour vous offrir un service optimal, nous collectons un minimum de données nécessaires à votre expérience. Notre approche repose sur le principe de minimisation des données, conformément aux exigences du RGPD.",
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
      intro: "Vos données sont utilisées exclusivement pour les finalités explicites mentionnées ci-dessous. Nous nous engageons à ne jamais vendre vos informations à des tiers ou à les utiliser à des fins commerciales non sollicitées.",
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
      intro: "La sécurité de vos informations est notre priorité absolue. Nous avons implémenté des mesures techniques et organisationnelles rigoureuses pour protéger vos données contre tout accès non autorisé ou toute perte accidentelle.",
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
      intro: "Le RGPD vous confère plusieurs droits fondamentaux concernant vos données personnelles. Nous nous engageons à faciliter l'exercice de ces droits et à répondre à toute demande dans un délai de 30 jours maximum.",
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
      intro: "Notre service utilise uniquement des cookies essentiels au fonctionnement de la plateforme. Nous n'utilisons pas de cookies publicitaires ou de suivi comportemental. Les cookies essentiels ne nécessitent pas de consentement préalable selon la directive ePrivacy.",
      items: [
        "Authentification sécurisée",
        "Préférences utilisateur",
        "Performance du service"
      ]
    },
    {
      id: 6,
      title: "Contact",
      intro: "Nous sommes à votre disposition pour toute question relative à la protection de vos données personnelles. Notre équipe s'engage à vous apporter une réponse claire et précise dans les meilleurs délais.",
      content: "Pour toute question sur vos données, notre équipe est à votre disposition :"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300" 
        role="dialog" 
        aria-labelledby="privacy-title"
      >
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-emerald-500" aria-hidden="true" />
                </div>
                <h1 id="privacy-title" className="text-2xl font-bold text-gray-200">
                  Politique de confidentialité
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
                Chez MiRemover, nous valorisons votre vie privée et nous nous engageons à protéger vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations 
                lorsque vous utilisez notre service.
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
                                <Mail className="w-5 h-5 text-emerald-500" />
                              </div>
                              <a 
                                href="mailto:contact@miremover.com" 
                                className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-2 py-1"
                              >
                                contact@miremover.com
                              </a>
                            </div>
                            <p className="text-gray-400 text-sm">
                              Notre équipe s'engage à répondre à toutes vos questions dans un délai de 48 heures ouvrables.
                              Veuillez préciser dans l'objet de votre message qu'il s'agit d'une demande concernant vos données personnelles.
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
                    Informations complémentaires
                  </h2>
                  
                  <p className="text-gray-400 mb-4">
                    Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                    Les modifications entrent en vigueur dès leur publication sur notre site. Nous vous encourageons 
                    à consulter régulièrement cette page pour rester informé des éventuelles mises à jour.
                  </p>
                  
                  <p className="text-gray-400 mb-4">
                    En utilisant notre service, vous acceptez les termes de cette politique de confidentialité. 
                    Si vous n'êtes pas d'accord avec ces termes, veuillez ne pas utiliser notre service.
                  </p>
                  
                  <div className="mt-6 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                    <h3 className="text-md font-medium text-gray-300 mb-2">Autorité de contrôle</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD, 
                      vous avez le droit d'introduire une réclamation auprès de votre autorité de contrôle nationale.
                    </p>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-emerald-500" />
                      <a 
                        href="https://www.cnil.fr/fr/plaintes" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:text-emerald-400 transition-colors text-sm"
                      >
                        CNIL - Commission Nationale de l'Informatique et des Libertés
                      </a>
                    </div>
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
                  'J\'accepte la politique'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}