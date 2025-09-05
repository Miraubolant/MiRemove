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
  logProcessingOperation: (operationType: string, operationsCount: number, success: boolean, processingTime?: number, fileSize?: number, errorMessage?: string) => Promise<void>;
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
        if (!get().isAuthenticated) {
          set({ processCount: 0 });
        }
      },

      logProcessingOperation: async (operationType: string, operationsCount: number = 1, success: boolean = true, processingTime?: number, fileSize?: number, errorMessage?: string) => {
        if (!get().isAuthenticated) {
          // Pour les utilisateurs non-authentifiés, le quota a déjà été pré-réservé
          // Cette fonction ne fait que logguer pour les statistiques
          return;
        }

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Use the new RPC function to log the operation
          const { data, error } = await supabase.rpc('log_processing_operation', {
            p_user_id: user.id,
            p_operation_type: operationType,
            p_operations_count: operationsCount,
            p_success: success,
            p_processing_time_ms: processingTime,
            p_file_size_bytes: fileSize,
            p_error_message: errorMessage
          });

          if (error) {
            console.error('Error logging operation:', error);
            throw error;
          }

          // Update local state with response data if available
          if (data && data.user_level) {
            set({ imageLimit: data.limit });
          }

          return data;
        } catch (err) {
          console.error('Error in logProcessingOperation:', err);
          throw err;
        }
      },

      canProcess: async () => {
        if (!get().isAuthenticated) {
          // PROTECTION STRICTE : Vérifier avec une marge de sécurité
          const currentCount = get().processCount;
          const maxImages = get().maxFreeImages;
          return currentCount < maxImages; // Strictement inférieur
        }

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return false;

          // EXCEPTION ADMIN : Les admins sont détectés par leur quota élevé
          // Pas besoin de requête supplémentaire, on va le détecter dans la réponse RPC

          // Use the new RPC function to check quota
          const { data, error } = await supabase.rpc('check_user_quota', {
            p_user_id: user.id,
            p_operations_count: 1
          });

          if (error) {
            console.error('Error checking quota:', error);
            return false;
          }

          // Les admins peuvent toujours traiter (quota très élevé)
          if (data.limit >= 999999) {
            return true;
          }

          return data.can_process;
        } catch (err) {
          console.error('Error in canProcess:', err);
          return false;
        }
      },

      remainingProcesses: async () => {
        if (!get().isAuthenticated) {
          return Math.max(0, get().maxFreeImages - get().processCount);
        }

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return 0;

          // EXCEPTION ADMIN : Les admins sont détectés par leur quota élevé
          // Pas besoin de requête supplémentaire, on va le détecter dans la réponse RPC

          // Use the new RPC function to check quota
          const { data, error } = await supabase.rpc('check_user_quota', {
            p_user_id: user.id,
            p_operations_count: 0 // Just checking, not consuming
          });

          if (error) {
            console.error('Error getting remaining processes:', error);
            return 0;
          }

          // Les admins ont un quota "illimité" (quota très élevé)
          if (data.limit >= 999999) {
            return 999999;
          }

          return data.remaining || 0;
        } catch (err) {
          console.error('Error in remainingProcesses:', err);
          return 0;
        }
      },
    }),
    {
      name: 'usage-storage',
      partialize: (state) => ({ maxFreeImages: state.maxFreeImages, imageLimit: state.imageLimit }),
    }
  )
);