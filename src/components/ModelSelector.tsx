import React, { useState } from 'react';
import { ImageIcon, Download, PaintBucket, Clock, Trash2, Maximize2 } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { ResizeModal } from './ResizeModal';
import { useAuthStore } from '../stores/authStore';
import { useAdminSettingsStore } from '../stores/adminSettingsStore';
import { ProgressBar } from './ProgressBar';

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
  onApplyResize?: (dimensions: { width: number; height: number; tool: string; mode: 'resize' | 'ai' | 'both' } | null) => void;
  outputDimensions?: { width: number; height: number; tool?: string; mode?: 'resize' | 'ai' | 'both' } | null;
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
  pendingCount = 0,
  onApplyResize,
  outputDimensions
}: ModelSelectorProps) {
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const { settings } = useAdminSettingsStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onSubmit(e);
  };

  const handleResizeClick = () => {
    setShowResizeModal(true);
  };

  const isResizeEnabled = outputDimensions?.width && outputDimensions?.height && outputDimensions.mode !== 'ai';
  const mode = outputDimensions?.mode || 'both';

  const getButtonText = () => {
    if (!user) return "Se connecter pour traiter";
    switch (mode) {
      case 'resize': return "Redimensionner les images";
      case 'ai': return "Traitement IA";
      case 'both': return "Redimensionnement + IA";
      default: return "Traiter les images";
    }
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
          <div className="relative">
            <button
              type="button"
              onClick={handleResizeClick}
              className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                isResizeEnabled
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title={outputDimensions ? "Modifier le traitement" : "Configurer le traitement"}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            {isResizeEnabled && (
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                {outputDimensions?.width}×{outputDimensions?.height}
              </div>
            )}
          </div>

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
              <span>{getButtonText()}</span>
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
          onApply={(dimensions) => {
            if (onApplyResize) {
              onApplyResize(dimensions);
            }
            setShowResizeModal(false);
          }}
          initialConfig={outputDimensions ? {
            enabled: true,
            dimensions: outputDimensions,
            tool: outputDimensions.tool || 'imagemagick',
            mode: outputDimensions.mode || 'both'
          } : undefined}
        />
      )}
    </div>
  );
}