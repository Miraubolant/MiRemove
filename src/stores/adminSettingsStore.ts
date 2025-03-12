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
}

interface AdminSettingsState {
  settings: AdminSettings;
  loading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<AdminSettings>) => Promise<void>;
}

// Créer un channel pour les mises à jour en temps réel
const settingsChannel = supabase.channel('admin_settings_changes');

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
        maintenance_message: 'Site en maintenance, merci de revenir plus tard.'
      },
      loading: true,

      loadSettings: async () => {
        try {
          const { data, error } = await supabase
            .from('admin_settings')
            .select('*')
            .single();

          if (error) throw error;

          if (data) {
            const newSettings = {
              ...get().settings,
              ...data
            };
            
            set({ settings: newSettings, loading: false });

            // Mettre à jour le store d'utilisation avec la nouvelle limite
            useUsageStore.getState().updateMaxFreeImages(data.free_user_max_images);
          }
        } catch (err) {
          console.error('Error loading settings:', err);
          set({ loading: false });
        }
      },

      updateSettings: async (newSettings: Partial<AdminSettings>) => {
        try {
          const { error } = await supabase
            .from('admin_settings')
            .update(newSettings)
            .not('id', 'is', null);

          if (error) throw error;

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

// S'abonner aux changements en temps réel
settingsChannel
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public',
    table: 'admin_settings' 
  }, () => {
    // Recharger les paramètres lorsqu'un changement est détecté
    useAdminSettingsStore.getState().loadSettings();
  })
  .subscribe();