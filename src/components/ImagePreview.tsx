import React, { useState, useEffect, useRef } from 'react';
import { Loader2, X, Info, ZoomIn, SplitSquareVertical, Play, Settings2, Check, Maximize2, Lock, Unlock, RotateCcw } from 'lucide-react';
import { ImageFile, ImageMetadata, Model } from '../types';
import { ImageModal } from './ImageModal';

interface ImagePreviewProps {
  file: ImageFile;
  onRemove: (id: string) => void;
  onBackgroundColorChange?: (id: string, color: string) => void;
  onProcess: (file: ImageFile) => Promise<void>;
  selectedModel: string;
  models: Model[];
  onModelChange: (fileId: string, model: string) => void;
  outputDimensions?: { width: number; height: number } | null;
}

export function ImagePreview({ 
  file, 
  onRemove, 
  onBackgroundColorChange, 
  onProcess, 
  selectedModel, 
  models,
  onModelChange,
  outputDimensions
}: ImagePreviewProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showDimensionsEditor, setShowDimensionsEditor] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [tempDimensions, setTempDimensions] = useState<{ width: number; height: number } | null>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const dimensionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = document.createElement('img');
    img.onload = () => {
      const dimensions = {
        width: img.width,
        height: img.height,
        original: {
          width: img.width,
          height: img.height
        }
      };
      
      setMetadata({
        width: img.width,
        height: img.height
      });

      if (!file.dimensions) {
        file.dimensions = dimensions;
        setTempDimensions({ width: img.width, height: img.height });
      } else {
        setTempDimensions({ width: file.dimensions.width, height: file.dimensions.height });
      }
    };
    img.src = file.preview;
  }, [file.preview, file.dimensions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
      if (dimensionsRef.current && !dimensionsRef.current.contains(event.target as Node)) {
        setShowDimensionsEditor(false);
        if (file.dimensions) {
          setTempDimensions({ width: file.dimensions.width, height: file.dimensions.height });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [file.dimensions]);

  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    if (!tempDimensions || !file.dimensions?.original) return;

    const originalAspectRatio = file.dimensions.original.width / file.dimensions.original.height;
    let newWidth = tempDimensions.width;
    let newHeight = tempDimensions.height;

    if (dimension === 'width') {
      newWidth = Math.max(1, value);
      if (aspectRatioLocked) {
        newHeight = Math.round(newWidth / originalAspectRatio);
      }
    } else {
      newHeight = Math.max(1, value);
      if (aspectRatioLocked) {
        newWidth = Math.round(newHeight * originalAspectRatio);
      }
    }

    setTempDimensions({ width: newWidth, height: newHeight });
  };

  const applyDimensions = () => {
    if (!tempDimensions || !file.dimensions) return;

    const newDimensions = {
      ...file.dimensions,
      width: tempDimensions.width,
      height: tempDimensions.height
    };

    file.dimensions = newDimensions;
    file.status = 'pending';
    file.result = undefined;
    file.error = undefined;

    setShowDimensionsEditor(false);
    onProcess(file);
  };

  const resetDimensions = () => {
    if (!file.dimensions?.original) return;
    
    const newDimensions = {
      width: file.dimensions.original.width,
      height: file.dimensions.original.height
    };

    setTempDimensions(newDimensions);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const { name } = file.file;
  const currentModel = models.find(m => m.id === file.model);
  const dimensionsText = outputDimensions 
    ? `${file.dimensions?.original?.width}×${file.dimensions?.original?.height} → ${outputDimensions.width}×${outputDimensions.height}`
    : `${file.dimensions?.width || metadata?.width}×${file.dimensions?.height || metadata?.height}`;

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-700 w-full">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1.5">
                <div className="relative" ref={dimensionsRef}>
                  <button
                    onClick={() => setShowDimensionsEditor(!showDimensionsEditor)}
                    className="text-xs bg-slate-800/80 hover:bg-slate-700/80 text-gray-300 py-1.5 px-2.5 rounded-lg transition-colors flex items-center gap-2 group"
                  >
                    <Maximize2 className="w-3 h-3 text-emerald-500" />
                    <span>{dimensionsText}</span>
                  </button>

                  {showDimensionsEditor && tempDimensions && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 rounded-xl shadow-xl border border-gray-700 z-10">
                      <div className="p-3 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-300">Dimensions de l'image</h4>
                          <button
                            onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                            className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                            title={aspectRatioLocked ? "Déverrouiller les proportions" : "Verrouiller les proportions"}
                          >
                            {aspectRatioLocked ? (
                              <Lock className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Unlock className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Largeur</label>
                            <input
                              type="number"
                              value={tempDimensions.width}
                              onChange={(e) => handleDimensionChange('width', parseInt(e.target.value, 10))}
                              className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-gray-200"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Hauteur</label>
                            <input
                              type="number"
                              value={tempDimensions.height}
                              onChange={(e) => handleDimensionChange('height', parseInt(e.target.value, 10))}
                              className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-gray-200"
                              min="1"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={resetDimensions}
                            className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Réinitialiser
                          </button>
                          <button
                            onClick={applyDimensions}
                            className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3 h-3" />
                            Appliquer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative" ref={modelSelectorRef}>
                  <button
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="text-xs bg-slate-800/80 hover:bg-slate-700/80 text-gray-300 py-1.5 px-2.5 rounded-lg transition-colors flex items-center gap-2 group max-w-full"
                  >
                    <span className="text-emerald-500 truncate">{currentModel?.name.split(' ')[0]}</span>
                    <span className="text-gray-400 truncate flex-1">{currentModel?.name.split(' - ')[1]}</span>
                    <Settings2 className="w-3 h-3 text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                  </button>

                  {showModelSelector && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 rounded-xl shadow-xl border border-gray-700 z-10 overflow-hidden">
                      <div className="p-3 border-b border-gray-700">
                        <h4 className="text-sm font-medium text-gray-300">Sélectionner un modèle</h4>
                      </div>
                      <div className="max-h-[280px] overflow-y-auto">
                        {models.map(model => (
                          <button
                            key={model.id}
                            onClick={() => {
                              onModelChange(file.id, model.id);
                              setShowModelSelector(false);
                            }}
                            className={`w-full text-left p-3 transition-all flex items-start gap-3 group relative ${
                              model.id === file.model
                                ? 'bg-emerald-500/10'
                                : 'hover:bg-slate-700/50'
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              model.id === file.model
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-700 group-hover:bg-slate-600'
                            }`}>
                              {model.id === file.model && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-200">
                                {model.name.split(' - ')[0]}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                {model.name.split(' - ')[1]}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {file.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => setShowOriginal(!showOriginal)}
                  className={`btn-icon ${showOriginal ? 'bg-emerald-500/10' : ''}`}
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
                {currentModel && (
                  <p className="text-xs">
                    <span className="text-gray-400">Modèle : </span>
                    <span className="text-gray-300">{currentModel.name.split(' - ')[1]}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div 
            className="w-full h-[300px] bg-slate-800/50 rounded-xl overflow-hidden shadow-md cursor-pointer relative group"
            onClick={() => setPreviewImage(file.status === 'completed' ? (showOriginal ? file.preview : file.result!) : file.preview)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onProcess(file);
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105"
                >
                  <Play className="w-4 h-4" />
                  Traiter maintenant
                </button>
              </div>
            )}
          </div>
        </div>

        {file.status === 'error' && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <p className="text-sm text-red-400">{file.error}</p>
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <ImageModal
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
}