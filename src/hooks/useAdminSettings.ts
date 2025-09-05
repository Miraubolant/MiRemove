import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminSettings {
  user_limits: {
    free_user_max_images: number;
    max_file_size_mb: number;
    max_concurrent_processes: number;
    cooldown_period_minutes: number;
  };
  ai_models: {
    enabled_models: string[];
    default_model: string;
    model_quotas: {
      free_users: string[];
      premium_users: string[];
    };
  };
  image_processing: {
    max_width: number;
    max_height: number;
    default_quality: number;
    compression_enabled: boolean;
    allowed_formats: string[];
  };
  maintenance: {
    maintenance_mode: boolean;
    maintenance_message: string;
    allowed_ips: string[];
  };
}

const defaultSettings: AdminSettings = {
  user_limits: {
    free_user_max_images: 5,
    max_file_size_mb: 10,
    max_concurrent_processes: 1,
    cooldown_period_minutes: 0
  },
  ai_models: {
    enabled_models: [],
    default_model: 'isnet-general-use',
    model_quotas: {
      free_users: [],
      premium_users: []
    }
  },
  image_processing: {
    max_width: 2048,
    max_height: 2048,
    default_quality: 80,
    compression_enabled: true,
    allowed_formats: ['image/jpeg', 'image/png', 'image/webp']
  },
  maintenance: {
    maintenance_mode: false,
    maintenance_message: '',
    allowed_ips: []
  }
};

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsMap = data.reduce((acc: any, curr) => {
          try {
            acc[curr.key] = typeof curr.value === 'string' ? JSON.parse(curr.value) : curr.value;
          } catch (e) {
            acc[curr.key] = curr.value;
          }
          return acc;
        }, {});

        setSettings({
          ...defaultSettings,
          ...settingsMap
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }

  return {
    settings,
    loading,
    defaultSettings
  };
}