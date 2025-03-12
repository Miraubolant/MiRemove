import React, { useState, useEffect } from 'react';
import { Cookie, X, ChevronDown, Shield, BarChart3, Settings, Info } from 'lucide-react';
import Cookies from 'js-cookie';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(true); // Initialisé à true pour être déroulé par défaut
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    functional: true
  });

  useEffect(() => {
    const hasConsent = Cookies.get(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setShowDetails(true); // S'assure que les détails sont visibles à l'ouverture
      }, 1000);
      return () => clearTimeout(timer);
    }

    const savedPreferences = Cookies.get(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error('Erreur lors du chargement des préférences:', e);
      }
    }
  }, []);

  const handleAccept = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'true', { expires: 365 });
    Cookies.set(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences), { expires: 365 });
    setIsVisible(false);
  };

  const handleRefuse = () => {
    const minimalPreferences = {
      essential: true,
      analytics: false,
      functional: false
    };
    Cookies.set(COOKIE_CONSENT_KEY, 'false', { expires: 365 });
    Cookies.set(COOKIE_PREFERENCES_KEY, JSON.stringify(minimalPreferences), { expires: 365 });
    setIsVisible(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return;
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleRefuse} />

      <div className="relative bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
        {/* En-tête avec effet de gradient */}
        <div className="relative px-6 py-4 border-b border-gray-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent"></div>
          <div className="relative flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-emerald-500/10 p-3 rounded-xl transform group-hover:scale-110 transition-transform duration-300">
                <Cookie className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Vos préférences de confidentialité
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Nous utilisons des cookies pour améliorer votre expérience
              </p>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="relative group p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Section des préférences */}
          <div className={`space-y-4 transition-all duration-500 ease-in-out ${
            showDetails ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'
          } overflow-hidden`}>
            {/* Cookies essentiels */}
            <div className="relative group bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-200">Cookies essentiels</h4>
                    <div className="bg-emerald-500/10 px-2 py-0.5 rounded text-xs text-emerald-500">
                      Requis
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Nécessaires au fonctionnement du site
                  </p>
                </div>
                <div className="bg-emerald-500/10 px-3 py-1 rounded-lg">
                  <span className="text-xs text-emerald-500">Activé</span>
                </div>
              </div>
            </div>

            {/* Cookies analytiques */}
            <div className="relative group bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-lg transform group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-200">Cookies analytiques</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Nous aident à améliorer votre expérience
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('analytics')}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    preferences.analytics ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5 transition-transform duration-300 ${
                    preferences.analytics ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Cookies fonctionnels */}
            <div className="relative group bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="relative flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-200">Cookies fonctionnels</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Personnalisent votre expérience
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('functional')}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    preferences.functional ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5 transition-transform duration-300 ${
                    preferences.functional ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Info supplémentaire */}
            <div className="bg-slate-800/30 rounded-xl p-4 flex items-start gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg mt-0.5">
                <Info className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience sur notre site. Les cookies essentiels sont nécessaires au fonctionnement du site, tandis que les cookies optionnels nous aident à comprendre comment vous utilisez notre service et à personnaliser votre expérience.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700/50">
            <button
              onClick={handleRefuse}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={handleAccept}
              className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative">Accepter la sélection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}