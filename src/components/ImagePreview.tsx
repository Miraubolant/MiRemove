import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, X, FileImage, Info, Copy, Palette, ZoomIn, SplitSquareVertical, Play, Settings2, Check } from 'lucide-react';
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
}

export function ImagePreview({ 
  file, 
  onRemove, 
  onBackgroundColorChange, 
  onProcess, 
  selectedModel, 
  models,
  onModelChange 
}: ImagePreviewProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  const predefinedColors = [
    { name: 'Transparent', value: 'transparent', icon: '🔍' },
    { name: 'Blanc', value: '#FFFFFF', icon: '⚪' },
    { name: 'Crème', value: '#F5F3E8', icon: '🤍' },
    { name: 'Beige', value: '#F5F5DC', icon: '💫' }
  ];

  useEffect(() => {
    const img = document.createElement('img');
    img.onload = () => {
      setMetadata({
        width: img.width,
        height: img.height
      });
    };
    img.src = file.preview;

    if (file.status === 'completed' && !file.backgroundColor) {
      onBackgroundColorChange?.(file.id, 'transparent');
    }
  }, [file.preview, file.status, file.backgroundColor, file.id, onBackgroundColorChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatFileName = (name: string) => {
    const extension = name.split('.').pop();
    const baseName = name.replace(`.${extension}`, '');
    return {
      name: baseName.length > 20 ? baseName.substring(0, 20) + '...' : baseName,
      extension
    };
  };

  const copyToClipboard = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const downloadWithBackground = async () => {
    if (!file.result) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = file.result!;
    });

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.fillStyle = file.backgroundColor || 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.file.name.split('.')[0]}_sans_fond.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  const { name, extension } = formatFileName(file.file.name);
  const currentModel = models.find(m => m.id === file.model);

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-700 w-full">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <FileImage className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1.5">
                    {metadata && (
                      <p className="text-xs text-gray-400">
                        {metadata.width} × {metadata.height}px
                      </p>
                    )}
                    
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
                  <span className="text-gray-400">Nom : </span>
                  <span className="text-gray-300">{name}.{extension}</span>
                </p>
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
            style={{ backgroundColor: !showOriginal ? (file.backgroundColor || 'transparent') : undefined }}
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

          {file.status === 'completed' && !showOriginal && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(file.result!)}
                    className="btn-icon"
                    title="Copier l'image"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={downloadWithBackground}
                    className="btn-secondary py-1.5 px-3 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="btn-icon"
                  title="Couleur de fond"
                >
                  <Palette className="w-4 h-4" />
                </button>
              </div>

              {showColorPicker && (
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <div className="flex flex-wrap gap-2">
                    {predefinedColors.map(color => (
                      <button
                        key={color.value}
                        onClick={() => onBackgroundColorChange?.(file.id, color.value)}
                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center ${
                          file.backgroundColor === color.value
                            ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900'
                            : 'hover:ring-2 hover:ring-emerald-500/50 hover:ring-offset-2 hover:ring-offset-slate-900'
                        }`}
                        style={{
                          backgroundColor: color.value === 'transparent' ? '#1e293b' : color.value,
                          opacity: color.value === 'transparent' ? 0.5 : 1
                        }}
                        title={color.name}
                      >
                        <span className="text-xs">{color.icon}</span>
                      </button>
                    ))}
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={file.backgroundColor === 'transparent' ? '#FFFFFF' : file.backgroundColor || '#FFFFFF'}
                        onChange={(e) => onBackgroundColorChange?.(file.id, e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-gray-400">
                        Personnalisée
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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