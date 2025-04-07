import React, { useState } from 'react';
import { X, Check, Settings2, Wand2, Maximize2, Scissors, PaintBucket } from 'lucide-react';

interface ProcessingOptions {
  width: number;
  height: number;
  cropHead: boolean;
  removeBackground: boolean;
  tool?: string;
}

interface ResizeModalProps {
  onClose: () => void;
  onApply: (options: { width: number; height: number; tool: string; mode: 'resize' | 'ai' | 'both' | 'crop-head' | 'all' } | null) => void;
  initialConfig?: {
    enabled: boolean;
    dimensions: { width: number; height: number };
    cropHead?: boolean;
    removeBackground?: boolean;
    tool?: string;
    mode?: 'resize' | 'ai' | 'both' | 'crop-head' | 'all';
  };
}

export function ResizeModal({ onClose, onApply, initialConfig }: ResizeModalProps) {
  const [config, setConfig] = useState(() => {
    // Définir enableDimensions à true par défaut, ou utiliser la valeur de initialConfig si elle existe
    const defaultConfig = {
      enabled: true,
      dimensions: { width: 1080, height: 1080 },
      cropHead: false,
      removeBackground: false,
      tool: 'imagemagick',
      mode: 'resize' as const,
      enableDimensions: true  // Activé par défaut
    };
    
    // Si initialConfig est fourni, on fusionne avec les valeurs par défaut
    if (initialConfig) {
      return {
        ...defaultConfig,
        ...initialConfig,
        // S'assurer que enableDimensions est à true par défaut sauf si explicitement défini à false
        enableDimensions: initialConfig.enableDimensions !== undefined ? initialConfig.enableDimensions : true
      };
    }
    
    return defaultConfig;
  });

  // Déterminer le mode en fonction des options sélectionnées
  const determineMode = () => {
    const { cropHead, removeBackground, enableDimensions } = config;
    const hasResize = enableDimensions && config.dimensions.width > 0 && config.dimensions.height > 0;
    
    if (cropHead && removeBackground) {
      return 'all' as const;
    } else if (cropHead) {
      return 'crop-head' as const;
    } else if (removeBackground) {
      return hasResize ? 'both' as const : 'ai' as const;
    } else if (hasResize) {
      return 'resize' as const;
    } else {
      // Par défaut, si aucun traitement n'est sélectionné, on utilise le traitement IA
      return 'ai' as const;
    }
  };

  const handleApply = () => {
    if (!config.enabled) {
      onApply(null);
      return;
    }

    // Si aucun traitement n'est sélectionné, activer par défaut le traitement IA
    let finalConfig = {...config};
    if (!config.cropHead && !config.removeBackground && 
        (!config.enableDimensions || !config.dimensions.width || !config.dimensions.height)) {
      finalConfig = {
        ...finalConfig,
        removeBackground: true // Activer le traitement IA par défaut
      };
    }

    // Déterminer le mode actuel avec la configuration finale
    const mode = determineMode();
    
    // Si les dimensions sont désactivées ou non spécifiées, on utilise 0
    const width = finalConfig.enableDimensions ? (finalConfig.dimensions.width || 0) : 0;
    const height = finalConfig.enableDimensions ? (finalConfig.dimensions.height || 0) : 0;
    
    onApply({
      width,
      height,
      tool: finalConfig.tool || 'imagemagick',
      mode: mode
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-xl animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-700/50 p-3 rounded-xl ring-2 ring-slate-600/20 ring-offset-2 ring-offset-slate-900">
                <Settings2 className="w-5 h-5 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Configuration
              </h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Enable/Disable Resize */}
            <div className="flex items-center justify-between p-5 bg-slate-800/50 rounded-xl border border-slate-700/40 hover:border-slate-600/40 transition-all shadow-lg">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-all ${config.enabled ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}>
                  <Maximize2 className={`w-5 h-5 ${config.enabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h4 className="font-medium text-white">Traitement automatique</h4>
                  <p className="text-sm text-slate-400 mt-0.5">Appliquer à toutes les images</p>
                </div>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  config.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ring-2 ring-emerald-500/10 ring-offset-1 ring-offset-slate-900'
                    : 'bg-slate-700/40 text-slate-400 hover:text-slate-300 border border-slate-700/40 hover:border-slate-600/50'
                }`}
              >
                <span className="text-sm font-medium">{config.enabled ? 'Activé' : 'Désactivé'}</span>
                {config.enabled && <Check className="w-4 h-4" />}
              </button>
            </div>

            {/* Enable/Disable Dimensions */}
            <div className="flex items-center justify-between p-5 bg-slate-800/50 rounded-xl border border-slate-700/40 hover:border-slate-600/40 transition-all shadow-lg">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-all ${config.enableDimensions ? 'bg-blue-500/20' : 'bg-slate-700/50'}`}>
                  <Maximize2 className={`w-5 h-5 ${config.enableDimensions ? 'text-blue-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h4 className="font-medium text-white">Redimensionnement</h4>
                  <p className="text-sm text-slate-400 mt-0.5">Modifier les dimensions</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.enableDimensions}
                  onChange={() => setConfig(prev => ({ ...prev, enableDimensions: !prev.enableDimensions }))}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Dimensions */}
            {config.enableDimensions && (
              <div className="space-y-4 bg-slate-800/30 p-5 rounded-xl border border-slate-700/40">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-700/30">
                  <Maximize2 className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-medium text-white">Dimensions</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">
                      Largeur
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={config.dimensions.width || ""}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, width: parseInt(e.target.value) || 0 }
                        }))}
                        placeholder="ex: 1920"
                        className="w-full bg-slate-800/70 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">px</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">
                      Hauteur
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={config.dimensions.height || ""}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, height: parseInt(e.target.value) || 0 }
                        }))}
                        placeholder="ex: 1080"
                        className="w-full bg-slate-800/70 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Options supplémentaires */}
            <div className="space-y-4 bg-slate-800/30 p-5 rounded-xl border border-slate-700/40">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-700/30">
                <Settings2 className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-medium text-white">Options de traitement</h4>
              </div>
              
              {/* Option: Supprimer la tête */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.cropHead ? 'bg-red-500/20' : 'bg-slate-700/40'}`}>
                    <Scissors className={`w-4 h-4 ${config.cropHead ? 'text-red-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-slate-200">Supprimer la tête</h5>
                    <p className="text-xs text-slate-400">Recadrer sous le menton</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.cropHead}
                    onChange={() => setConfig(prev => ({ ...prev, cropHead: !prev.cropHead }))}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-300/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
              
              {/* Option: Supprimer l'arrière-plan */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.removeBackground ? 'bg-purple-500/20' : 'bg-slate-700/40'}`}>
                    <PaintBucket className={`w-4 h-4 ${config.removeBackground ? 'text-purple-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-slate-200">Supprimer l'arrière-plan</h5>
                    <p className="text-xs text-slate-400">Traitement IA</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.removeBackground}
                    onChange={() => setConfig(prev => ({ ...prev, removeBackground: !prev.removeBackground }))}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-300/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 mt-6 border-t border-slate-700/30">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
              >
                Annuler
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-lg hover:shadow-blue-400/20 hover:bg-blue-500/20"
              >
                <Check className="w-4 h-4" />
                <span className="font-medium">Appliquer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}