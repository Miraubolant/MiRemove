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
  const { stats } = useStats();
  const { user } = useAuthStore();

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <header className="border-b border-gray-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 sm:h-24 px-3 sm:px-6">
            {/* Logo et titre (aligné à gauche) */}
            <button
              onClick={scrollToTop}
              className="group focus:outline-none"
            >
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-xl sm:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg relative">
                    <Wand2 className="w-5 h-5 sm:w-8 sm:h-8 text-white transform -rotate-45 group-hover:rotate-[0deg] transition-transform duration-500" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent transform group-hover:scale-105 transition-transform duration-500">
                    MiRemover
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 transform group-hover:translate-y-1 transition-transform duration-500 hidden sm:block">
                    Supprimez l'arrière-plan de vos images en quelques clics
                  </p>
                </div>
              </div>
            </button>

            {/* Boutons de droite */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onShowGuide}
                className="relative group overflow-hidden bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 hover:from-emerald-600/30 hover:to-emerald-500/30 text-gray-300 font-medium px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative flex items-center gap-1.5 sm:gap-2">
                  <QuestionMark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Guide</span>
                </div>
              </button>

              <button
                onClick={() => setShowStats(true)}
                className="relative group overflow-hidden bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 hover:from-emerald-600/30 hover:to-emerald-500/30 text-gray-300 font-medium px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative flex items-center gap-1.5 sm:gap-2">
                  <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Statistiques</span>
                </div>
              </button>

              {user && isAdmin && (
                <button
                  onClick={() => setShowAdminSettings(true)}
                  className="relative group overflow-hidden bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 hover:from-emerald-600/30 hover:to-emerald-500/30 text-gray-300 font-medium px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base"
                >
                  <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="relative flex items-center gap-1.5 sm:gap-2">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                    <span className="hidden sm:inline">Admin</span>
                  </div>
                </button>
              )}

              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 text-sm sm:text-base"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="relative flex items-center gap-1.5 sm:gap-2">
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Connexion</span>
                  </div>
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

      {showAdminSettings && (
        <AdminSettingsModal
          onClose={() => setShowAdminSettings(false)}
        />
      )}
    </>
  );
}