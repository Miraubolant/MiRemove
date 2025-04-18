import React, { useState, useRef } from 'react';
import { Loader2, X, Info, ZoomIn, Play, Check, Maximize2, Wand2, Scissors, Sparkles } from 'lucide-react';
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
        console.log('Request aborted');
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
          text: `${width}×${height}`,
          className: "bg-blue-500/10 text-blue-400"
        };
      } else if (file.processingMode === 'ai') {
        return {
          icon: <Wand2 className="w-3 h-3 text-purple-400" />,
          text: `${width}×${height}`,
          className: "bg-purple-500/10 text-purple-400"
        };
      } else if (file.processingMode === 'both') {
        return {
          icon: isResized ? <Maximize2 className="w-3 h-3 text-emerald-400" /> : <Wand2 className="w-3 h-3 text-emerald-400" />,
          text: `${width}×${height}`,
          className: "bg-emerald-500/10 text-emerald-400"
        };
      } else if (file.processingMode === 'crop-head') {
        return {
          icon: <Scissors className="w-3 h-3 text-red-400" />,
          text: `${width}×${height}`,
          className: "bg-red-500/10 text-red-400"
        };
      } else if (file.processingMode === 'all') {
        return {
          icon: <Sparkles className="w-3 h-3 text-amber-400" />,
          text: `${width}×${height}`,
          className: "bg-amber-500/10 text-amber-400"
        };
      }
    }

    // Original dimensions
    return {
      icon: <Maximize2 className="w-3 h-3 text-gray-400" />,
      text: `${original.width}×${original.height}`,
      className: "bg-slate-700/50 text-gray-400"
    };
  };

  const dimensionsBadge = getDimensionsBadge();

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-700 w-full">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {/* Dimensions badge */}
                {dimensionsBadge && (
                  <div className={`text-xs py-1.5 px-2.5 rounded-lg flex items-center gap-2 ${dimensionsBadge.className}`}>
                    {dimensionsBadge.icon}
                    <span>{dimensionsBadge.text}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                className={`btn-icon ${showInfo ? 'bg-emerald-500/10' : ''}`}
                title="Informations"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="btn-icon text-red-500 hover:bg-red-500/10"
                title="Supprimer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showInfo && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-gray-700">
              <div className="space-y-2">
                <p className="text-xs">
                  <span className="text-gray-400">Type : </span>
                  <span className="text-gray-300">{file.file.type}</span>
                </p>
                <p className="text-xs">
                  <span className="text-gray-400">Taille : </span>
                  <span className="text-gray-300">{formatFileSize(file.file.size)}</span>
                </p>
                <p className="text-xs">
                  <span className="text-gray-400">Status : </span>
                  <span className="text-gray-300">
                    {file.status === 'completed' && 'Traitement terminé'}
                    {file.status === 'processing' && 'En cours de traitement'}
                    {file.status === 'pending' && 'En attente de traitement'}
                    {file.status === 'error' && 'Erreur'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div 
            className="w-full h-[300px] bg-slate-800/50 rounded-xl overflow-hidden shadow-md cursor-pointer relative group"
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
                  <ZoomIn className="w-8 h-8 text-white" />
                </div>
              </>
            )}
            {file.status === 'processing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative mb-3">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse"></div>
                </div>
                <p className="text-sm text-gray-300 animate-pulse">
                  Traitement en cours...
                </p>
              </div>
            )}
            {file.status === 'pending' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <p className="text-sm text-gray-400">
                  En attente de traitement
                </p>
                <button
                  onClick={(e) => handleProcess(e)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4" />
                  <span>Traiter maintenant</span>
                </button>
              </div>
            )}
            {file.status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                  <p className="text-sm text-red-400">{file.error}</p>
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