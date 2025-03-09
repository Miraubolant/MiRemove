import React from 'react';
import { ImageIcon, Sparkles, Download, Check, PaintBucket } from 'lucide-react';
import { Model } from '../types';

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
  hasWhiteBackground
}: ModelSelectorProps) {
  return (
    <div className="space-y-6">
      <form className="flex flex-col sm:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2">
          <label className="block">
            <span className="text-base font-medium text-gray-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Choisir le modèle d'IA
            </span>
            <p className="text-sm text-gray-400 mt-1 mb-2">
              Sélectionnez le modèle le plus adapté à vos images
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
                className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl transition-all duration-300 ${
                  hasWhiteBackground
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
                title={hasWhiteBackground ? "Retirer le fond blanc" : "Appliquer un fond blanc à toutes les images"}
              >
                <PaintBucket className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={onDownloadAllJpg}
                className="h-[46px] w-[46px] flex items-center justify-center rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-all duration-300"
                title="Tout télécharger en JPG"
              >
                <Download className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            type="submit"
            onClick={onSubmit}
            disabled={!hasPendingFiles}
            className={`h-[46px] px-6 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 min-w-[200px] ${
              hasPendingFiles
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25'
                : 'bg-slate-800/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span>Traiter les images</span>
          </button>
        </div>
      </form>
    </div>
  );
}