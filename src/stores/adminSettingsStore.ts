import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useUsageStore } from './usageStore';

interface AdminSettings {
  free_user_max_images: number;
  max_file_size_mb: number;
  max_concurrent_processes: number;
  cooldown_period_minutes: number;
  max_width: number;
  max_height: number;
  default_quality: number;
  compression_enabled: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  bria_enabled: boolean;
  bria_api_token: string;
  bria_endpoint: string;
  bria_timeout: number;
  bria_max_retries: number;
}

interface AdminSettingsState {
  settings: AdminSettings;
  loading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<AdminSettings>) => Promise<void>;
}

// Removed WebSocket channel for real-time updates

export const useAdminSettingsStore = create<AdminSettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        free_user_max_images: 10,
        max_file_size_mb: 10,
        max_concurrent_processes: 1,
        cooldown_period_minutes: 0,
        max_width: 2048,
        max_height: 2048,
        default_quality: 80,
        compression_enabled: true,
        maintenance_mode: false,
        maintenance_message: 'Site en maintenance, merci de revenir plus tard.',
        bria_enabled: false,
        bria_api_token: '',
        bria_endpoint: 'https://engine.prod.bria-api.com/v1/background/remove',
        bria_timeout: 30,
        bria_max_retries: 3
      },
      loading: true,

      loadSettings: async () => {
        try {
          const { data, error } = await supabase
            .from('admin_settings')
            .select('key, value');


          if (error) throw error;

          if (data && data.length > 0) {
            // Convertir les données key-value en objet
            const settingsData: any = {};
            data.forEach((row: any) => {
              let value = row.value;
              
              // Convertir les types appropriés
              if (value === 'true') value = true;
              else if (value === 'false') value = false;
              else if (!isNaN(Number(value)) && value !== '') value = Number(value);
              
              settingsData[row.key] = value;
            });

            const oldSettings = get().settings;
            const newSettings = {
              ...oldSettings,
              ...settingsData
            };
            
            
            set({ settings: newSettings, loading: false });

            // Mettre à jour le store d'utilisation avec la nouvelle limite
            if (settingsData.free_user_max_images !== undefined) {
              useUsageStore.getState().updateMaxFreeImages(settingsData.free_user_max_images);
            }
            
          }
        } catch (err) {
          console.error('Error loading settings:', err);
          set({ loading: false });
        }
      },

      updateSettings: async (newSettings: Partial<AdminSettings>) => {
        try {
          // Mettre à jour chaque paramètre individuellement dans le format key-value
          const updatePromises = Object.entries(newSettings).map(([key, value]) => {
            return supabase
              .from('admin_settings')
              .update({ 
                value: value.toString(),
                updated_at: new Date().toISOString()
              })
              .eq('key', key);
          });

          const results = await Promise.all(updatePromises);
          
          // Vérifier s'il y a des erreurs
          const errors = results.filter(result => result.error);
          if (errors.length > 0) {
            throw new Error(`Erreurs lors de la mise à jour: ${errors.map(e => e.error?.message).join(', ')}`);
          }

          const updatedSettings = {
            ...get().settings,
            ...newSettings
          };

          set({ settings: updatedSettings });

          // Mettre à jour le store d'utilisation avec la nouvelle limite
          if (newSettings.free_user_max_images !== undefined) {
            useUsageStore.getState().updateMaxFreeImages(newSettings.free_user_max_images);
          }
        } catch (err) {
          console.error('Error updating settings:', err);
          throw err;
        }
      }
    }),
    {
      name: 'admin-settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

// Real-time updates removed - settings will be loaded on demand