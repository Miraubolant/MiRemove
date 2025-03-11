import { create } from 'zustand';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'usage_count';
const STORAGE_KEY = 'usage_data';
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

interface StorageData {
  processCount: number;
  lastUpdated: number;
}

// Fonction utilitaire pour obtenir le compteur depuis les deux sources
const getCount = (): number => {
  try {
    // Récupérer les données du localStorage
    const storageData = localStorage.getItem(STORAGE_KEY);
    const localData: StorageData | null = storageData ? JSON.parse(storageData) : null;
    
    // Récupérer le compteur des cookies
    const cookieCount = Cookies.get(COOKIE_NAME);
    const cookieValue = cookieCount ? parseInt(cookieCount, 10) : 0;

    // Si les données du localStorage sont plus récentes, les utiliser
    if (localData && localData.lastUpdated > (cookieValue || 0)) {
      return localData.processCount;
    }

    // Sinon utiliser la valeur des cookies
    return cookieValue;
  } catch {
    // En cas d'erreur, utiliser la valeur des cookies comme fallback
    const cookieCount = Cookies.get(COOKIE_NAME);
    return cookieCount ? parseInt(cookieCount, 10) : 0;
  }
};

// Fonction utilitaire pour sauvegarder le compteur dans les deux sources
const saveCount = (count: number) => {
  try {
    // Sauvegarder dans localStorage avec timestamp
    const storageData: StorageData = {
      processCount: count,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

    // Sauvegarder dans les cookies
    Cookies.set(COOKIE_NAME, count.toString(), {
      expires: COOKIE_EXPIRY,
      secure: window.location.protocol === 'https:',
      sameSite: 'lax',
      path: '/'
    });
  } catch (error) {
    console.error('Error saving count:', error);
  }
};

// Fonction utilitaire pour effacer les données
const clearStoredData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    Cookies.remove(COOKIE_NAME, { path: '/' });
  } catch (error) {
    console.error('Error clearing stored data:', error);
  }
};

export const useUsageStore = create<UsageState>()((set, get) => ({
  processCount: getCount(),
  isAuthenticated: false,
  
  setAuthenticated: (authenticated: boolean) => {
    set({ isAuthenticated: authenticated });
    if (!authenticated) {
      // Lors de la déconnexion, on restaure le compteur depuis le stockage
      set({ processCount: getCount() });
    }
  },

  incrementCount: () => {
    if (get().isAuthenticated) return;
    
    const currentCount = getCount();
    if (currentCount >= MAX_FREE_PROCESSES) return;
    
    const newCount = currentCount + 1;
    saveCount(newCount);
    set({ processCount: newCount });
  },

  resetCount: () => {
    clearStoredData();
    set({ processCount: 0 });
  },

  canProcess: () => {
    if (get().isAuthenticated) return true;
    return getCount() < MAX_FREE_PROCESSES;
  },

  remainingProcesses: () => {
    if (get().isAuthenticated) return Infinity;
    return Math.max(0, MAX_FREE_PROCESSES - getCount());
  },
}));