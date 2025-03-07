import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    // Désactiver le défilement du body
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="relative max-w-7xl w-full max-h-[90vh] flex items-center justify-center"
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-0 -mt-12 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
}