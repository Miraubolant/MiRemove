import React from 'react';
import { Wand2, Coffee, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-6 sm:mt-8 border-t border-slate-800/60 relative overflow-hidden">
      {/* Fond harmonisé avec le header */}
      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Section principale redesignée */}
        <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {/* À propos avec style harmonisé */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 group">
              <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 p-3.5 sm:p-4 rounded-2xl shadow-xl shadow-emerald-500/25 overflow-hidden border border-emerald-500/20">
                  <Wand2 
                    className="w-7 h-7 sm:w-8 sm:h-8 text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500"
                  />
                  {/* Effet de brillance harmonisé */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
              
              <div>
                <div className="relative group">
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-white via-gray-100 to-emerald-100 bg-clip-text text-transparent">
                      MiRemover
                    </span>
                  </h3>
                  <p className="text-sm text-emerald-400/90 font-medium mt-1">
                    Traitement d'images intelligent
                  </p>
                  
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed text-base">
                Un outil simple et puissant pour supprimer l'arrière-plan de vos images en quelques clics grâce à l'intelligence artificielle.
              </p>
              
              <div className="group flex items-start gap-4 p-5 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/60 hover:border-emerald-500/40 shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="bg-emerald-500/20 p-2.5 rounded-full group-hover:bg-emerald-500/30 transition-all duration-300">
                  <Shield className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  Vos images sont traitées instantanément et ne sont jamais stockées sur nos serveurs. Votre confidentialité est notre priorité.
                </p>
              </div>
            </div>
          </div>
          
          {/* Support redesigné */}
          <div className="space-y-8">
            <div className="bg-emerald-500/10 backdrop-blur-sm px-4 py-2.5 rounded-full w-fit border border-emerald-500/30 shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                Soutenez le projet
              </h3>
            </div>
            
            <a
              href="https://buymeacoffee.com/victorim"
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-fit"
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-[#FFDD00] via-[#FBB034] to-[#FF8C00] rounded-xl transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-[#FFDD00]/25 border border-[#FBB034]/30">
                <div className="relative px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#0D0C0C]/15 p-2 rounded-full group-hover:bg-[#0D0C0C]/20 transition-all duration-300">
                      <Coffee className="w-5 h-5 text-[#0D0C0C] transform group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-[#0D0C0C]">
                        Buy me a coffee
                      </span>
                      <span className="text-xs text-[#0D0C0C]/70 font-medium">
                        Support the development
                      </span>
                    </div>
                    <div className="bg-[#0D0C0C] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                      3 €
                    </div>
                  </div>
                </div>
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </a>
          </div>
        </div>
        
        {/* Section du bas modernisée */}
        <div className="py-6 sm:py-8 border-t border-slate-800/60">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Link 
                to="/privacy" 
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-emerald-500/40 transition-all duration-300 transform hover:scale-105"
              >
                <div className="bg-emerald-500/20 p-1 rounded-lg group-hover:bg-emerald-500/30 transition-all duration-300">
                  <Shield className="w-4 h-4 text-emerald-500 group-hover:text-emerald-400" />
                </div>
                <span className="text-sm font-medium">Confidentialité</span>
              </Link>
              
              <Link 
                to="/terms" 
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-blue-500/40 transition-all duration-300 transform hover:scale-105"
              >
                <div className="bg-blue-500/20 p-1 rounded-lg group-hover:bg-blue-500/30 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500 group-hover:text-blue-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Conditions</span>
              </Link>
              
              <Link 
                to="/gdpr" 
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105"
              >
                <div className="bg-purple-500/20 p-1 rounded-lg group-hover:bg-purple-500/30 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-500 group-hover:text-purple-400">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M8 7h8" />
                    <path d="M8 12h8" />
                    <path d="M8 17h5" />
                  </svg>
                </div>
                <span className="text-sm font-medium">RGPD</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}