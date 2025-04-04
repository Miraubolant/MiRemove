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
                {/* Effet de lueur derrière le logo */}
                <div className="absolute inset-0 bg-emerald-500/30 rounded-2xl blur-2xl transition-all duration-500"></div>
                
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
        <div className="py-6 border-t border-slate-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>Créé avec</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>par</span>
              <span className="text-emerald-500 font-semibold">Miraubolant</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link to="/privacy" className="text-gray-400 hover:text-emerald-500 transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-emerald-500 transition-colors">
                Conditions
              </Link>
              <Link to="/gdpr" className="text-gray-400 hover:text-emerald-500 transition-colors">
                RGPD
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}