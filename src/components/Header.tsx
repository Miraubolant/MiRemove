import React, { useState, useEffect } from 'react';
import { Wand2, BarChart3, LogIn, MailQuestion as QuestionMark, Shield } from 'lucide-react';
import { StatsModal } from './StatsModal';
import { AuthModal } from './AuthModal';
import { AdminSettingsModal } from './AdminSettingsModal';
import { UserMenu } from './UserMenu';
import { useStats } from '../contexts/StatsContext';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onShowGuide: () => void;
}

export function Header({ onShowGuide }: HeaderProps) {
  const [showStats, setShowStats] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const { stats } = useStats();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY === 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Vérifie la position initiale
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) return;

      try {
        const { data: userStats, error } = await supabase
          .from('user_stats')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setIsAdmin(userStats?.is_admin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }

    checkAdminStatus();
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-24 bg-slate-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex items-center justify-between h-full px-3 sm:px-6">
          {/* Logo et titre */}
          <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
            <div className="relative transform transition-all duration-500 group-hover:scale-110">
              {/* Cercles lumineux */}
              <div className={`absolute inset-0 scale-150 transition-opacity duration-500 ${
                !isAtTop ? 'opacity-0' : 'opacity-100'
              }`}>
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute inset-0 bg-emerald-600/20 rounded-full blur-3xl animate-pulse delay-75"></div>
                <div className="absolute inset-0 bg-emerald-700/20 rounded-full blur-2xl animate-pulse delay-150"></div>
              </div>

              {/* Logo container */}
              <div className={`bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg relative transform transition-all duration-500 ${
                !isAtTop ? '-rotate-45 scale-75' : 'rotate-0 scale-100'
              } hover:rotate-180`}>
                <Wand2 className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>

            {/* Titre et sous-titre */}
            <div>
              {/* Titre toujours visible */}
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent transform group-hover:scale-105 transition-transform duration-500">
                MiRemover
              </h1>
              {/* Sous-titre avec animation de fade */}
              <p className={`text-xs sm:text-sm text-gray-400 hidden sm:block transform transition-all duration-500 ${
                !isAtTop ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              } group-hover:translate-y-1`}>
                Supprimez l'arrière-plan de vos images en quelques clics
              </p>
            </div>
          </div>

          {/* Boutons de droite */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onShowGuide}
              className="btn-header"
            >
              <QuestionMark className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            <button
              onClick={() => setShowStats(true)}
              className="btn-header"
            >
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Statistiques</span>
            </button>

            {user && isAdmin && (
              <button
                onClick={() => setShowAdminSettings(true)}
                className="btn-header"
              >
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {user ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="btn-header-primary"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Connexion</span>
              </button>
            )}
          </div>
        </div>
      </div>

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

      {showAdminSettings && (
        <AdminSettingsModal
          onClose={() => setShowAdminSettings(false)}
        />
      )}
    </header>
  );
}