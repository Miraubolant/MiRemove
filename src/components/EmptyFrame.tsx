import React from 'react';
import { Plus } from 'lucide-react';

interface EmptyFrameProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EmptyFrame({ onFileChange }: EmptyFrameProps) {
  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => onFileChange(e as React.ChangeEvent<HTMLInputElement>);
    input.click();
  };

  return (
    <div 
      className="aspect-[3/4] bg-slate-800/20 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-slate-700/30 transition-all duration-300 group border-2 border-dashed border-slate-700/50 hover:border-emerald-500/50 relative overflow-hidden"
      onClick={handleClick}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/10 via-transparent to-slate-800/10 opacity-50" />
      
      <div className="h-full flex items-center justify-center relative z-10">
        <div className="flex flex-col items-center gap-1 sm:gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all duration-300 group-hover:scale-110 border border-emerald-500/20">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300 text-center px-2">
            Ajouter
          </span>
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}