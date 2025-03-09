import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Copy, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export function ImageModal({ imageUrl, onClose }: ImageModalProps) {
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
      const padding = 32; // 16px padding on each side
      const maxModalWidth = viewportWidth - (padding * 2);
      const maxModalHeight = viewportHeight - (padding * 2);
      const toolbarHeight = 116; // Header + toolbar + footer

      // Calculate available space for the image
      const availableWidth = maxModalWidth;
      const availableHeight = maxModalHeight - toolbarHeight;

      // Calculate scale to fit the image within available space
      const scaleX = availableWidth / imageSize.width;
      const scaleY = availableHeight / imageSize.height;
      const initialScale = Math.min(scaleX, scaleY, 1);

      // Calculate final modal dimensions
      let finalWidth = Math.min(imageSize.width * initialScale, maxModalWidth);
      let finalHeight = (imageSize.height * initialScale) + toolbarHeight;

      // Ensure minimum dimensions
      finalWidth = Math.max(finalWidth, 320);
      finalHeight = Math.max(finalHeight, 240);

      setModalSize({ width: finalWidth, height: finalHeight });
      setScale(initialScale);
    };

    updateModalSize();

    // Update modal size when window is resized
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
      const response = await fetch(imageUrl);
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
    a.href = imageUrl;
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

  const modalContent = (
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
          <div className="w-px h-4 bg-gray-700/50" />
          <button
            onClick={resetView}
            className="btn-icon"
            title="Réinitialiser la vue"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
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
          <img
            ref={imageRef}
            src={imageUrl}
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

        {/* Instructions */}
        <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-2 text-xs text-gray-400 border-t border-gray-700/50 rounded-b-lg">
          <p>Échap pour fermer</p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
}