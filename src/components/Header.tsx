import React, { useState, useEffect } from 'react';
import { Wand2, BarChart3, LogIn, MailQuestion as QuestionMark, Shield } from 'lucide-react';
import { StatsModal } from './StatsModal';
import { AuthModal } from './AuthModal';
import { AdminSettingsModal } from './admin/AdminSettingsModal';
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
  const [hasScrolled, setHasScrolled] = useState(false);
  const { stats } = useStats();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const wasAtTop = isAtTop;
      const newIsAtTop = scrollTop === 0;
      
      setIsAtTop(newIsAtTop);
      setHasScrolled(true);

      if (newIsAtTop && wasAtTop) {
        setHasScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAtTop]);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        return;
      }

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
        setIsAdmin(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  return (
    <>
      <header className="border-b border-gray-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 sm:h-24 px-3 sm:px-6">
            {/* Logo et titre */}
            <div className="flex items-center gap-3 group">
              <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                <div 
                  className={`absolute inset-0 bg-emerald-500/20 rounded-lg blur-2xl transition-all duration-500 ${
                    isAtTop && hasScrolled ? 'opacity-100 scale-125' : 'opacity-0 scale-100'
                  }`}
                />
                
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 sm:p-3.5 rounded-lg shadow-lg overflow-hidden">
                  <Wand2 
                    className={`w-6 h-6 sm:w-8 sm:h-8 text-white transform transition-all duration-500 ${
                      isAtTop && hasScrolled ? '-rotate-45 scale-110' : 'rotate-0 scale-100'
                    }`}
                  />
                  
                  <div 
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ${
                      isAtTop && hasScrolled ? '-translate-x-full' : 'translate-x-full'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="relative group">
                  <h3 className="text-2xl sm:text-3xl tracking-tight">
                    <span className="text-white">
                      MiRemover
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                    Supprimez l'arrière-plan de vos images en quelques clics
                  </p>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 overflow-hidden">
                    <div 
                      className={`w-full h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 transform origin-left transition-transform duration-500 ${
                        isAtTop && hasScrolled ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons de droite */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onShowGuide}
                className="bg-slate-800/50 text-gray-300 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors hover:bg-slate-700/50 text-sm sm:text-base"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <QuestionMark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Guide</span>
                </div>
              </button>

              <button
                onClick={() => setShowStats(true)}
                className="bg-slate-800/50 text-gray-300 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors hover:bg-slate-700/50 text-sm sm:text-base"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Statistiques</span>
                </div>
              </button>

              {user && isAdmin && (
                <button
                  onClick={() => setShowAdminSettings(true)}
                  className="bg-slate-800/50 text-gray-300 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors hover:bg-slate-700/50 text-sm sm:text-base"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
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
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors hover:from-emerald-700 hover:to-emerald-600 text-sm sm:text-base"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
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