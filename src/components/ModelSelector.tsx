import React, { useState } from 'react';
import { ImageIcon, Sparkles, Download, Maximize2, Check, PaintBucket } from 'lucide-react';
import { Model } from '../types';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  models: Model[];
  hasPendingFiles: boolean;
  hasCompletedFiles?: boolean;
  onDownloadAllJpg?: () => void;
  onDimensionsChange?: (dimensions: { width: number; height: number } | null) => void;
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
  onDimensionsChange,
  onApplyWhiteBackground,
  hasWhiteBackground
}: ModelSelectorProps) {
  const [showDimensionsPopover, setShowDimensionsPopover] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [tempDimensions, setTempDimensions] = useState<{ width: number; height: number }>({ width: 1920, height: 1080 });

  const handleCustomDimensionsChange = (width: number, height: number) => {
    setTempDimensions({ width, height });
  };

  const applyCustomDimensions = () => {
    if (tempDimensions.width > 0 && tempDimensions.height > 0) {
      setDimensions(tempDimensions);
      onDimensionsChange?.(tempDimensions);
      setShowDimensionsPopover(false);
    }
  };

  const clearDimensions = () => {
    setDimensions(null);
    setTempDimensions({ width: 1920, height: 1080 });
    onDimensionsChange?.(null);
  };

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
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDimensionsPopover(!showDimensionsPopover)}
              className={`h-[46px] px-6 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                dimensions 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
              title="Définir les dimensions"
            >
              <Maximize2 className="w-5 h-5" />
              <span>
                {dimensions ? `${dimensions.width}×${dimensions.height}` : 'Dimensions'}
              </span>
            </button>

            {showDimensionsPopover && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 rounded-xl shadow-xl border border-gray-700 z-10">
                <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-300">Dimensions de sortie</h4>
                  {dimensions && (
                    <button
                      onClick={clearDimensions}
                      className="text-xs text-gray-400 hover:text-gray-300"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Largeur</label>
                      <input
                        type="number"
                        value={tempDimensions.width}
                        onChange={(e) => handleCustomDimensionsChange(parseInt(e.target.value) || 0, tempDimensions.height)}
                        className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-gray-200"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Hauteur</label>
                      <input
                        type="number"
                        value={tempDimensions.height}
                        onChange={(e) => handleCustomDimensionsChange(tempDimensions.width, parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-gray-200"
                        min="1"
                      />
                    </div>
                  </div>
                  <button
                    onClick={applyCustomDimensions}
                    disabled={tempDimensions.width <= 0 || tempDimensions.height <= 0}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm transition-all duration-300 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25"
                  >
                    <Check className="w-4 h-4" />
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>

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