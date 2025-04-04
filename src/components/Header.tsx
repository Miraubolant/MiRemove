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
      <header className={`border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${!isAtTop ? 'shadow-lg shadow-black/20' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-8">
            {/* Logo et titre */}
            <div className="flex items-center gap-4 group">
              <div className="relative transform group-hover:scale-110 transition-transform duration-500">
                {/* Removed the radiant div */}
                
                <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-500 p-3 sm:p-4 rounded-2xl shadow-lg shadow-emerald-500/20 overflow-hidden">
                  <Wand2 
                    className={`w-6 h-6 sm:w-7 sm:h-7 text-white transform transition-all duration-500 ${
                      isAtTop && hasScrolled ? '-rotate-45 scale-110' : 'rotate-0 scale-100'
                    }`}
                  />
                  
                  <div 
                    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ${
                      isAtTop && hasScrolled ? '-translate-x-full' : 'translate-x-full'
                    }`}
                  />
                </div>
              </div>
              <div>
                <div className="relative group">
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    <span className="text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text">
                      MiRemover
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-400/90 font-medium mt-0.5">
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
                className="bg-slate-800/70 text-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-300 hover:bg-slate-700/70 text-sm sm:text-base border border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex items-center gap-2">
                  <QuestionMark className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                  <span className="hidden sm:inline font-medium">Guide</span>
                </div>
              </button>
              
              <button
                onClick={() => setShowStats(true)}
                className="bg-slate-800/70 text-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-300 hover:bg-slate-700/70 text-sm sm:text-base border border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                  <span className="hidden sm:inline font-medium">Statistiques</span>
                </div>
              </button>
              
              {user && isAdmin && (
                <button
                  onClick={() => setShowAdminSettings(true)}
                  className="bg-slate-800/70 text-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-300 hover:bg-slate-700/70 text-sm sm:text-base border border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    <span className="hidden sm:inline font-medium">Admin</span>
                  </div>
                </button>
              )}
              
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-300 text-sm sm:text-base font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 border border-emerald-500/50"
                >
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
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