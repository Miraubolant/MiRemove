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
          <button
            type="button"
            onClick={onApplyWhiteBackground}
            className={`relative group overflow-hidden h-[46px] w-[46px] flex items-center justify-center rounded-xl transition-all duration-300 ${
              hasWhiteBackground
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title={hasWhiteBackground ? "Retirer le fond blanc" : "Appliquer un fond blanc à toutes les images"}
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <PaintBucket className="w-5 h-5 relative" />
          </button>

          <button
            type="button"
            onClick={onDownloadAllJpg}
            className="relative group overflow-hidden h-[46px] w-[46px] flex items-center justify-center rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-all duration-300"
            title="Tout télécharger en JPG"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Download className="w-5 h-5 relative" />
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isProcessing || !hasPendingFiles}
            className={`relative group overflow-hidden h-[46px] px-6 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 min-w-[200px] ${
              !isProcessing && hasPendingFiles
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-800/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="relative flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              <span>
                {!user ? "Se connecter pour traiter" : "Traiter les images"}
              </span>
            </div>
          </button>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}