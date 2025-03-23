import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Copy, ZoomIn, ZoomOut, RotateCcw, SplitSquareVertical, Layers, Check } from 'lucide-react';
import { removeBackground } from '../services/api';

interface ImageModalProps {
  imageUrl: string;
  originalUrl?: string;
  onClose: () => void;
}

const models = [
  { id: 'bria', name: 'Standard', description: 'Modèle général polyvalent' },
  { id: 'mannequin', name: 'Mannequin', description: 'Optimisé pour les photos de mannequins' },
  { id: 'packshot', name: 'Packshot', description: 'Optimisé pour les photos de vêtements sans mannequin' }
];

export function ImageModal({ imageUrl, originalUrl, onClose }: ImageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [modalSize, setModalSize] = useState({ width: 0, height: 0 });
  const [isMouseOverImage, setIsMouseOverImage] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [selectedModel, setSelectedModel] = useState('bria');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [portalContainer] = useState(() => {
    const el = document.createElement('div');
    el.setAttribute('id', 'modal-root');
    return el;
  });

  useEffect(() => {
    document.body.appendChild(portalContainer);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.removeChild(portalContainer);
      document.body.style.overflow = '';
    };
  }, [portalContainer]);

  useEffect(() => {
    const updateModalSize = () => {
      if (!imageSize.width || !imageSize.height) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 32;
      const maxModalWidth = viewportWidth - (padding * 2);
      const maxModalHeight = viewportHeight - (padding * 2);
      const toolbarHeight = 116;

      const availableWidth = maxModalWidth;
      const availableHeight = maxModalHeight - toolbarHeight;

      const scaleX = availableWidth / imageSize.width;
      const scaleY = availableHeight / imageSize.height;
      const initialScale = Math.min(scaleX, scaleY, 1);

      let finalWidth = Math.min(imageSize.width * initialScale, maxModalWidth);
      let finalHeight = (imageSize.height * initialScale) + toolbarHeight;

      finalWidth = Math.max(finalWidth, 320);
      finalHeight = Math.max(finalHeight, 240);

      setModalSize({ width: finalWidth, height: finalHeight });
      setScale(initialScale);
      centerImage();
    };

    updateModalSize();

    window.addEventListener('resize', updateModalSize);
    return () => window.removeEventListener('resize', updateModalSize);
  }, [imageSize]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const currentImage = showOriginal ? imageUrl : (processedImageUrl || imageUrl);
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      resetView();
    };
    img.src = currentImage;
  }, [showOriginal, imageUrl, processedImageUrl]);

  const centerImage = () => {
    if (!containerRef.current || !imageRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const scaledWidth = imageRef.current.naturalWidth * scale;
    const scaledHeight = imageRef.current.naturalHeight * scale;
    
    setPosition({
      x: (container.width - scaledWidth) / 2,
      y: (container.height - scaledHeight) / 2
    });
  };

  const constrainPosition = (pos: { x: number; y: number }) => {
    if (!containerRef.current || !imageRef.current) return pos;

    const container = containerRef.current.getBoundingClientRect();
    const scaledWidth = imageRef.current.naturalWidth * scale;
    const scaledHeight = imageRef.current.naturalHeight * scale;

    const minX = Math.min(0, container.width - scaledWidth);
    const maxX = Math.max(0, container.width - scaledWidth);
    const minY = Math.min(0, container.height - scaledHeight);
    const maxY = Math.max(0, container.height - scaledHeight);

    return {
      x: Math.min(maxX, Math.max(minX, pos.x)),
      y: Math.min(maxY, Math.max(minY, pos.y))
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === imageRef.current) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newPosition = constrainPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });

    setPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isMouseOverImage) return;
    
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      const newScale = Math.min(Math.max(0.1, scale + delta), 5);
      setScale(newScale);
    } else {
      const newPosition = constrainPosition({
        x: position.x - e.deltaX,
        y: position.y - e.deltaY
      });
      setPosition(newPosition);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    centerImage();
  }, [scale, modalSize]);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const copyToClipboard = async () => {
    try {
      const response = await fetch(showOriginal ? imageUrl : (processedImageUrl || imageUrl));
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = showOriginal ? imageUrl : (processedImageUrl || imageUrl);
    a.download = 'image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetView = () => {
    if (!containerRef.current || !imageRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const scaleX = container.width / imageRef.current.naturalWidth;
    const scaleY = container.height / imageRef.current.naturalHeight;
    const newScale = Math.min(scaleX, scaleY, 1);
    
    setScale(newScale);
    centerImage();
  };

  const handleModelSelect = async (modelId: string) => {
    setSelectedModel(modelId);
    setShowModelSelector(false);
    setIsProcessing(true);

    try {
      // Convert image URL to File object
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'image.png', { type: blob.type });

      // Process image with selected model
      const result = await removeBackground(file, modelId);
      setProcessedImageUrl(result);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-8"
      onClick={handleBackgroundClick}
    >
      <div 
        className="bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-800/50 flex flex-col max-w-[95vw] max-h-[95vh]"
        style={{
          width: modalSize.width || 'auto',
          height: modalSize.height || 'auto'
        }}
      >
        {/* Header */}
        <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between rounded-t-lg border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-1.5 rounded">
              <img src={imageUrl} className="w-4 h-4 object-cover rounded" alt="thumbnail" />
            </div>
            <span className="text-sm text-gray-300">
              {imageSize.width} × {imageSize.height}px
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-800/60 backdrop-blur-sm border-b border-gray-700/50 px-4 py-2 flex items-center gap-2 sticky top-0 z-10">
          <div className="flex items-center gap-2 border-r border-gray-700/50 pr-2">
            <button
              onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
              className="btn-icon"
              title="Zoom arrière"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="px-2 py-1 text-sm text-gray-300 hover:bg-gray-700/50 rounded"
              title="Réinitialiser le zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={() => setScale(s => Math.min(5, s + 0.1))}
              className="btn-icon"
              title="Zoom avant"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 border-r border-gray-700/50 pr-2">
            <button
              onClick={resetView}
              className="btn-icon"
              title="Réinitialiser la vue"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 border-r border-gray-700/50 pr-2">
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`btn-icon ${showOriginal ? 'bg-emerald-500/10 text-emerald-500' : ''}`}
              title={showOriginal ? "Voir le résultat" : "Voir l'original"}
            >
              <SplitSquareVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex items-center gap-2 border-r border-gray-700/50 pr-2">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className={`btn-icon ${showModelSelector ? 'bg-emerald-500/10 text-emerald-500' : ''}`}
              title="Changer de modèle"
            >
              <Layers className="w-4 h-4" />
            </button>

            {showModelSelector && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-gray-700/50 p-2 space-y-1">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`w-full px-3 py-2 text-left rounded-lg hover:bg-slate-700/50 flex items-center gap-2 ${
                      selectedModel === model.id ? 'bg-emerald-500/10 text-emerald-500' : 'text-gray-300'
                    }`}
                  >
                    {selectedModel === model.id && <Check className="w-4 h-4 flex-shrink-0" />}
                    <div className="flex-1">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-400">{model.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="btn-icon"
              title="Copier l'image"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={downloadImage}
              className="btn-icon"
              title="Télécharger l'image"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div
          ref={containerRef}
          className="relative bg-white overflow-auto flex-1"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setIsMouseOverImage(false);
          }}
          onMouseEnter={() => setIsMouseOverImage(true)}
        >
          {isProcessing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white">Traitement en cours...</div>
            </div>
          ) : (
            <img
              ref={imageRef}
              src={showOriginal ? imageUrl : (processedImageUrl || imageUrl)}
              alt="Preview"
              className={`max-w-none select-none absolute ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                transformOrigin: '0 0'
              }}
              draggable={false}
            />
          )}
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2 text-xs text-gray-400 border-t border-gray-700/50 rounded-b-lg">
          <p>Échap pour fermer</p>
        </div>
      </div>
    </div>,
    portalContainer
  );
}