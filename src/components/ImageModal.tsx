import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ZoomIn, ZoomOut, SplitSquareVertical, PaintBucket } from 'lucide-react';
import { removeBackground } from '../services/api';

interface ImageModalProps {
  imageUrl: string;
  originalUrl?: string;
  onClose: () => void;
  processingMode?: 'resize' | 'ai' | 'both';
}

const DEFAULT_MODAL_WIDTH = 1600;
const DEFAULT_MODAL_HEIGHT = 900;

export function ImageModal({ imageUrl, originalUrl, onClose, processingMode }: ImageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [modalSize, setModalSize] = useState({ width: DEFAULT_MODAL_WIDTH, height: DEFAULT_MODAL_HEIGHT });
  const [isMouseOverImage, setIsMouseOverImage] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [hasWhiteBackground, setHasWhiteBackground] = useState(false);
  const [portalContainer] = useState(() => {
    const el = document.createElement('div');
    el.setAttribute('id', 'modal-root');
    return el;
  });

  // Determine if we should show white background
  const shouldShowWhiteBackground = !showOriginal && hasWhiteBackground;

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
      const maxModalWidth = Math.min(DEFAULT_MODAL_WIDTH, viewportWidth - (padding * 2));
      const maxModalHeight = Math.min(DEFAULT_MODAL_HEIGHT, viewportHeight - (padding * 2));
      const toolbarHeight = 80;

      const availableWidth = maxModalWidth;
      const availableHeight = maxModalHeight - toolbarHeight;

      const scaleX = availableWidth / imageSize.width;
      const scaleY = availableHeight / imageSize.height;
      const initialScale = Math.min(scaleX, scaleY, 1);

      let finalWidth = Math.min(imageSize.width * initialScale, maxModalWidth);
      let finalHeight = (imageSize.height * initialScale) + toolbarHeight;

      finalWidth = Math.max(finalWidth, 800);
      finalHeight = Math.max(finalHeight, 600);

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
    const currentImage = showOriginal ? (originalUrl || imageUrl) : imageUrl;
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      resetView();
    };
    img.src = currentImage;
  }, [showOriginal, imageUrl, originalUrl]);

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

  const downloadImage = async () => {
    try {
      // Get the image data
      const response = await fetch(showOriginal ? (originalUrl || imageUrl) : imageUrl);
      const blob = await response.blob();

      // Create a canvas to convert to JPG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });

      // Set canvas dimensions to match original image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Add white background if needed
      if (hasWhiteBackground) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw the image at original size
      ctx.drawImage(img, 0, 0);

      // Convert to JPG
      const jpgBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
      });

      // Create download link
      const url = URL.createObjectURL(jpgBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'image.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      URL.revokeObjectURL(url);
      URL.revokeObjectURL(img.src);
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
    }
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

  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300"
      onClick={handleBackgroundClick}
    >
      <div 
        className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 flex flex-col overflow-hidden"
        style={{
          width: modalSize.width,
          height: modalSize.height,
          maxWidth: '95vw',
          maxHeight: '95vh'
        }}
      >
        {/* Header */}
        <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between rounded-t-2xl border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-lg">
              <img src={imageUrl} className="w-6 h-6 object-cover rounded" alt="thumbnail" />
            </div>
            <span className="text-sm font-medium text-gray-200">
              {imageSize.width} × {imageSize.height}px
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-800/60 backdrop-blur-sm border-b border-gray-700/50 px-6 py-3">
          <div className="flex items-center gap-6">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Zoom arrière"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <div className="px-3 py-1.5 text-sm text-gray-200 bg-gray-700/30 rounded-lg">
                {Math.round(scale * 100)}%
              </div>
              <button
                onClick={() => setScale(s => Math.min(5, s + 0.1))}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Zoom avant"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-700/50"></div>

            {/* Toggle White Background */}
            <button
              onClick={() => setHasWhiteBackground(!hasWhiteBackground)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                hasWhiteBackground 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
              title={hasWhiteBackground ? "Retirer le fond blanc" : "Ajouter un fond blanc"}
            >
              <PaintBucket className="w-5 h-5" />
              <span className="text-sm font-medium">Fond blanc</span>
            </button>

            {/* Compare Original (if available) */}
            {originalUrl && (
              <>
                <div className="h-8 w-px bg-gray-700/50"></div>
                
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    showOriginal 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                  title={showOriginal ? "Voir le résultat" : "Voir l'original"}
                >
                  <SplitSquareVertical className="w-5 h-5" />
                  <span className="text-sm font-medium">{showOriginal ? "Original" : "Résultat"}</span>
                </button>
              </>
            )}

            {/* Spacer */}
            <div className="flex-grow"></div>

            {/* Download */}
            <button
              onClick={downloadImage}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              title="Télécharger l'image en JPG"
            >
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Télécharger</span>
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div
          ref={containerRef}
          className="relative overflow-auto flex-1 rounded-b-2xl"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setIsMouseOverImage(false);
          }}
          onMouseEnter={() => setIsMouseOverImage(true)}
          style={{
            backgroundColor: shouldShowWhiteBackground ? '#FFFFFF' : '#18181B'
          }}
        >
          {!shouldShowWhiteBackground && (
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CiAgPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMjIyMjIyIi8+CiAgPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMyMjIyMjIiLz4KPC9zdmc+')] bg-center" />
            </div>
          )}
          
          <img
            ref={imageRef}
            src={showOriginal ? (originalUrl || imageUrl) : imageUrl}
            alt="Preview"
            className={`max-w-none select-none absolute ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              transformOrigin: '0 0'
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>,
    portalContainer
  );
}