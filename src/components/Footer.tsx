import React from 'react';
import { Wand2, Coffee, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-800/50 relative overflow-hidden">
      {/* Fond uni comme sur les autres pages */}
      <div className="absolute inset-0 bg-slate-900 backdrop-blur-md" />
      
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        {/* Section principale */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* À propos */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 group">
              <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                {/* Effet de lueur supprimé */}
                
                {/* Conteneur du logo avec effets */}
                <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-500 p-3.5 sm:p-4 rounded-2xl shadow-lg shadow-emerald-500/20 overflow-hidden">
                  {/* Icône avec rotation */}
                  <Wand2 
                    className="w-7 h-7 sm:w-8 sm:h-8 text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500"
                  />
                  
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
              
              {/* Titre et sous-titre avec nouveau style */}
              <div>
                <div className="relative group">
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    <span className="text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text">
                      MiRemover
                    </span>
                  </h3>
                  <p className="text-sm text-emerald-400/90 font-medium mt-1">
                    Traitement d'images intelligent
                  </p>
                  
                  {/* Ligne de soulignement améliorée */}
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              <p className="text-gray-300 leading-relaxed text-base">
                Un outil simple et puissant pour supprimer l'arrière-plan de vos images en quelques clics grâce à l'intelligence artificielle.
              </p>
              
              <div className="flex items-start gap-4 p-5 bg-slate-800 rounded-2xl border border-slate-700/30 shadow-lg hover:border-slate-700/50 transition-all duration-300">
                <div className="bg-emerald-500/20 p-2.5 rounded-full">
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Vos images sont traitées instantanément et ne sont jamais stockées sur nos serveurs. Votre confidentialité est notre priorité.
                </p>
              </div>
            </div>
          </div>
          
          {/* Support */}
          <div className="space-y-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full w-fit border border-emerald-500/20">
              Soutenez le projet
            </h3>
            
            {/* Bouton Buy me a coffee réduit */}
            <a
              href="https://buymeacoffee.com/victorim"
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-fit"
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-[#FFDD00] to-[#FBB034] rounded-xl transition-all duration-500 transform hover:scale-[1.03] hover:shadow-lg hover:shadow-[#FFDD00]/20">
                <div className="relative px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#0D0C0C]/10 p-1.5 rounded-full">
                      <Coffee className="w-4 h-4 text-[#0D0C0C] transform group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <span className="text-sm font-semibold text-[#0D0C0C]">
                      Buy me a coffee
                    </span>
                    <div className="bg-[#0D0C0C] text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-md">
                      3 €
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
        
        {/* Section du bas */}
        <div className="py-8 border-t border-slate-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="bg-slate-800/70 px-5 py-3 rounded-2xl border border-slate-700/40 shadow-lg hover:border-emerald-500/30 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-2 rounded-xl shadow-md shadow-emerald-500/20">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-300">Créé avec passion par</span>
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent font-bold">Miraubolant</span>
                <span className="flex space-x-1">
                  <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link to="/privacy" className="px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-slate-800/80 transition-all duration-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Confidentialité</span>
              </Link>
              <Link to="/terms" className="px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-slate-800/80 transition-all duration-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-500">
                  <path d="M10 21h-2a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
                  <path d="M14 21v-5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v5" />
                  <path d="M9 9V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                </svg>
                <span>Conditions</span>
              </Link>
              <Link to="/gdpr" className="px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-slate-800/80 transition-all duration-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-500">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M8 7h8" />
                  <path d="M8 12h8" />
                  <path d="M8 17h5" />
                </svg>
                <span>RGPD</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}