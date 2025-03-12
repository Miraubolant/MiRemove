import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploader({ isDragging, onDragOver, onDragLeave, onDrop, onFileChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDragOver(e);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDragLeave(e);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(e);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="dropzone group"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <div 
          className="relative cursor-pointer transform hover:scale-110 transition-all duration-500 group"
          onClick={handleClick}
        >
          {/* Button background with gradient */}
          <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 sm:p-6 rounded-full shadow-lg mb-4 sm:mb-6 group-hover:shadow-emerald-500/25 transition-all duration-500">
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </div>
            
            {/* Icon */}
            <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>
        
        <h3 className="text-base sm:text-lg font-medium text-gray-200 mb-2 text-center px-4">
          Glissez vos images ici
        </h3>
        
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <ImageIcon className="w-4 h-4" />
          <span className="text-xs sm:text-sm">JPG, PNG, WEBP</span>
        </div>
        
        <button
          onClick={handleClick}
          className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 sm:gap-2.5 hover:scale-105 active:scale-[0.98] w-full sm:w-auto"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          
          {/* Animated particles */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-white/30 rounded-full animate-particle-${i + 1}`}
                style={{
                  left: '50%',
                  top: '50%'
                }}
              />
            ))}
          </div>
          
          <div className="relative flex items-center gap-2">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Parcourir les fichiers</span>
          </div>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
          multiple
        />
      </div>
    </div>
  );
}