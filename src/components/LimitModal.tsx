import React from 'react';
import { X, LogIn } from 'lucide-react';

interface LimitModalProps {
  onClose: () => void;
  onLogin: () => void;
  isImageLimit?: boolean;
}

export function LimitModal({ onClose, onLogin, isImageLimit }: LimitModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <LogIn className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-lg font-medium text-gray-200">
                {isImageLimit 
                  ? "Limite d'images atteinte"
                  : "Connectez-vous pour continuer"}
              </p>
            </div>
            <button onClick={onClose} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-400">
            {isImageLimit 
              ? "Vous avez atteint la limite de 1000 images traitées. Veuillez contacter le support pour augmenter votre limite."
              : "Connectez-vous pour profiter d'un nombre illimité de traitements et accéder à toutes les fonctionnalités."}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors"
            >
              Plus tard
            </button>
            {!isImageLimit && (
              <button
                onClick={() => {
                  onClose();
                  onLogin();
                }}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                Se connecter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}