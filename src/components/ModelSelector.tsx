import React, { useState } from 'react';
import { ImageIcon, Download, PaintBucket, Clock } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '../stores/authStore';
import { ProgressBar } from './ProgressBar';
import { useAdminSettingsStore } from '../stores/adminSettingsStore';

interface ModelSelectorProps {
  onSubmit: (e: React.FormEvent) => void;
  hasPendingFiles: boolean;
  hasCompletedFiles?: boolean;
  onDownloadAllJpg?: () => void;
  onApplyWhiteBackground?: () => void;
  hasWhiteBackground?: boolean;
  isProcessing?: boolean;
  totalToProcess?: number;
  completed?: number;
  pendingCount?: number;
}

export function ModelSelector({ 
  onSubmit, 
  hasPendingFiles,
  hasCompletedFiles = true,
  onDownloadAllJpg,
  onApplyWhiteBackground,
  hasWhiteBackground,
  isProcessing,
  totalToProcess = 0,
  completed = 0,
  pendingCount = 0
}: ModelSelectorProps) {
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { settings } = useAdminSettingsStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onSubmit(e);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <ProgressBar
          total={totalToProcess}
          completed={completed}
          maxFreeImages={settings.free_user_max_images}
        />
      </div>

      <div className="flex items-center gap-4">
        {pendingCount > 0 && (
          <div className="bg-slate-800/50 px-4 py-2 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-300">
              {pendingCount} image{pendingCount > 1 ? 's' : ''} en attente
            </span>
          </div>
        )}

        <div className="flex gap-2">
          {/* Bouton de fond blanc avec tooltip */}
          <div className="relative group">
            <button
              type="button"
              onClick={onApplyWhiteBackground}
              className={`h-[46px] w-[46px] rounded-xl flex items-center justify-center transition-all duration-200 ${
                hasWhiteBackground 
                  ? 'bg-white text-emerald-500' 
                  : 'bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-emerald-500'
              }`}
              title={hasWhiteBackground ? "Retirer le fond blanc" : "Appliquer un fond blanc"}
            >
              <PaintBucket className="w-5 h-5" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {hasWhiteBackground ? "Retirer le fond blanc" : "Appliquer un fond blanc"}
            </div>
          </div>

          {/* Bouton de téléchargement avec animation */}
          <div className="relative group">
            <button
              type="button"
              onClick={onDownloadAllJpg}
              disabled={!hasCompletedFiles}
              className={`relative h-[46px] w-[46px] rounded-xl flex items-center justify-center transition-all duration-300 ${
                hasCompletedFiles
                  ? 'bg-emerald-500 text-white hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/25'
                  : 'bg-slate-800/50 text-gray-600 cursor-not-allowed'
              }`}
              title="Tout télécharger en JPG"
            >
              {/* Effet de pulsation */}
              {hasCompletedFiles && (
                <div className="absolute inset-0 bg-emerald-500 rounded-xl animate-ping opacity-20"></div>
              )}
              
              {/* Effet de brillance */}
              {hasCompletedFiles && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl overflow-hidden"></div>
              )}

              <Download className={`w-5 h-5 ${hasCompletedFiles ? 'animate-bounce' : ''}`} />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {hasCompletedFiles ? "Tout télécharger en JPG" : "Aucune image à télécharger"}
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isProcessing || !hasPendingFiles}
            className={`btn-header-primary h-[46px] px-6 min-w-[200px] ${
              !isProcessing && hasPendingFiles
                ? ''
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span>
              {!user ? "Se connecter pour traiter" : "Traiter les images"}
            </span>
          </button>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}