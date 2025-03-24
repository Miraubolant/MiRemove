import React, { useState } from 'react';
import { ImageIcon, Download, PaintBucket, Clock, Trash2, Ruler, X } from 'lucide-react';
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
  onDeleteAll?: () => void;
  hasWhiteBackground?: boolean;
  isProcessing?: boolean;
  totalToProcess?: number;
  completed?: number;
  pendingCount?: number;
  onDimensionsChange?: (dimensions: { width: number; height: number } | null) => void;
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
  onDimensionsChange
}: ModelSelectorProps) {
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { settings } = useAdminSettingsStore();
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [dimensionsEnabled, setDimensionsEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onSubmit(e);
  };

  const handleDimensionsSubmit = () => {
    if (!dimensionsEnabled) {
      onDimensionsChange?.(null);
      setShowDimensionsModal(false);
      return;
    }

    const w = parseInt(width);
    const h = parseInt(height);
    
    if (w > 0 && h > 0) {
      onDimensionsChange?.({ width: w, height: h });
    }
    setShowDimensionsModal(false);
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
            onClick={() => setShowDimensionsModal(true)}
            className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              dimensionsEnabled
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title="Définir les dimensions"
          >
            <Ruler className="w-5 h-5" />
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

      {showDimensionsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-200">Dimensions de sortie</h3>
                <button
                  onClick={() => setShowDimensionsModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dimensionsEnabled}
                    onChange={(e) => setDimensionsEnabled(e.target.checked)}
                    className="rounded border-gray-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-gray-300">Activer le redimensionnement</span>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Largeur (px)
                    </label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      disabled={!dimensionsEnabled}
                      className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 disabled:opacity-50"
                      placeholder="ex: 1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Hauteur (px)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      disabled={!dimensionsEnabled}
                      className="w-full bg-slate-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 disabled:opacity-50"
                      placeholder="ex: 1500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDimensionsModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDimensionsSubmit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}