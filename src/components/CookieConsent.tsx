import React, { useState, useEffect } from 'react';
import { Cookie, X, ChevronDown, Shield, Info, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    const hasAccepted = Cookies.get('cookie-consent');
    const hasSeenLegal = sessionStorage.getItem('seen-legal');
    
    if (!hasAccepted && !hasSeenLegal) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set('cookie-consent', 'true', { expires: 365 });
    setIsVisible(false);
  };

  const handleDecline = () => {
    Cookies.set('cookie-consent', 'false', { expires: 7 });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500"
        style={{ animationFillMode: 'forwards' }}
      />

      <div 
        className="relative w-full max-w-2xl animate-in zoom-in-95 duration-500"
        style={{ animationFillMode: 'forwards' }}
      >
        <div className="relative bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50 animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.1),transparent)] animate-[spin_8s_linear_infinite]" />
          </div>
          
          <div className="relative p-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-500">
                  <Cookie className="w-6 h-6 text-white transform group-hover:rotate-12 transition-transform duration-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Votre vie privée
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Nous utilisons des cookies pour améliorer votre expérience
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="relative group p-2 rounded-lg text-gray-400 hover:text-gray-300 transition-colors hover:bg-white/5"
            >
              <X className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="px-6 space-y-4 transition-all duration-500 ease-in-out">
            <div className="space-y-4">
              <div className="group flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 transform hover:scale-[1.02]">
                <Shield className="w-5 h-5 text-emerald-500 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <h3 className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                    Cookies essentiels
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                    Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 transform hover:scale-[1.02]">
                <Info className="w-5 h-5 text-emerald-500 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <h3 className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                    Cookies analytiques
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                    Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 transform hover:scale-[1.02]">
                <Bell className="w-5 h-5 text-emerald-500 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <h3 className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                    Cookies de préférences
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                    Permettent de sauvegarder vos préférences et personnaliser votre expérience.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm py-4">
              <Link
                to="/privacy"
                className="relative group text-emerald-500 hover:text-emerald-400 transition-colors"
                onClick={() => {
                  setIsVisible(false);
                  sessionStorage.setItem('seen-legal', 'true');
                }}
              >
                <span>Politique de confidentialité</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/terms"
                className="relative group text-emerald-500 hover:text-emerald-400 transition-colors"
                onClick={() => {
                  setIsVisible(false);
                  sessionStorage.setItem('seen-legal', 'true');
                }}
              >
                <span>Conditions d'utilisation</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          <div className="relative p-6 pt-0">
            <div className="absolute top-0 left-4 right-4 h-px overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-700/50 to-transparent animate-shimmer" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="group w-full sm:w-auto order-1 sm:order-none px-4 py-2.5 text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <span>Détails</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    showDetails ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
                <button
                  onClick={handleDecline}
                  className="relative group flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-gray-200 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative">Refuser</span>
                </button>
                <button
                  onClick={handleAccept}
                  className="relative group flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative">Accepter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}