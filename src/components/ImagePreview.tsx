import React, { useState, useRef } from 'react';
import { Loader2, X, Info, ZoomIn, Play, Check, Maximize2, Wand2, Scissors, Sparkles, Clock } from 'lucide-react';
import { ImageFile } from '../types';
import { ImageModal } from './ImageModal';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '../stores/authStore';

interface ImagePreviewProps {
  file: ImageFile;
  onRemove: (id: string) => void;
  onProcess: (file: ImageFile) => Promise<void>;
  outputDimensions?: { width: number; height: number; tool?: string; mode?: 'resize' | 'ai' | 'both' | 'crop-head' | 'all' } | null;
  hasWhiteBackground?: boolean;
}

export function ImagePreview({ 
  file, 
  onRemove, 
  onProcess,
  outputDimensions,
  hasWhiteBackground = false
}: ImagePreviewProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuthStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDimensions = (width: number, height: number) => {
    // Pour les très grandes dimensions, utiliser une notation plus compacte
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k';
      }
      return num.toString();
    };
    
    return `${formatNumber(width)}×${formatNumber(height)}`;
  };

  const handleProcess = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    try {
      await onProcess(file);
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled
      } else {
        console.error('Processing error:', err);
      }
    }
  };

  const handleRemove = () => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clean up object URLs
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    if (file.result) {
      URL.revokeObjectURL(file.result);
    }

    // Call original remove handler
    onRemove(file.id);
  };

  // Get dimensions badge text and icon
  const getDimensionsBadge = () => {
    if (!file.dimensions) return null;

    const { width, height, original } = file.dimensions;
    const isResized = width !== original.width || height !== original.height;

    if (file.status === 'completed') {
      if (file.processingMode === 'resize') {
        return {
          icon: <Maximize2 className="w-3 h-3 text-blue-400" />,
          text: formatDimensions(width, height),
          className: "bg-blue-500/10 text-blue-400"
        };
      } else if (file.processingMode === 'ai') {
        return {
          icon: <Wand2 className="w-3 h-3 text-purple-400" />,
          text: formatDimensions(width, height),
          className: "bg-purple-500/10 text-purple-400"
        };
      } else if (file.processingMode === 'both') {
        return {
          icon: isResized ? <Maximize2 className="w-3 h-3 text-emerald-400" /> : <Wand2 className="w-3 h-3 text-emerald-400" />,
          text: formatDimensions(width, height),
          className: "bg-emerald-500/10 text-emerald-400"
        };
      } else if (file.processingMode === 'crop-head') {
        return {
          icon: <Scissors className="w-3 h-3 text-red-400" />,
          text: formatDimensions(width, height),
          className: "bg-red-500/10 text-red-400"
        };
      } else if (file.processingMode === 'all') {
        return {
          icon: <Sparkles className="w-3 h-3 text-amber-400" />,
          text: formatDimensions(width, height),
          className: "bg-amber-500/10 text-amber-400"
        };
      }
    }

    // Original dimensions
    return {
      icon: <Maximize2 className="w-3 h-3 text-gray-400" />,
      text: formatDimensions(original.width, original.height),
      className: "bg-slate-700/50 text-gray-400"
    };
  };

  const dimensionsBadge = getDimensionsBadge();

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-gray-700/50 w-full">
        {/* Header compact */}
        <div className="p-2 sm:p-3 border-b border-gray-700/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Dimensions badge compact */}
              {dimensionsBadge && (
                <div className={`text-[10px] sm:text-xs py-1 px-2 rounded-md flex items-center gap-1 max-w-fit ${dimensionsBadge.className}`}>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0">{dimensionsBadge.icon}</div>
                  <span className="hidden sm:inline truncate font-medium">{dimensionsBadge.text}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-slate-700/50 ${showInfo ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white'}`}
                title="Informations"
              >
                <Info className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 sm:p-2 rounded-lg transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300"
                title="Supprimer"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {showInfo && (
            <div className="mt-2 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-gray-700/50">
              <div className="space-y-1">
                <p className="text-[10px] sm:text-xs">
                  <span className="text-gray-500">Type: </span>
                  <span className="text-gray-300">{file.file.type}</span>
                </p>
                <p className="text-[10px] sm:text-xs">
                  <span className="text-gray-500">Taille: </span>
                  <span className="text-gray-300">{formatFileSize(file.file.size)}</span>
                </p>
                <p className="text-[10px] sm:text-xs">
                  <span className="text-gray-500">Status: </span>
                  <span className="text-gray-300">
                    {file.status === 'completed' && 'Terminé'}
                    {file.status === 'processing' && 'En cours'}
                    {file.status === 'pending' && 'En attente'}
                    {file.status === 'error' && 'Erreur'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Image container avec aspect ratio responsive */}
        <div className="p-2 sm:p-3">
          <div 
            className="w-full aspect-[3/4] bg-slate-800/50 rounded-lg overflow-hidden shadow-sm cursor-pointer relative group"
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: hasWhiteBackground ? '#FFFFFF' : undefined }}
          >
            {file.status === 'completed' && (
              <>
                <img 
                  src={showOriginal ? file.preview : file.result}
                  alt={showOriginal ? "Image originale" : "Image sans fond"}
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </>
            )}
            {file.status === 'processing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-white" />
                  </div>
                  {/* Animated rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-pulse"></div>
                </div>
                <div className="text-center px-3">
                  <p className="text-sm sm:text-base font-medium text-white mb-1">
                    Traitement en cours...
                  </p>
                  <p className="text-xs text-gray-300">
                    Veuillez patienter
                  </p>
                </div>
              </div>
            )}
            {file.status === 'pending' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 p-3">
                <div className="text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700/50 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400">
                    En attente
                  </p>
                </div>
                
                <button
                  onClick={(e) => handleProcess(e)}
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white p-2.5 sm:p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-emerald-500/20 hover:scale-110 active:scale-95 border border-emerald-500/20"
                  title="Traiter l'image"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-full" />
                  
                  {/* Icon */}
                  <div className="relative z-10">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  </div>

                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping opacity-75 group-hover:animate-none" />
                </button>
              </div>
            )}
            {file.status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-4 text-center">
                <div className="bg-red-500/10 p-2 sm:p-3 rounded-lg border border-red-500/20">
                  <p className="text-xs sm:text-sm text-red-400 break-words">{file.error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ImageModal
          imageUrl={file.status === 'completed' ? file.result! : file.preview}
          originalUrl={file.status === 'completed' ? file.preview : undefined}
          onClose={() => setShowModal(false)}
          processingMode={file.processingMode}
          hasWhiteBackground={hasWhiteBackground}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}