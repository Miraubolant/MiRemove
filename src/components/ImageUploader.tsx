import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, FileType, ArrowRight } from 'lucide-react';

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
      className={`dropzone group relative rounded-3xl border-2 border-dashed p-8 transition-all duration-500 ${
        isDragging 
          ? 'border-emerald-500 bg-emerald-500/10' 
          : 'border-slate-700/50 hover:border-emerald-500/70 bg-slate-900'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Overlay effect when dragging */}
      <div className={`absolute inset-0 bg-emerald-500/5 backdrop-blur-sm rounded-3xl transition-opacity duration-300 ${
        isDragging ? 'opacity-100' : 'opacity-0'
      }`}></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-slate-700/[0.05] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
      
      <div className="flex flex-col items-center relative z-10">
        <div 
          className="relative cursor-pointer transform hover:scale-110 transition-all duration-500 group"
          onClick={handleClick}
        >
          {/* Background with solid color instead of gradient */}
          <div className="relative bg-emerald-600 p-5 sm:p-7 rounded-full shadow-xl shadow-emerald-500/20 mb-6 sm:mb-8 group-hover:shadow-emerald-500/30 transition-all duration-500">
            {/* Icon with scale effect */}
            <Upload className="w-10 h-10 sm:w-14 sm:h-14 text-white group-hover:scale-125 transition-all duration-500" />
          </div>
          
          {/* Rotating circular indicator */}
          <div className={`absolute -inset-2 border-2 border-dashed border-emerald-500/40 rounded-full transition-all duration-1000 ${
            isDragging ? 'opacity-100 animate-spin-slow' : 'opacity-0'
          }`}></div>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 text-center px-4">
          {isDragging ? "Déposez pour importer" : "Glissez vos images ici"}
        </h3>
        
        <p className="text-emerald-400/90 font-medium text-base mb-4 text-center max-w-md">
          Ou utilisez le sélecteur de fichiers pour parcourir vos images
        </p>
        
        <div className="flex items-center gap-3 text-gray-300 mb-6 bg-slate-800 px-4 py-2 rounded-full">
          <FileType className="w-4 h-4 text-emerald-500" />
          <span className="text-sm">Formats supportés: JPG, PNG, WEBP</span>
        </div>
        
        <button
          onClick={handleClick}
          className="relative group overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-[0.98] w-auto"
        >
          <div className="relative flex items-center gap-3">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg">Parcourir les fichiers</span>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-300" />
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