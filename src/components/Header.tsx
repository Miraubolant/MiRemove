import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wand2, Download, MailQuestion as QuestionMark, Shield, BarChart3, 
  LogIn, Menu, X, Activity
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { UserMenu } from './UserMenu';
import { AdvancedStatsModal } from './AdvancedStatsModal';
import { AdminSettingsModal } from './admin/AdminSettingsModal';
import { useStats } from '../contexts/StatsContext';
import { useAuthStore } from '../stores/authStore';
import { useUsageStore } from '../stores/usageStore';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onShowGuide: () => void;
}

// Fonction globale pour rafraîchir les stats du header
let refreshHeaderStats: () => void = () => {};

export { refreshHeaderStats };

export function Header({ onShowGuide }: HeaderProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuthStore();
  const { stats, refreshStats } = useStats();
  const { processCount, maxFreeImages } = useUsageStore();
  const [userTotal, setUserTotal] = useState(0);
  const [maxQuota, setMaxQuota] = useState(0);
  const [quotaSource, setQuotaSource] = useState<'user' | 'group'>('user');
  const [groupName, setGroupName] = useState<string | null>(null);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data: userProfile, error } = await supabase
          .from('user_profiles')
          .select('user_level')
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        setIsAdmin(userProfile?.user_level === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    }
    checkAdminStatus();
  }, [user]);

  // Gérer le scroll pour l'animation du titre
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile sur resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fonction pour charger les données
  const loadData = useCallback(async () => {
      try {
        if (!user) {
          // Utilisateur non connecté : utiliser le compteur local
          setUserTotal(processCount);
          setMaxQuota(maxFreeImages);
          setQuotaSource('user');
          setGroupName(null);
          return;
        }

        // Charger les stats de l'utilisateur et son profil
        const { data: userStats } = await supabase
          .from('user_stats')
          .select('total_operations')
          .eq('user_id', user.id)
          .single();

        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('image_limit')
          .eq('user_id', user.id)
          .single();

        const userOperations = userStats?.total_operations || 0;
        const userLimit = userProfile?.image_limit || 100; // 100 par défaut
        setUserTotal(userOperations);

        // Vérifier si l'utilisateur fait partie d'un groupe (utiliser maybeSingle au lieu de single)
        const { data: groupMember } = await supabase
          .from('group_members')
          .select(`
            groups (
              id,
              name,
              image_limit,
              current_month_operations
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (groupMember?.groups) {
          // Pour un groupe, on utilise directement les données du groupe
          setUserTotal(groupMember.groups.current_month_operations || 0); // Usage mensuel du groupe
          setMaxQuota(groupMember.groups.image_limit || 10000); // Limite du groupe
          setQuotaSource('group');
          setGroupName(groupMember.groups.name);
        } else {
          // Utiliser le quota personnel
          setUserTotal(userOperations); // Stats personnelles
          setMaxQuota(userLimit); // Utiliser la vraie limite de l'utilisateur
          setQuotaSource('user');
          setGroupName(null);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Si pas de données, utiliser les valeurs par défaut
        if (!user) {
          setUserTotal(0);
          setMaxQuota(10);
        }
      }
  }, [user, processCount, maxFreeImages]);

  // Assigner la fonction de rafraîchissement globale
  useEffect(() => {
    refreshHeaderStats = loadData;
    return () => {
      refreshHeaderStats = () => {};
    };
  }, [loadData]);

  // Charger les quotas restants et le total d'opérations
  useEffect(() => {
    loadData();
    
    // Recharger toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const menuItems = [
    {
      icon: Download,
      label: 'Desktop',
      href: '#', // Desktop app download link to be configured
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      hoverBorder: 'hover:border-emerald-500/40',
      show: !!user
    },
    {
      icon: QuestionMark,
      label: 'Guide',
      onClick: onShowGuide,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      hoverBorder: 'hover:border-blue-500/40',
      show: true
    },
    {
      icon: BarChart3,
      label: 'Statistiques',
      onClick: () => setShowStats(true),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      hoverBorder: 'hover:border-purple-500/40',
      show: true
    },
    {
      icon: Shield,
      label: 'Admin',
      onClick: () => setShowAdminSettings(true),
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      hoverBorder: 'hover:border-amber-500/40',
      show: user && isAdmin
    }
  ];

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative transform hover:scale-110 transition-transform duration-500">
                <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 p-2.5 sm:p-3 rounded-xl shadow-lg shadow-emerald-500/20 overflow-hidden border border-emerald-500/20">
                  <Wand2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
              
              <div className="relative">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-emerald-100 bg-clip-text text-transparent">
                    MiRemover
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-emerald-400/90 font-medium mt-0.5">
                  Traitement intelligent de vos images
                </p>
                
                {/* Barre animée sous le titre */}
                <div className="absolute -bottom-1 left-0 w-full h-0.5 overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 transform origin-left transition-transform duration-500 ${scrolled ? 'scale-x-100' : 'scale-x-0'}`} />
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {menuItems.filter(item => item.show).map((item, index) => {
                const Icon = item.icon;
                
                if (item.href) {
                  return (
                    <a
                      key={index}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-gray-300 hover:text-white bg-slate-800/40 hover:bg-slate-700/60 border border-transparent ${item.hoverBorder} hover:shadow-lg transform hover:scale-105`}
                    >
                      <div className={`${item.bgColor} p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span>{item.label}</span>
                    </a>
                  );
                }
                
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-gray-300 hover:text-white bg-slate-800/40 hover:bg-slate-700/60 border border-transparent ${item.hoverBorder} hover:shadow-lg transform hover:scale-105`}
                  >
                    <div className={`${item.bgColor} p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Section & Mobile Menu Button */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Stats Preview - Ultra Modern & Minimal */}
              <div className="flex items-center gap-2 bg-slate-800/20 backdrop-blur-md rounded-full px-4 py-2 border border-slate-700/20 hover:bg-slate-800/30 transition-all duration-300">
                {/* Usage Count */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {userTotal}
                  </span>
                </div>
                
                <div className="text-slate-500 text-sm">/</div>
                
                {/* Max Quota */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-300 tabular-nums">
                    {maxQuota === -1 ? '∞' : maxQuota}
                  </span>
                  {quotaSource === 'group' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" title={`Groupe: ${groupName}`}></div>
                  )}
                </div>

              </div>

              {/* User Menu */}
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white rounded-xl transition-all duration-300 text-sm font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-500/50 transform hover:scale-105 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 relative z-10">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Connexion</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden relative p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <Menu 
                    className={`absolute w-5 h-5 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'
                    }`} 
                  />
                  <X 
                    className={`absolute w-5 h-5 transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-75'
                    }`} 
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 bg-slate-900/98 backdrop-blur-xl border-b border-slate-800/60 z-50 md:hidden animate-in slide-in-from-top-2 duration-300">
              <div className="max-w-[1600px] mx-auto px-4 py-6">
                
                {/* Simplified Stats Card */}
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/40 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/20 p-2 rounded-lg">
                        <Activity className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Utilisation</div>
                        {quotaSource === 'group' && groupName && (
                          <div className="text-xs text-blue-400">Groupe: {groupName}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <span className="text-emerald-400">{userTotal}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-blue-400">{maxQuota === -1 ? '∞' : maxQuota}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.max(0, maxQuota - userTotal)} restantes
                      </div>
                    </div>
                  </div>
                  
                  {maxQuota !== -1 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Progression</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {Math.round((userTotal / maxQuota) * 100)}%
                          </span>
                          <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                              style={{
                                width: `${Math.min(100, (userTotal / maxQuota) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Menu Items */}
                <nav className="grid grid-cols-2 gap-3">
                  {menuItems.filter(item => item.show).map((item, index) => {
                    const Icon = item.icon;
                    
                    if (item.href) {
                      return (
                        <a
                          key={index}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex flex-col items-center gap-2 p-4 rounded-2xl text-sm font-medium transition-all duration-300 text-gray-300 hover:text-white bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/30 hover:border-slate-600/50 hover:scale-105`}
                        >
                          <div className={`${item.bgColor} p-3 rounded-xl transition-all duration-300 group-hover:scale-110`}>
                            <Icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <span className="text-center">{item.label}</span>
                        </a>
                      );
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          item.onClick?.();
                          setIsMobileMenuOpen(false);
                        }}
                        className={`group flex flex-col items-center gap-2 p-4 rounded-2xl text-sm font-medium transition-all duration-300 text-gray-300 hover:text-white bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/30 hover:border-slate-600/50 hover:scale-105`}
                      >
                        <div className={`${item.bgColor} p-3 rounded-xl transition-all duration-300 group-hover:scale-110`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className="text-center">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </>
        )}
      </header>
      
      {/* Modals */}
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}
      
      {showStats && (
        <AdvancedStatsModal
          stats={stats}
          onClose={() => setShowStats(false)}
        />
      )}
      
      {showAdminSettings && (
        <AdminSettingsModal onClose={() => setShowAdminSettings(false)} />
      )}
    </>
  );
}