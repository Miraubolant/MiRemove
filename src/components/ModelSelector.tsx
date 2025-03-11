import React, { useState } from 'react';
import { ImageIcon, Sparkles, Download, PaintBucket } from 'lucide-react';
import { Model } from '../types';
import { ProgressBar } from './ProgressBar';
import { useAuthStore } from '../stores/authStore';
import { AuthModal } from './AuthModal';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  models: Model[];
  hasPendingFiles: boolean;
  hasCompletedFiles?: boolean;
  onDownloadAllJpg?: () => void;
  onApplyWhiteBackground?: () => void;
  hasWhiteBackground?: boolean;
  isProcessing?: boolean;
  totalToProcess?: number;
  completed?: number;
  remainingProcesses?: number;
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  onSubmit, 
  models, 
  hasPendingFiles,
  hasCompletedFiles,
  onDownloadAllJpg,
  onApplyWhiteBackground,
  hasWhiteBackground,
  isProcessing,
  totalToProcess = 0,
  completed = 0,
  remainingProcesses = Infinity
}: ModelSelectorProps) {
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && remainingProcesses === 0) {
      setShowAuthModal(true);
    } else {
      onSubmit(e);
    }
  };

  // Le bouton est désactivé uniquement s'il n'y a pas de fichiers en attente
  // ou si un traitement est en cours, SAUF si l'utilisateur n'est pas connecté
  // et qu'il a atteint la limite
  const isButtonDisabled = isProcessing || (!hasPendingFiles && (user || remainingProcesses > 0));

  return (
    <div className="space-y-4">
      <form className="flex flex-col sm:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2">
          <label className="block">
            <span className="text-base font-medium text-gray-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Choisir le modèle d'IA
            </span>
            <p className="text-sm text-gray-400 mt-1 mb-2">
              Sélectionnez le modèle le plus adapté à vos images
              {!user && remainingProcesses < Infinity && (
                <span className="ml-2 text-emerald-500">
                  ({remainingProcesses} traitement{remainingProcesses > 1 ? 's' : ''} restant{remainingProcesses > 1 ? 's' : ''})
                </span>
              )}
            </p>
            <select
              value={selectedModel}
              onChange={onModelChange}
              className="mt-1 block w-full input-field text-base"
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          {hasCompletedFiles && (
            <>
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
            </>
          )}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            className={`relative group overflow-hidden h-[46px] px-6 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 min-w-[200px] ${
              !isButtonDisabled
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-800/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="relative flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              <span>
                {!user && remainingProcesses === 0 
                  ? "Connectez-vous pour continuer"
                  : "Traiter les images"
                }
              </span>
            </div>
          </button>
        </div>
      </form>

      {isProcessing && (
        <div className="w-full max-w-md">
          <ProgressBar
            total={totalToProcess}
            completed={completed}
          />
        </div>
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}