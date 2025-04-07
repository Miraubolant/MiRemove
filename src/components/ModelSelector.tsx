import React, { useState, useEffect } from 'react';
import { ImageIcon, Download, Clock, Trash2, Maximize2, AlertTriangle, Scissors, PaintBucket, Wand2, Layers, Sparkles } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { ResizeModal } from './ResizeModal';
import { useAuthStore } from '../stores/authStore';
import { useAdminSettingsStore } from '../stores/adminSettingsStore';
import { ProgressBar } from './ProgressBar';

// Pour la compatibilité avec le code original
type ProcessingMode = 'resize' | 'ai' | 'both' | 'crop-head' | 'all';

interface ProcessingOptions {
  width: number;
  height: number;
  tool: string;
  mode: ProcessingMode;
}

interface ModelSelectorProps {
  onSubmit: (e: React.FormEvent) => void;
  hasPendingFiles: boolean;
  hasCompletedFiles?: boolean;
  onDownloadAllJpg?: () => void;
  onDeleteAll?: () => void;
  hasWhiteBackground?: boolean;
  onApplyWhiteBackground?: () => void;
  isProcessing?: boolean;
  totalToProcess?: number;
  completed?: number;
  pendingCount?: number;
  onApplyResize?: (dimensions: { width: number; height: number; tool: string; mode: ProcessingMode } | null) => void;
  outputDimensions?: { width: number; height: number; tool?: string; mode?: ProcessingMode } | null;
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
  outputDimensions,
  hasWhiteBackground = false,
  onApplyWhiteBackground
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

  const handleDownload = () => {
    if (!hasCompletedFiles) return;
    onDownloadAllJpg?.();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (deleteButtonTimeout) {
        window.clearTimeout(deleteButtonTimeout);
      }
    };
  }, [deleteButtonTimeout]);

  // Vérifier si des options de traitement sont actives - par défaut, le mode 'ai' est toujours considéré comme actif
  const hasActiveOptions = outputDimensions && (outputDimensions.mode || true);

  // Convertir le mode en propriétés visuelles
  const hasCropHead = outputDimensions?.mode === 'crop-head' || outputDimensions?.mode === 'all';
  const hasRemoveBackground = outputDimensions?.mode === 'ai' || outputDimensions?.mode === 'both' || outputDimensions?.mode === 'all';
  const hasResize = outputDimensions?.width && outputDimensions?.height && 
                    (outputDimensions?.mode === 'resize' || outputDimensions?.mode === 'both' || outputDimensions?.mode === 'all');

  // Déterminer l'icône en fonction du mode
  const getModeIcon = () => {
    if (!outputDimensions || !outputDimensions.mode) return ImageIcon;
    
    switch (outputDimensions.mode) {
      case 'all':
        return Sparkles;
      case 'crop-head':
        return Scissors;
      case 'ai':
        return Wand2;
      case 'both':
        return Layers;
      case 'resize':
        return Maximize2;
      default:
        return ImageIcon;
    }
  };

  // Texte du bouton principal en fonction du mode
  const getButtonText = () => {
    if (!user) return "Se connecter pour traiter";
    if (!outputDimensions || !outputDimensions.mode) return "Configurer le traitement";
    
    switch (outputDimensions.mode) {
      case 'all':
        return "Tous les traitements";
      case 'crop-head':
        return "Redimensionner + Couper tête";
      case 'ai':
        return "Supprimer l'arrière-plan";
      case 'both':
        return "Redimensionner + Suppr. fond";
      case 'resize':
        return "Redimensionner uniquement";
      default:
        return "Traiter les images";
    }
  };

  const ModeIcon = getModeIcon();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <ProgressBar
          total={totalToProcess}
          completed={completed}
          maxFreeImages={settings.free_user_max_images}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {pendingCount > 0 && (
          <div className="bg-slate-800/70 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-700/50">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-gray-300">
              {pendingCount} image{pendingCount > 1 ? 's' : ''} en attente
            </span>
          </div>
        )}

        <div className="flex gap-3">
          {/* Bouton dimensions et paramètres */}
          <div className="relative mr-2">
            <button
              type="button"
              onClick={handleResizeClick}
              className="h-[48px] w-[48px] flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
              title={outputDimensions ? "Modifier le traitement" : "Configurer le traitement"}
              aria-label="Configurer le traitement"
            >
              <ModeIcon className="w-5 h-5" />
            </button>
            
            {/* Badge pour dimensions - uniquement si dimensions spécifiées et mode avec resize */}
            {outputDimensions && outputDimensions.width > 0 && outputDimensions.height > 0 && 
             (outputDimensions.mode === 'resize' || outputDimensions.mode === 'both' || 
              outputDimensions.mode === 'crop-head' || outputDimensions.mode === 'all') && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-lg min-w-[42px] text-center">
                {outputDimensions.width}×{outputDimensions.height}
              </div>
            )}
          </div>

          {/* Bouton fond blanc */}
          <button
            type="button"
            onClick={onApplyWhiteBackground}
            className={`h-[48px] w-[48px] flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
              hasWhiteBackground 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Appliquer un fond blanc"
          >
            <PaintBucket className="w-5 h-5" />
          </button>

          {/* Bouton télécharger */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={!hasCompletedFiles}
            className={`h-[48px] w-[48px] flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
              hasCompletedFiles 
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                : 'bg-slate-800 opacity-50 cursor-not-allowed hover:scale-100 border border-slate-700/50'
            }`}
            title="Télécharger en JPG"
            aria-label="Télécharger toutes les images en JPG"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Bouton supprimer */}
          <div className="relative">
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={!hasCompletedFiles && !hasPendingFiles}
              className={`h-[48px] w-[48px] flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                isConfirmingDelete
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : hasCompletedFiles || hasPendingFiles
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600'
                    : 'bg-slate-800 opacity-50 cursor-not-allowed hover:scale-100 border border-slate-700/50'
              }`}
              title={isConfirmingDelete ? "Confirmer la suppression" : "Supprimer toutes les photos"}
              aria-label="Supprimer toutes les photos"
            >
              {isConfirmingDelete ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
            {isConfirmingDelete && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
                Cliquez à nouveau pour confirmer
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
              </div>
            )}
          </div>

          {/* Bouton principal de traitement */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isProcessing || !hasPendingFiles || !hasActiveOptions}
            className={`h-[48px] px-6 rounded-xl font-medium shadow-lg transition-all duration-300 flex items-center gap-3 min-w-[220px] ${
              !isProcessing && hasPendingFiles && hasActiveOptions
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 hover:scale-102 active:scale-98'
                : 'bg-slate-800/90 text-gray-500 cursor-not-allowed border border-slate-700/50'
            }`}
            aria-label={getButtonText()}
          >
            <div className="flex items-center gap-3">
              <ModeIcon className="w-5 h-5" />
              <span className="font-medium">{getButtonText()}</span>
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
            if (onApplyResize) {
              onApplyResize(options);
            }
            setShowResizeModal(false);
          }}
          initialConfig={outputDimensions ? {
            enabled: true,
            dimensions: {
              width: outputDimensions.width,
              height: outputDimensions.height
            },
            tool: outputDimensions.tool || 'imagemagick',
            mode: outputDimensions.mode || 'resize',
            cropHead: outputDimensions.mode === 'crop-head' || outputDimensions.mode === 'all',
            removeBackground: outputDimensions.mode === 'ai' || outputDimensions.mode === 'both' || outputDimensions.mode === 'all',
            enableDimensions: outputDimensions.width > 0 && outputDimensions.height > 0 && 
                           (outputDimensions.mode === 'resize' || outputDimensions.mode === 'both' || 
                            outputDimensions.mode === 'crop-head' || outputDimensions.mode === 'all')
          } : undefined}
        />
      )}
    </div>
  );
}