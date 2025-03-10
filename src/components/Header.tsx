import React, { useState } from 'react';
import { Wand2, BarChart3, LogIn } from 'lucide-react';
import { StatsModal } from './StatsModal';
import { AuthModal } from './AuthModal';
import { UserMenu } from './UserMenu';
import { useStats } from '../contexts/StatsContext';
import { useAuthStore } from '../stores/authStore';

export function Header() {
  const [showStats, setShowStats] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { stats } = useStats();
  const { user } = useAuthStore();

  return (
    <>
      <header className="border-b border-gray-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20 px-6">
            <div className="flex-1">
              <button
                onClick={() => setShowStats(true)}
                className="btn-secondary py-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Statistiques</span>
              </button>
            </div>

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

            <div className="flex-1 flex justify-end">
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="btn-secondary py-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showStats && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStats(false)}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}