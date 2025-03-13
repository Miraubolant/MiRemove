import React, { useEffect } from 'react';
import { FileText, ArrowLeft, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Données des sections extraites pour une meilleure maintenance
const sections = [
  {
    id: 1,
    title: "Bases légales",
    items: [
      "Votre consentement explicite",
      "Exécution de nos services",
      "Obligations réglementaires",
      "Intérêts légitimes"
    ]
  },
  {
    id: 2,
    title: "Vos droits garantis",
    items: [
      "Accès complet",
      "Correction immédiate",
      "Suppression définitive",
      "Portabilité simplifiée",
      "Opposition possible",
      "Traitement limité"
    ]
  },
  {
    id: 3,
    title: "Conservation",
    items: [
      "Compte : jusqu'à suppression",
      "Images : effacées après usage",
      "Logs : 12 mois maximum",
      "Backups : 30 jours"
    ]
  },
  {
    id: 4,
    title: "Sécurité des données",
    items: [
      "Hébergement européen",
      "Aucun transfert hors UE",
      "Partenaires conformes",
      "Protection renforcée"
    ]
  },
  {
    id: 5,
    title: "Exercer vos droits",
    items: [
      "Contact direct DPO",
      "Réponse sous 30 jours",
      "Processus simplifié",
      "Identité vérifiée"
    ]
  }
];

// Composant pour les sections avec listes
const Section = React.memo(({ id, title, items, children }) => (
  <section className="py-4 first:pt-0 last:pb-0">
    <h2 className="text-xl font-semibold text-gray-200 mb-4">
      {id}. {title}
    </h2>
    {items ? (
      <ul className="list-disc list-inside space-y-2 text-gray-400">
        {items.map((item, index) => (
          <li key={`item-${id}-${index}`}>{item}</li>
        ))}
      </ul>
    ) : (
      children
    )}
  </section>
));

Section.displayName = 'Section';

export function GDPR() {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem('seen-legal', 'true');
    
    // Ajouter un gestionnaire pour le bouton Echap
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  const renderSections = () => {
    return sections.map(section => (
      <Section key={`section-${section.id}`} {...section} />
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300" 
        role="dialog" 
        aria-labelledby="gdpr-title"
      >
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <FileText className="w-6 h-6 text-emerald-500" aria-hidden="true" />
                </div>
                <h1 id="gdpr-title" className="text-2xl font-bold text-gray-200">
                  Conformité RGPD
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
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto" tabIndex="0">
            <div className="prose prose-invert max-w-none">
              {/* Introduction text */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-200 mb-4">
                  Notre engagement pour votre vie privée
                </h2>
                <p className="text-gray-400 mb-3">
                  Chez Miraubolant, nous pensons que la protection de vos données personnelles est un droit fondamental. 
                  Cette page détaille comment nous traitons vos informations, conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
                <p className="text-gray-400 mb-3">
                  Nous collectons et traitons uniquement les données nécessaires pour vous fournir nos services. Chaque information que vous nous 
                  confiez est traitée avec le plus grand soin, dans un cadre légal strict et transparent.
                </p>
                <p className="text-gray-400">
                  Nous avons conçu nos services selon les principes de <span className="text-emerald-500">privacy by design</span>, 
                  en intégrant la protection des données dès la conception de nos outils, et non comme une réflexion après-coup.
                </p>
              </div>

              <div className="space-y-8">
                {/* Render regular sections */}
                {renderSections()}

                {/* Special section with custom content */}
                <Section id={6} title="Délégué à la Protection">
                  <p className="text-gray-400 mb-3">
                    Notre Délégué à la Protection des Données (DPO) est responsable de veiller au respect de la réglementation
                    et de vos droits en matière de données personnelles. Son rôle est de s'assurer que nos pratiques respectent
                    la législation en vigueur et de répondre à vos questions concernant le traitement de vos informations.
                  </p>
                  <p className="text-gray-400">
                    Notre DPO est à votre écoute :<br />
                    <a 
                      href="mailto:contact@miraubolant.com" 
                      className="text-emerald-500 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
                      aria-label="Contacter notre délégué à la protection des données"
                    >
                      contact@miraubolant.com
                    </a>
                  </p>
                </Section>

                {/* Additional section for conclusion */}
                <Section id={7} title="Transparence et évolution">
                  <p className="text-gray-400 mb-3">
                    Nous nous engageons à vous informer de toute modification significative de notre politique de protection des données.
                    Ces mises à jour seront communiquées par email et via une notification sur notre plateforme.
                  </p>
                  <p className="text-gray-400">
                    La dernière mise à jour de cette politique a été effectuée le <span className="text-emerald-500">13 mars 2025</span>. 
                    Les versions précédentes restent consultables sur demande auprès de notre DPO.
                  </p>
                </Section>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="text-gray-400 hover:text-emerald-500 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-2 py-1"
                aria-label="Retour à l'accueil"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Retour à l'accueil</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}