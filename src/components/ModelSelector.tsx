import React, { useState } from 'react';
import { ImageIcon, Download, Clock, Trash2, Maximize2, AlertTriangle } from 'lucide-react';
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
  onDeleteAll,
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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteButtonTimeout, setDeleteButtonTimeout] = useState<number | null>(null);
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

  const handleDeleteClick = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      const timeout = window.setTimeout(() => {
        setIsConfirmingDelete(false);
      }, 3000) as unknown as number;
      setDeleteButtonTimeout(timeout);
      return;
    }

    // Clear any existing timeout
    if (deleteButtonTimeout) {
      window.clearTimeout(deleteButtonTimeout);
      setDeleteButtonTimeout(null);
    }

    // Reset state and execute delete
    setIsConfirmingDelete(false);
    onDeleteAll?.();
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (deleteButtonTimeout) {
        window.clearTimeout(deleteButtonTimeout);
      }
    };
  }, [deleteButtonTimeout]);

  // Only show dimensions badge if mode is 'resize' or 'both'
  const shouldShowDimensions = outputDimensions?.mode && ['resize', 'both'].includes(outputDimensions.mode);

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
                outputDimensions 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title={outputDimensions ? "Modifier le traitement" : "Configurer le traitement"}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            {shouldShowDimensions && outputDimensions && (
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                {outputDimensions.width}×{outputDimensions.height}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onDownloadAllJpg}
            disabled={!hasCompletedFiles}
            className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              hasCompletedFiles 
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                : 'bg-slate-700 opacity-50 cursor-not-allowed hover:scale-100'
            }`}
            title="Télécharger en JPG"
          >
            <Download className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={!hasCompletedFiles && !hasPendingFiles}
              className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                isConfirmingDelete
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : hasCompletedFiles || hasPendingFiles
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                    : 'bg-slate-700 opacity-50 cursor-not-allowed hover:scale-100'
              }`}
              title={isConfirmingDelete ? "Confirmer la suppression" : "Supprimer toutes les photos"}
            >
              {isConfirmingDelete ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
            {isConfirmingDelete && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
                Cliquez à nouveau pour confirmer
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
              </div>
            )}
          </div>

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