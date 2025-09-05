import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, Download, Clock, Trash2, Maximize2, AlertTriangle, Scissors, PaintBucket, Wand2, Layers, Sparkles, ChevronDown } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '../stores/authStore';
import { useAdminSettingsStore } from '../stores/adminSettingsStore';
import { ProgressBar } from './ProgressBar';

type ProcessingMode = 'resize' | 'ai' | 'both' | 'crop-head' | 'all' | 'crop-head-ai';

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

interface TreatmentState {
  removeBackground: boolean;
  resize: boolean;
  cropHead: boolean;
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
  const { settings, loading: settingsLoading } = useAdminSettingsStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteButtonTimeout, setDeleteButtonTimeout] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ===== ÉTAT PRINCIPAL : DIMENSIONS =====
  const [dimensions, setDimensions] = useState(() => {
    // Priorité : Cache utilisateur → outputDimensions → Défauts
    const cached = localStorage.getItem('miremover-dimensions');
    const defaultDimensions = { width: 1000, height: 1500 };
    
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return defaultDimensions;
      }
    }
    
    if (outputDimensions?.width && outputDimensions?.height) {
      return { width: outputDimensions.width, height: outputDimensions.height };
    }
    
    return defaultDimensions;
  });

  // ===== ÉTAT PRINCIPAL : TRAITEMENTS =====
  const [treatments, setTreatments] = useState<TreatmentState>(() => {
    // Priorité : Cache utilisateur → outputDimensions → Défauts
    const cacheKey = user ? `miremover-treatments-${user.id}` : 'miremover-treatments-anonymous';
    const cached = localStorage.getItem(cacheKey);
    const defaultTreatments: TreatmentState = {
      removeBackground: false,
      resize: false,
      cropHead: false
    };
    
    // 1. Cache utilisateur en priorité
    if (cached) {
      try {
        const cachedTreatments = JSON.parse(cached);
        // Vérifier si BRIA est désactivé et ajuster
        return {
          ...cachedTreatments,
          removeBackground: cachedTreatments.removeBackground && settings.bria_enabled
        };
      } catch {
        // Cache corrompu - continuer vers outputDimensions
      }
    }
    
    // 2. outputDimensions en second
    if (outputDimensions?.mode) {
      return {
        removeBackground: (outputDimensions.mode === 'ai' || outputDimensions.mode === 'both' || 
                          outputDimensions.mode === 'all' || outputDimensions.mode === 'crop-head-ai') && settings.bria_enabled,
        resize: outputDimensions.mode === 'resize' || outputDimensions.mode === 'both' || outputDimensions.mode === 'all',
        cropHead: outputDimensions.mode === 'crop-head' || outputDimensions.mode === 'all' || outputDimensions.mode === 'crop-head-ai'
      };
    }
    
    // 3. Défauts
    return defaultTreatments;
  });

  // ===== ÉTATS TEMPORAIRES POUR LE DROPDOWN =====
  const [tempTreatments, setTempTreatments] = useState<TreatmentState>(treatments);
  const [tempDimensions, setTempDimensions] = useState(dimensions);

  // ===== LOGIQUE DÉRIVÉE =====
  const hasSelectedTreatment = treatments.removeBackground || treatments.resize || treatments.cropHead;

  // ===== GESTION DU CACHE =====
  const saveTreatmentsToCache = (newTreatments: TreatmentState) => {
    const cacheKey = user ? `miremover-treatments-${user.id}` : 'miremover-treatments-anonymous';
    localStorage.setItem(cacheKey, JSON.stringify(newTreatments));
  };

  const saveDimensionsToCache = (newDimensions: { width: number; height: number }) => {
    localStorage.setItem('miremover-dimensions', JSON.stringify(newDimensions));
  };

  // ===== EFFET : CHANGEMENT D'UTILISATEUR =====
  useEffect(() => {
    if (!user) {
      // Utilisateur déconnecté - garder les réglages anonymes existants
      const anonymousCache = localStorage.getItem('miremover-treatments-anonymous');
      if (anonymousCache) {
        try {
          const cachedTreatments = JSON.parse(anonymousCache);
          setTreatments({
            ...cachedTreatments,
            removeBackground: cachedTreatments.removeBackground && settings.bria_enabled
          });
          setTempTreatments({
            ...cachedTreatments,
            removeBackground: cachedTreatments.removeBackground && settings.bria_enabled
          });
        } catch {
          // Cache corrompu - réinitialiser
          const emptyTreatments: TreatmentState = {
            removeBackground: false,
            resize: false,
            cropHead: false
          };
          setTreatments(emptyTreatments);
          setTempTreatments(emptyTreatments);
        }
      }
    } else {
      // Utilisateur connecté - charger ses réglages
      const userCacheKey = `miremover-treatments-${user.id}`;
      const userCache = localStorage.getItem(userCacheKey);
      const anonymousCache = localStorage.getItem('miremover-treatments-anonymous');
      
      if (userCache) {
        // L'utilisateur a déjà des réglages
        try {
          const cachedTreatments = JSON.parse(userCache);
          setTreatments({
            ...cachedTreatments,
            removeBackground: cachedTreatments.removeBackground && settings.bria_enabled
          });
          setTempTreatments({
            ...cachedTreatments,
            removeBackground: cachedTreatments.removeBackground && settings.bria_enabled
          });
        } catch {
          // Cache utilisateur corrompu - fallback sur anonyme ou défauts
          if (anonymousCache) {
            try {
              const anonymousTreatments = JSON.parse(anonymousCache);
              const newTreatments = {
                ...anonymousTreatments,
                removeBackground: anonymousTreatments.removeBackground && settings.bria_enabled
              };
              setTreatments(newTreatments);
              setTempTreatments(newTreatments);
              saveTreatmentsToCache(newTreatments);
            } catch {
              // Les deux caches corrompus
              const emptyTreatments: TreatmentState = {
                removeBackground: false,
                resize: false,
                cropHead: false
              };
              setTreatments(emptyTreatments);
              setTempTreatments(emptyTreatments);
            }
          }
        }
      } else if (anonymousCache) {
        // Conserver les réglages anonymes pour l'utilisateur connecté
        try {
          const anonymousTreatments = JSON.parse(anonymousCache);
          const newTreatments = {
            ...anonymousTreatments,
            removeBackground: anonymousTreatments.removeBackground && settings.bria_enabled
          };
          setTreatments(newTreatments);
          setTempTreatments(newTreatments);
          saveTreatmentsToCache(newTreatments);
        } catch {
          // Cache anonyme corrompu
          const emptyTreatments: TreatmentState = {
            removeBackground: false,
            resize: false,
            cropHead: false
          };
          setTreatments(emptyTreatments);
          setTempTreatments(emptyTreatments);
        }
      }
      // Si aucun cache, garder les états actuels
    }
  }, [user, settings.bria_enabled]);

  // ===== EFFET : CHANGEMENTS DU PARENT (outputDimensions) =====
  // Traquer le dernier mode traité pour éviter les boucles
  const lastProcessedMode = useRef<ProcessingMode | null>(null);
  
  // Utiliser useRef pour éviter les boucles infinies avec les dimensions
  const lastOutputDimensions = useRef<{ width: number; height: number } | null>(null);
  const userHasModifiedDimensions = useRef(false);

  useEffect(() => {
    if (!outputDimensions) return;
    
    // Seulement synchroniser les dimensions si l'utilisateur n'a PAS modifié manuellement
    // ET si les dimensions du parent ont réellement changé
    if (outputDimensions.width && outputDimensions.height && !userHasModifiedDimensions.current) {
      const newDimensions = { width: outputDimensions.width, height: outputDimensions.height };
      
      // Vérifier si les dimensions du parent ont vraiment changé
      const hasOutputDimensionsChanged = !lastOutputDimensions.current ||
        lastOutputDimensions.current.width !== newDimensions.width ||
        lastOutputDimensions.current.height !== newDimensions.height;
      
      if (hasOutputDimensionsChanged && 
          (dimensions.width !== newDimensions.width || dimensions.height !== newDimensions.height)) {
        setDimensions(newDimensions);
        setTempDimensions(newDimensions);
        lastOutputDimensions.current = newDimensions;
      }
    }

    // Ne mettre à jour les traitements QUE si le mode du parent est différent de ce qu'on a calculé
    if (outputDimensions.mode && outputDimensions.mode !== lastProcessedMode.current) {
      // Calculer le mode actuel basé sur nos traitements
      const currentCalculatedMode = calculateMode(treatments);
      
      // Seulement synchroniser si le parent a un mode différent de celui qu'on calcule
      // Ceci évite d'écraser les modifications utilisateur
      if (outputDimensions.mode !== currentCalculatedMode) {
        lastProcessedMode.current = outputDimensions.mode;
        
        const newTreatments: TreatmentState = {
          removeBackground: (outputDimensions.mode === 'ai' || outputDimensions.mode === 'both' || 
                            outputDimensions.mode === 'all' || outputDimensions.mode === 'crop-head-ai') && settings.bria_enabled,
          resize: outputDimensions.mode === 'resize' || outputDimensions.mode === 'both' || outputDimensions.mode === 'all',
          cropHead: outputDimensions.mode === 'crop-head' || outputDimensions.mode === 'all' || outputDimensions.mode === 'crop-head-ai'
        };

        setTreatments(newTreatments);
        setTempTreatments(newTreatments);
        saveTreatmentsToCache(newTreatments);
      }
    }
  }, [outputDimensions, treatments, settings.bria_enabled]);

  // ===== EFFET : DÉSACTIVATION BRIA =====
  useEffect(() => {
    if (!settings.bria_enabled) {
      // BRIA désactivé - désactiver removeBackground dans tous les états
      if (treatments.removeBackground) {
        const newTreatments = { ...treatments, removeBackground: false };
        setTreatments(newTreatments);
        saveTreatmentsToCache(newTreatments);
      }
      if (tempTreatments.removeBackground) {
        setTempTreatments({ ...tempTreatments, removeBackground: false });
      }
    }
  }, [settings.bria_enabled, treatments, tempTreatments]);

  // ===== HANDLERS =====
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Si aucun traitement choisi, forcer l'ouverture du dropdown
    if (!hasSelectedTreatment) {
      setShowDropdown(true);
      return;
    }
    
    onSubmit(e);
  };

  const handleDropdownToggle = () => {
    if (!showDropdown) {
      // Ouvrir le dropdown - synchroniser les états temporaires
      setTempTreatments(treatments);
      setTempDimensions(dimensions);
    }
    setShowDropdown(!showDropdown);
  };

  const handleApplySettings = () => {
    // Sauvegarder tous les changements
    setTreatments(tempTreatments);
    setDimensions(tempDimensions);
    saveTreatmentsToCache(tempTreatments);
    saveDimensionsToCache(tempDimensions);

    // Calculer le mode
    const mode = calculateMode(tempTreatments);

    // Mettre à jour le mode traité pour éviter que le useEffect l'écrase
    lastProcessedMode.current = mode;

    // Reset le flag de modification manuelle après application
    userHasModifiedDimensions.current = false;

    const config = {
      width: tempTreatments.resize ? tempDimensions.width : 0,
      height: tempTreatments.resize ? tempDimensions.height : 0,
      tool: 'imagemagick',
      mode
    };
    
    onApplyResize?.(config);
    setShowDropdown(false);
  };

  const calculateMode = (treatments: TreatmentState): ProcessingMode => {
    if (treatments.cropHead && treatments.resize && treatments.removeBackground) {
      return 'all';
    } else if (treatments.cropHead && treatments.removeBackground) {
      return 'crop-head-ai';
    } else if (treatments.cropHead && treatments.resize) {
      return 'crop-head';
    } else if (treatments.resize && treatments.removeBackground) {
      return 'both';
    } else if (treatments.cropHead) {
      return 'crop-head';
    } else if (treatments.removeBackground) {
      return 'ai';
    } else if (treatments.resize) {
      return 'resize';
    } else {
      return 'ai'; // Fallback
    }
  };

  const handleTreatmentChange = (treatment: keyof TreatmentState) => {
    if (treatment === 'removeBackground' && !settings.bria_enabled) {
      return; // BRIA désactivé - ignorer
    }
    
    setTempTreatments(prev => ({
      ...prev,
      [treatment]: !prev[treatment]
    }));
  };

  const handleDimensionChange = (field: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0;
    
    // Marquer que l'utilisateur a modifié manuellement les dimensions
    userHasModifiedDimensions.current = true;
    
    // Construire les nouvelles dimensions avec la valeur mise à jour
    const newDimensions = {
      ...tempDimensions,
      [field]: numValue
    };
    
    // Mettre à jour les états temporaire et permanent
    setTempDimensions(newDimensions);
    setDimensions(newDimensions);
    saveDimensionsToCache(newDimensions);
  };

  // ===== GESTION AUTRES BOUTONS =====
  const handleDeleteClick = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      const timeout = window.setTimeout(() => {
        setIsConfirmingDelete(false);
      }, 3000) as unknown as number;
      setDeleteButtonTimeout(timeout);
      return;
    }

    if (deleteButtonTimeout) {
      window.clearTimeout(deleteButtonTimeout);
      setDeleteButtonTimeout(null);
    }

    setIsConfirmingDelete(false);
    onDeleteAll?.();
  };

  const handleDownload = () => {
    if (!hasCompletedFiles) return;
    onDownloadAllJpg?.();
  };

  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      if (deleteButtonTimeout) {
        window.clearTimeout(deleteButtonTimeout);
      }
    };
  }, [deleteButtonTimeout]);

  // ===== FERMETURE DROPDOWN =====
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // ===== FONCTIONS D'AFFICHAGE =====
  const getModeIcon = () => {
    if (!hasSelectedTreatment) return ImageIcon;
    
    if (treatments.cropHead && treatments.resize && treatments.removeBackground) {
      return Sparkles; // Tous les traitements
    } else if (treatments.cropHead && treatments.removeBackground) {
      return Wand2; // Crop head + AI
    } else if (treatments.cropHead && treatments.resize) {
      return Scissors; // Crop head + resize
    } else if (treatments.resize && treatments.removeBackground) {
      return Layers; // Resize + AI
    } else if (treatments.cropHead) {
      return Scissors; // Crop head seul
    } else if (treatments.removeBackground) {
      return Wand2; // AI seul
    } else if (treatments.resize) {
      return Maximize2; // Resize seul
    }
    
    return ImageIcon;
  };

  const getButtonText = () => {
    if (!user) return "Se connecter pour traiter";
    
    if (!hasSelectedTreatment) {
      return "Choisir traitement";
    }
    
    if (treatments.cropHead && treatments.resize && treatments.removeBackground) {
      return "Tous les traitements";
    } else if (treatments.cropHead && treatments.removeBackground) {
      return "Couper la tête + Suppr. fond";
    } else if (treatments.cropHead && treatments.resize) {
      return "Couper la tête + Redimensionner";
    } else if (treatments.resize && treatments.removeBackground) {
      return "Redimensionner + Suppr. fond";
    } else if (treatments.cropHead) {
      return "Couper la tête";
    } else if (treatments.removeBackground) {
      return "Supprimer l'arrière-plan";
    } else if (treatments.resize) {
      return "Redimensionner uniquement";
    }
    
    return "Choisir traitement";
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

        <div className="flex flex-wrap gap-3">
          {/* Bouton configuration avec dropdown */}
          <div className="relative mr-2" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleDropdownToggle}
              className="h-[48px] w-[48px] flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600"
              title="Configurer le traitement"
              aria-label="Configurer le traitement"
            >
              <ModeIcon className="w-5 h-5" />
            </button>
            
            {/* Badge dimensions - utilise outputDimensions ou dimensions actuelles */}
            {((outputDimensions && outputDimensions.width > 0 && outputDimensions.height > 0) || 
              (dimensions.width > 0 && dimensions.height > 0 && treatments.resize)) && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-lg min-w-[42px] text-center">
                {outputDimensions?.width && outputDimensions?.height ? 
                  `${outputDimensions.width}×${outputDimensions.height}` :
                  `${dimensions.width}×${dimensions.height}`
                }
              </div>
            )}

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-xl border border-slate-700/50 py-3 z-50">
                {/* Header */}
                <div className="px-4 py-2 text-sm font-medium text-white border-b border-slate-700/50">
                  Configuration du traitement
                </div>
                
                {/* Dimensions Section */}
                <div className="px-4 py-3 border-b border-slate-700/50">
                  <div className="text-xs text-gray-400 mb-2">Dimensions (pixels)</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Largeur</label>
                      <input
                        type="number"
                        value={tempDimensions.width}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-emerald-500 focus:outline-none"
                        min="1"
                        max="4096"
                      />
                    </div>
                    <div className="text-gray-500 mt-4">×</div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Hauteur</label>
                      <input
                        type="number"
                        value={tempDimensions.height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-emerald-500 focus:outline-none"
                        min="1"
                        max="4096"
                      />
                    </div>
                  </div>
                </div>

                {/* Treatments Section */}
                <div className="px-4 py-3">
                  <div className="text-xs text-gray-400 mb-3">Types de traitement</div>
                  
                  {/* Remove Background */}
                  <label className={`flex items-center gap-3 py-2 rounded-lg px-2 transition-colors ${
                    settings.bria_enabled ? 'cursor-pointer hover:bg-slate-700/30' : 'cursor-not-allowed opacity-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={tempTreatments.removeBackground && settings.bria_enabled}
                      onChange={() => handleTreatmentChange('removeBackground')}
                      disabled={!settings.bria_enabled}
                      className={`w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2 ${
                        !settings.bria_enabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Supprimer l'arrière-plan</div>
                      <div className="text-xs text-gray-400">
                        {settings.bria_enabled 
                          ? 'IA de suppression d\'arrière-plan'
                          : 'Service désactivé par l\'administrateur'
                        }
                      </div>
                    </div>
                  </label>

                  {/* Resize */}
                  <label className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-700/30 rounded-lg px-2 transition-colors">
                    <input
                      type="checkbox"
                      checked={tempTreatments.resize}
                      onChange={() => handleTreatmentChange('resize')}
                      className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Maximize2 className="w-4 h-4 text-blue-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Redimensionner</div>
                      <div className="text-xs text-gray-400">Ajuster aux dimensions définies</div>
                    </div>
                  </label>

                  {/* Crop Head */}
                  <label className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-700/30 rounded-lg px-2 transition-colors">
                    <input
                      type="checkbox"
                      checked={tempTreatments.cropHead}
                      onChange={() => handleTreatmentChange('cropHead')}
                      className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <Scissors className="w-4 h-4 text-red-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Couper la tête</div>
                      <div className="text-xs text-gray-400">Détection et recadrage facial</div>
                    </div>
                  </label>
                </div>

                {/* Apply Button */}
                <div className="px-4 py-3 border-t border-slate-700/50">
                  <button
                    onClick={handleApplySettings}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-[1.02] active:scale-98"
                  >
                    Appliquer la configuration
                  </button>
                </div>
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
            disabled={isProcessing || !hasPendingFiles}
            className={`h-[48px] px-4 sm:px-6 rounded-xl font-medium shadow-lg transition-all duration-300 flex items-center gap-2 sm:gap-3 w-full sm:w-auto ${
              !isProcessing && hasPendingFiles
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 hover:scale-102 active:scale-98'
                : 'bg-slate-800/90 text-gray-500 cursor-not-allowed border border-slate-700/50'
            }`}
            aria-label={getButtonText()}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
              <ModeIcon className="w-5 h-5" />
              <span className="font-medium text-sm sm:text-base">{getButtonText()}</span>
            </div>
          </button>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}