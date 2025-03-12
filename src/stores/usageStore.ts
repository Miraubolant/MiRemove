import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface UsageState {
  processCount: number;
  isAuthenticated: boolean;
  maxFreeImages: number;
  imageLimit: number;
  incrementCount: () => void;
  resetCount: () => void;
  canProcess: () => Promise<boolean>;
  remainingProcesses: () => Promise<number>;
  setAuthenticated: (authenticated: boolean) => void;
  updateMaxFreeImages: (newMax: number) => void;
  updateImageLimit: (newLimit: number) => void;
}

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      processCount: 0,
      isAuthenticated: false,
      maxFreeImages: 10,
      imageLimit: 1000,

      setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated });
        if (!authenticated) {
          set({ processCount: 0 });
        }
      },

      updateMaxFreeImages: (newMax: number) => {
        set({ maxFreeImages: newMax });
      },

      updateImageLimit: (newLimit: number) => {
        set({ imageLimit: newLimit });
      },

      incrementCount: () => {
        if (get().isAuthenticated) return;
        set(state => ({ processCount: state.processCount + 1 }));
      },

      resetCount: () => {
        set({ processCount: 0 });
      },

      canProcess: async () => {
        if (!get().isAuthenticated) {
          return get().processCount < get().maxFreeImages;
        }

        // Check user's image limit
        const { data: userStats } = await supabase
          .from('user_stats')
          .select('processed_images, image_limit')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (!userStats) return false;
        return userStats.processed_images < userStats.image_limit;
      },

      remainingProcesses: async () => {
        if (!get().isAuthenticated) {
          return Math.max(0, get().maxFreeImages - get().processCount);
        }

        // Get remaining images for authenticated user
        const { data: userStats } = await supabase
          .from('user_stats')
          .select('processed_images, image_limit')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (!userStats) return 0;
        return Math.max(0, userStats.image_limit - userStats.processed_images);
      },
    }),
    {
      name: 'usage-storage',
      partialize: (state) => ({ maxFreeImages: state.maxFreeImages, imageLimit: state.imageLimit }),
    }
  )
);