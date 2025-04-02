import React, { useState } from 'react';
import { X, Shield, AlertTriangle, Check, Settings2, Wand2, Power, Maximize2, Layers, Scissors, Sparkles } from 'lucide-react';

interface ResizeModalProps {
  onClose: () => void;
  onApply: (options: { width: number; height: number; tool: string; mode: 'resize' | 'ai' | 'both' | 'crop-head' | 'all' } | null) => void;
  initialConfig?: {
    enabled: boolean;
    dimensions: { width: number; height: number };
    tool: string;
    mode: 'resize' | 'ai' | 'both' | 'crop-head' | 'all';
  };
}

const processingModes = [
  { 
    id: 'resize', 
    name: 'Redimensionnement', 
    description: 'Redimensionner uniquement', 
    icon: Maximize2,
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    iconColor: 'text-blue-400',
    showDimensions: true
  },
  { 
    id: 'ai', 
    name: 'Traitement IA', 
    description: 'Supprimer l\'arrière-plan', 
    icon: Wand2,
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    iconColor: 'text-purple-400',
    showDimensions: false
  },
  { 
    id: 'both', 
    name: 'Redimensionnement + IA', 
    description: 'Les deux traitements', 
    icon: Layers,
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    showDimensions: true
  },
  { 
    id: 'crop-head', 
    name: 'Supprimer la tête + Redimensionnement', 
    description: 'Recadrer sous le menton', 
    icon: Scissors,
    badgeColor: 'bg-red-500/15 text-red-400 border-red-500/30',
    iconColor: 'text-red-400',
    showDimensions: true
  },
  { 
    id: 'all', 
    name: 'Tous les traitements', 
    description: 'Appliquer tous les traitements', 
    icon: Sparkles,
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    iconColor: 'text-amber-400',
    showDimensions: true
  }
] as const;

export function ResizeModal({ onClose, onApply, initialConfig }: ResizeModalProps) {
  const [config, setConfig] = useState(() => {
    return initialConfig || {
      enabled: true,
      dimensions: { width: 1000, height: 1500 },
      tool: 'imagemagick',
      mode: 'ai' as const
    };
  });

  const handleApply = () => {
    if (!config.dimensions.width || !config.dimensions.height) return;
    
    onApply(config.enabled ? {
      width: parseInt(config.dimensions.width.toString()),
      height: parseInt(config.dimensions.height.toString()),
      tool: 'imagemagick',
      mode: config.mode
    } : null);
  };

  // Get current mode info
  const currentMode = processingModes.find(mode => mode.id === config.mode) || processingModes[1];
  const ModeIcon = currentMode.icon;

  // Determine if dimensions should be shown
  const showDimensions = currentMode.showDimensions;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-6xl animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Panel - Processing Modes */}
          <div className="w-full md:w-1/2 p-6 md:border-r border-slate-700/40">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${currentMode.badgeColor.split(' ')[0]} ${currentMode.badgeColor.split(' ')[1]} ring-2 ring-offset-2 ring-offset-slate-900 ring-${currentMode.badgeColor.split(' ')[1].replace('text-', '')}/20`}>
                  <ModeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Mode de traitement
                  </h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Sélectionnez les traitements à appliquer
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {processingModes.map(mode => {
                const ModeIconComponent = mode.icon;
                const isActive = config.mode === mode.id;
                
                return (
                  <button
                    key={mode.id}
                    onClick={() => setConfig(prev => ({ ...prev, mode: mode.id }))}
                    className={`group p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isActive
                        ? `${mode.badgeColor} ring-2 ring-${mode.iconColor.replace('text-', '')}/20`
                        : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600/50 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl transition-all ${
                        isActive
                          ? mode.badgeColor
                          : 'bg-slate-700/40 group-hover:bg-slate-700/60'
                      }`}>
                        <ModeIconComponent className={`w-5 h-5 ${
                          isActive
                            ? mode.iconColor
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`} />
                      </div>
                      <div className="flex-grow">
                        <div className={`font-medium ${
                          isActive
                            ? mode.iconColor
                            : 'text-slate-200 group-hover:text-white'
                        }`}>{mode.name}</div>
                        <p className={`text-sm mt-1 ${
                          isActive ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-300'
                        }`}>{mode.description}</p>
                      </div>
                      {isActive ? (
                        <div className={`w-6 h-6 flex items-center justify-center rounded-full ${mode.badgeColor}`}>
                          <Check className={`w-4 h-4 ${mode.iconColor}`} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-700/60 group-hover:border-slate-600"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel - Settings */}
          <div className="w-full md:w-1/2 p-6 relative">
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
              {/* Enable/Disable Switch */}
              <div className="flex items-center justify-between p-5 bg-slate-800/50 rounded-xl border border-slate-700/40 hover:border-slate-600/40 transition-all shadow-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl transition-all ${config.enabled ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}>
                    <Power className={`w-5 h-5 ${config.enabled ? 'text-emerald-400' : 'text-slate-400'}`} />
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

              {/* Dimensions - Show for resize, both, crop-head and all modes */}
              {showDimensions && (
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
                          value={config.dimensions.width}
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
                          value={config.dimensions.height}
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
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700/30 bg-slate-800/20 backdrop-blur-sm">
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-slate-500/30"
                >
                  Annuler
                </button>
                <button
                  onClick={handleApply}
                  disabled={showDimensions && (!config.dimensions.width || !config.dimensions.height)}
                  className={`px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${currentMode.badgeColor} shadow-lg hover:shadow-${currentMode.iconColor.replace('text-', '')}/20`}
                >
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Appliquer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}