import React, { useState } from 'react';
import { ImageIcon, Download, Clock, Trash2, Maximize2, AlertTriangle, Wand2, Layers, Scissors, Sparkles } from 'lucide-react';
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
  onApplyResize?: (dimensions: { width: number; height: number; tool: string; mode: 'resize' | 'ai' | 'both' | 'crop-head' | 'all' } | null) => void;
  outputDimensions?: { width: number; height: number; tool?: string; mode?: 'resize' | 'ai' | 'both' | 'crop-head' | 'all' } | null;
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

  // Déterminer si on utilise tous les traitements
  const hasAllProcessing = outputDimensions?.mode === 'all';
  
  // Autres modes spécifiques, à n'afficher que si le mode 'all' n'est pas actif
  const showDimensionsBadge = !hasAllProcessing && 
    outputDimensions?.mode && 
    ['resize', 'both'].includes(outputDimensions.mode);
  
  const showAiBadge = !hasAllProcessing && 
    outputDimensions?.mode && 
    ['ai', 'both'].includes(outputDimensions.mode);

  const mode = outputDimensions?.mode || 'both';

  const getButtonText = () => {
    if (!user) return "Se connecter pour traiter";
    switch (mode) {
      case 'resize': return "Redimensionner les images";
      case 'ai': return "Traitement IA";
      case 'both': return "Redimensionnement + IA";
      case 'crop-head': return "Supprimer la tête";
      case 'all': return "Tous les traitements";
      default: return "Traiter les images";
    }
  };

  // Get icon and styles based on mode
  const getModeIcon = () => {
    switch (mode) {
      case 'resize': return Maximize2;
      case 'ai': return Wand2;
      case 'both': return Layers;
      case 'crop-head': return Scissors;
      case 'all': return Sparkles;
      default: return ImageIcon;
    }
  };

  const getBadgeColor = () => {
    switch (mode) {
      case 'resize': return "bg-blue-500";
      case 'ai': return "bg-purple-500";
      case 'both': return "bg-emerald-500";
      case 'crop-head': return "bg-red-500";
      case 'all': return "bg-amber-500";
      default: return "bg-slate-500";
    }
  };

  const ModeIcon = getModeIcon();
  const badgeColor = getBadgeColor();

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
          <div className="relative mr-2">
            <button
              type="button"
              onClick={handleResizeClick}
              className="h-[48px] w-[48px] flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
              title={outputDimensions ? "Modifier le traitement" : "Configurer le traitement"}
              aria-label="Configurer le redimensionnement"
            >
              <ModeIcon className="w-5 h-5" />
            </button>
            
            {/* Badge jaune "Tous les traitements" - au-dessus du bouton */}
            {hasAllProcessing && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                <Sparkles className="w-3 h-3 inline mr-0.5" />
                Tous
              </div>
            )}
            
            {/* Badge pour dimensions - uniquement si pas le mode "all" */}
            {showDimensionsBadge && outputDimensions && (
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${badgeColor} text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-lg min-w-[42px] text-center`}>
                {outputDimensions.width}×{outputDimensions.height}
              </div>
            )}
            
            {/* Badge pour l'IA - uniquement si pas le mode "all" */}
            {showAiBadge && (
              <div className="absolute -bottom-3 -right-2 bg-purple-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                IA
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onDownloadAllJpg}
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

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isProcessing || !hasPendingFiles}
            className={`h-[48px] px-6 rounded-xl font-medium shadow-lg transition-all duration-300 flex items-center gap-3 min-w-[220px] ${
              !isProcessing && hasPendingFiles
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
          onApply={(dimensions) => {
            if (onApplyResize) {
              onApplyResize(dimensions);
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
            mode: outputDimensions.mode || 'both'
          } : undefined}
        />
      )}
    </div>
  );
}