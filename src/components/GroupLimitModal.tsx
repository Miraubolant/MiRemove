import React from 'react';
import { X, AlertTriangle, Users } from 'lucide-react';

interface GroupLimitModalProps {
  onClose: () => void;
  message: string;
}

export function GroupLimitModal({ onClose, message }: GroupLimitModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/10 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-lg font-medium text-gray-200">
                Limite de groupe atteinte
              </p>
            </div>
            <button onClick={onClose} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 p-4 bg-red-500/5 rounded-lg border border-red-500/20">
            <Users className="w-5 h-5 text-red-500" />
            <p className="text-gray-400">
              {message}
            </p>
          </div>

          <p className="text-gray-400">
            Veuillez contacter votre administrateur pour augmenter la limite du groupe.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}