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
      className="aspect-square bg-slate-800/30 rounded-xl cursor-pointer hover:bg-slate-700/30 transition-all duration-300 group border-2 border-transparent hover:border-emerald-500"
      onClick={handleClick}
    >
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-500/10 transition-all duration-300">
            <Plus className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300" />
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
            Ajouter une image
          </span>
        </div>
      </div>
    </div>
  );
}