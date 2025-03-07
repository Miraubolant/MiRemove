import React from 'react';
import { Wand2 } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center h-20">
          <div className="flex items-center gap-3 pl-2">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-2.5 rounded-lg shadow-lg">
              <Wand2 className="w-6 h-6 text-cream" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-200">
                MiRemover
              </h1>
              <p className="text-sm text-gray-400 hidden sm:block">
                Supprimez l'arrière-plan de vos images en quelques clics
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}