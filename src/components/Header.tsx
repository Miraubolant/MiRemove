import React from 'react';
import { Wand2 } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-20">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-2.5 rounded-lg shadow-lg">
                <Wand2 className="w-6 h-6 text-cream" />
              </div>
              <h1 className="text-2xl font-bold text-gray-200">
                MiRemover
              </h1>
            </div>
            <p className="text-sm text-gray-400">
              Supprimez l'arrière-plan de vos images en quelques clics
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}