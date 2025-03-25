import React, { useState } from 'react';
import { Loader2, X, Info, ZoomIn, SplitSquareVertical, Play, Check, Maximize2, ArrowRight } from 'lucide-react';
import { ImageFile } from '../types';
import { ImageModal } from './ImageModal';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '../stores/authStore';

interface ImagePreviewProps {
  file: ImageFile;
  onRemove: (id: string) => void;
  onBackgroundColorChange?: (id: string, color: string) => void;
  onProcess: (file: ImageFile) => Promise<void>;
  outputDimensions?: { width: number; height: number } | null;
}

export function ImagePreview({ 
  file, 
  onRemove, 
  onBackgroundColorChange, 
  onProcess,
  outputDimensions
}: ImagePreviewProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuthStore();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const dimensionsText = file.dimensions?.width && file.dimensions?.height
    ? `${file.dimensions.width}×${file.dimensions.height}`
    : 'Dimensions inconnues';

  const outputDimensionsText = outputDimensions
    ? `${outputDimensions.width}×${outputDimensions.height}`
    : null;

  const handleProcess = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await onProcess(file);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-700 w-full">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-xs bg-slate-800/80 text-gray-300 py-1.5 px-2.5 rounded-lg flex items-center gap-2">
                  <Maximize2 className="w-3 h-3 text-emerald-500" />
                  <span>{dimensionsText}</span>
                  {outputDimensionsText && (
                    <>
                      <ArrowRight className="w-3 h-3 text-gray-500" />
                      <span className="text-emerald-500">{outputDimensionsText}</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(file.file.size)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {file.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => setShowOriginal(!showOriginal)}
                  className={`btn-icon ${showOriginal ? 'bg-emerald-500/10 text-emerald-500' : ''}`}
                  title={showOriginal ? "Voir le résultat" : "Voir l'original"}
                >
                  <SplitSquareVertical className="w-4 h-4" />
                </button>
              )}
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
                onClick={() => onRemove(file.id)}
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
            style={{ backgroundColor: !showOriginal && file.backgroundColor === '#FFFFFF' ? '#FFFFFF' : undefined }}
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
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105"
                >
                  <Play className="w-4 h-4" />
                  Traiter maintenant
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
          imageUrl={file.status === 'completed' ? (showOriginal ? file.preview : file.result!) : file.preview}
          originalUrl={file.status === 'completed' ? file.preview : undefined}
          onClose={() => setShowModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}