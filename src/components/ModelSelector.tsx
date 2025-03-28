import React, { useState } from 'react';
import { ImageIcon, Download, PaintBucket, Clock, Trash2, Maximize2, Settings } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '../stores/authStore';
import { ProgressBar } from './ProgressBar';
import { useAdminSettingsStore } from '../stores/adminSettingsStore';
import { ResizeModal } from './ResizeModal';

interface ModelSelectorProps {
  onSubmit: (e: React.FormEvent) => void;
  hasPendingFiles: boolean;
  hasCompletedFiles?: boolean;
  onDownloadAllJpg?: () => void;
  onApplyWhiteBackground?: () => void;
  onDeleteAll?: () => void;
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
  onDeleteAll,
  hasWhiteBackground,
  isProcessing,
  totalToProcess = 0,
  completed = 0,
  pendingCount = 0
}: ModelSelectorProps) {
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const { settings } = useAdminSettingsStore();
  const [resizeConfig, setResizeConfig] = useState(() => {
    const saved = localStorage.getItem('resize-config');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      dimensions: { width: 1000, height: 1500 },
      model: 'imagemagick',
      bypass: false
    };
  });

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
            onClick={() => setShowResizeModal(true)}
            className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 relative group ${
              resizeConfig.enabled 
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
            }`}
            title="Redimensionner les images"
          >
            {resizeConfig.enabled ? (
              <Settings className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
            {resizeConfig.enabled && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {resizeConfig.dimensions.width}×{resizeConfig.dimensions.height}px
                {resizeConfig.bypass && ' (Ignoré)'}
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={onApplyWhiteBackground}
            disabled={!hasCompletedFiles}
            className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              hasWhiteBackground
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            } ${!hasCompletedFiles ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
            title={hasWhiteBackground ? "Retirer le fond blanc" : "Appliquer un fond blanc à toutes les images"}
          >
            <PaintBucket className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onDownloadAllJpg}
            disabled={!hasCompletedFiles}
            className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              hasCompletedFiles 
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                : 'bg-slate-700 opacity-50 cursor-not-allowed hover:scale-100'
            }`}
            title="Tout télécharger en JPG"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onDeleteAll}
            disabled={!hasCompletedFiles && !hasPendingFiles}
            className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              hasCompletedFiles || hasPendingFiles
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                : 'bg-slate-700 opacity-50 cursor-not-allowed hover:scale-100'
            }`}
            title="Supprimer toutes les photos"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isProcessing || !hasPendingFiles}
            className={`h-[46px] px-6 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 min-w-[200px] ${
              !isProcessing && hasPendingFiles
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:scale-105 active:scale-95'
                : 'bg-slate-800/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
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

      {showResizeModal && (
        <ResizeModal
          onClose={() => setShowResizeModal(false)}
          onApply={(options) => {
            const newConfig = {
              enabled: options.enabled,
              dimensions: {
                width: options.width,
                height: options.height
              },
              model: options.type,
              bypass: options.bypass
            };
            setResizeConfig(newConfig);
            localStorage.setItem('resize-config', JSON.stringify(newConfig));
            setShowResizeModal(false);
          }}
          initialConfig={resizeConfig}
        />
      )}
    </div>
  );
}