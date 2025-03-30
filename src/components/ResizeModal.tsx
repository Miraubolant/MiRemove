import React, { useState } from 'react';
import { X, Shield, AlertTriangle, Check, Settings2, Wand2, Power, Maximize2, Layers } from 'lucide-react';

interface ResizeModalProps {
  onClose: () => void;
  onApply: (options: { width: number; height: number; tool: string; mode: 'resize' | 'ai' | 'both' } | null) => void;
  initialConfig?: {
    enabled: boolean;
    dimensions: { width: number; height: number };
    tool: string;
    mode: 'resize' | 'ai' | 'both';
  };
}

const processingModes = [
  { 
    id: 'resize', 
    name: 'Redimensionnement', 
    description: 'Redimensionner uniquement', 
    icon: Maximize2,
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  { 
    id: 'ai', 
    name: 'Traitement IA', 
    description: 'Supprimer l\'arrière-plan', 
    icon: Wand2,
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    iconColor: 'text-purple-400'
  },
  { 
    id: 'both', 
    name: 'Redimensionnement + IA', 
    description: 'Les deux traitements', 
    icon: Layers,
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    iconColor: 'text-emerald-400'
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

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${currentMode.badgeColor.split(' ')[0]} ${currentMode.badgeColor.split(' ')[1]}`}>
                <ModeIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">
                Configuration du traitement
              </h3>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Enable/Disable Switch */}
            <div className="flex items-center justify-between p-5 bg-slate-800/70 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-slate-700/70 p-2.5 rounded-lg">
                  <Power className={`w-5 h-5 ${config.enabled ? 'text-emerald-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-200">Traitement automatique</h4>
                  <p className="text-sm text-gray-400 mt-1">Appliquer à toutes les images</p>
                </div>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  config.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-700/50 text-gray-400 hover:text-gray-300 border border-gray-700/50'
                }`}
              >
                <span className="text-sm font-medium">{config.enabled ? 'Activé' : 'Désactivé'}</span>
                {config.enabled && <Check className="w-4 h-4" />}
              </button>
            </div>

            {/* Processing Mode */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-medium text-gray-300">Mode de traitement</h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {processingModes.map(mode => {
                  const ModeIconComponent = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setConfig(prev => ({ ...prev, mode: mode.id }))}
                      className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                        config.mode === mode.id
                          ? `${mode.badgeColor} border-2`
                          : 'bg-slate-800/50 border-gray-700/50 hover:border-gray-600/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          config.mode === mode.id
                            ? mode.badgeColor
                            : 'bg-slate-700/60'
                        }`}>
                          <ModeIconComponent className={`w-5 h-5 ${
                            config.mode === mode.id
                              ? mode.iconColor
                              : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-grow">
                          <div className={`font-medium ${
                            config.mode === mode.id
                              ? mode.iconColor
                              : 'text-gray-200'
                          }`}>{mode.name}</div>
                          <p className="text-xs text-gray-400 mt-1">{mode.description}</p>
                        </div>
                        {config.mode === mode.id && (
                          <Check className={`w-5 h-5 flex-shrink-0 ${mode.iconColor}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1">
                <Maximize2 className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-medium text-gray-300">Dimensions</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
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
                      className="w-full bg-slate-800/70 border border-gray-700/50 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">px</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
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
                      className="w-full bg-slate-800/70 border border-gray-700/50 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-800">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-400 hover:text-gray-300 transition-colors rounded-lg hover:bg-slate-800/70"
            >
              Annuler
            </button>
            <button
              onClick={handleApply}
              disabled={!config.dimensions.width || !config.dimensions.height}
              className={`px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentMode.badgeColor}`}
            >
              <Check className="w-4 h-4" />
              <span className="font-medium">Appliquer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}