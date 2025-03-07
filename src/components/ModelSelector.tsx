import React from 'react';
import { ImageIcon, Sparkles } from 'lucide-react';
import { Model } from '../types';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  models: Model[];
  hasPendingFiles: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, onSubmit, models, hasPendingFiles }: ModelSelectorProps) {
  return (
    <form className="flex flex-col sm:flex-row gap-6 items-end">
      <div className="flex-1 space-y-2">
        <label className="block">
          <span className="text-base font-medium text-olive dark:text-gray-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-olive dark:text-emerald-500" />
            Choisir le modèle d'IA
          </span>
          <p className="text-sm text-olive-light dark:text-gray-400 mt-1 mb-2">
            Sélectionnez le modèle le plus adapté à vos images
          </p>
          <select
            value={selectedModel}
            onChange={onModelChange}
            className="mt-1 block w-full input-field text-base"
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={!hasPendingFiles}
        className={`btn-primary min-w-[200px] h-[46px] ${!hasPendingFiles ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transform transition-transform'}`}
      >
        <ImageIcon className="w-5 h-5" />
        <span>Traiter les images</span>
      </button>
    </form>
  );
}