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
      className={`dropzone group ${isDragging ? 'dropzone-active scale-[1.02]' : ''} transition-transform duration-300 px-4 sm:px-8 lg:px-12`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <div 
          className="relative cursor-pointer hover:scale-110 transition-transform duration-300"
          onClick={handleClick}
        >
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-slate-700 p-4 sm:p-6 rounded-full shadow-lg mb-4 sm:mb-6">
            <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-500" />
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
          className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 sm:gap-2.5 hover:scale-[1.02] active:scale-[0.98] group-hover:scale-105 w-full sm:w-auto"
        >
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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