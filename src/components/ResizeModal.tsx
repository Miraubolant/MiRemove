import React, { useState } from 'react';
import { X, Maximize2, Check, Settings2, Wand2, Power } from 'lucide-react';

interface ResizeModalProps {
  onClose: () => void;
  onApply: (options: { type: string; width: number; height: number; enabled: boolean }) => void;
  initialConfig?: {
    enabled: boolean;
    dimensions: { width: number; height: number };
    model: string;
  };
}

const resizeOptions = [
  { id: 'imagemagick', name: 'ImageMagick', description: 'Haute qualité, polyvalent' },
  { id: 'graphicsmagick', name: 'GraphicsMagick', description: 'Rapide et efficace' },
  { id: 'ffmpeg', name: 'FFmpeg', description: 'Optimisé pour les grands volumes' },
  { id: 'pillow', name: 'Pillow', description: 'Simple et léger' }
];

export function ResizeModal({ onClose, onApply, initialConfig }: ResizeModalProps) {
  const [config, setConfig] = useState(() => {
    return initialConfig || {
      enabled: false,
      dimensions: { width: 1000, height: 1500 },
      model: 'imagemagick'
    };
  });

  const handleApply = () => {
    if (!config.dimensions.width || !config.dimensions.height) return;
    
    onApply({
      type: config.model,
      width: parseInt(config.dimensions.width.toString()),
      height: parseInt(config.dimensions.height.toString()),
      enabled: config.enabled
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Maximize2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">
                Redimensionnement
              </h3>
            </div>
            <button onClick={onClose} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Enable/Disable Switch */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-3">
                <Power className="w-5 h-5 text-emerald-500" />
                <div>
                  <h4 className="font-medium text-gray-200">Redimensionnement automatique</h4>
                  <p className="text-sm text-gray-400">Appliquer à toutes les images</p>
                </div>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                  config.enabled
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : 'bg-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
              >
                <span className="text-sm">{config.enabled ? 'Activé' : 'Désactivé'}</span>
              </button>
            </div>

            {/* Dimensions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-medium text-gray-300">Dimensions</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Largeur
                  </label>
                  <input
                    type="number"
                    value={config.dimensions.width}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, width: e.target.value }
                    }))}
                    placeholder="ex: 1920"
                    className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Hauteur
                  </label>
                  <input
                    type="number"
                    value={config.dimensions.height}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, height: e.target.value }
                    }))}
                    placeholder="ex: 1080"
                    className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Engine Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-medium text-gray-300">Moteur</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {resizeOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setConfig(prev => ({ ...prev, model: option.id }))}
                    className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                      config.model === option.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                        : 'bg-slate-800/50 border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.name}</span>
                      {config.model === option.id && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleApply}
              disabled={!config.dimensions.width || !config.dimensions.height}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}