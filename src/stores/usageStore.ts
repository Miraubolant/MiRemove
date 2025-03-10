import { create } from 'zustand';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'usage_count';
const COOKIE_EXPIRY = 7; // 7 jours
const MAX_FREE_PROCESSES = 5;

interface UsageState {
  processCount: number;
  isAuthenticated: boolean;
  incrementCount: () => void;
  resetCount: () => void;
  canProcess: () => boolean;
  remainingProcesses: () => number;
  setAuthenticated: (authenticated: boolean) => void;
}

// Fonction utilitaire pour obtenir le compteur depuis les cookies
const getCountFromCookie = (): number => {
  const count = Cookies.get(COOKIE_NAME);
  return count ? parseInt(count, 10) : 0;
};

// Fonction utilitaire pour définir le compteur dans les cookies
const setCountInCookie = (count: number) => {
  Cookies.set(COOKIE_NAME, count.toString(), {
    expires: COOKIE_EXPIRY,
    secure: window.location.protocol === 'https:',
    sameSite: 'lax',
    path: '/'
  });
};

// Initialiser le compteur depuis les cookies
const initialCount = getCountFromCookie();

export const useUsageStore = create<UsageState>()((set, get) => ({
  processCount: initialCount,
  isAuthenticated: false,
  setAuthenticated: (authenticated: boolean) => {
    set({ isAuthenticated: authenticated });
    if (authenticated) {
      Cookies.remove(COOKIE_NAME);
      set({ processCount: 0 });
    } else {
      // Restaurer le compteur depuis les cookies lors de la déconnexion
      set({ processCount: getCountFromCookie() });
    }
  },
  incrementCount: () => {
    if (get().isAuthenticated) return;
    
    const newCount = get().processCount + 1;
    set({ processCount: newCount });
    setCountInCookie(newCount);
  },
  resetCount: () => {
    set({ processCount: 0 });
    Cookies.remove(COOKIE_NAME);
  },
  canProcess: () => {
    if (get().isAuthenticated) return true;
    return getCountFromCookie() < MAX_FREE_PROCESSES;
  },
  remainingProcesses: () => {
    if (get().isAuthenticated) return Infinity;
    return Math.max(0, MAX_FREE_PROCESSES - getCountFromCookie());
  },
}));