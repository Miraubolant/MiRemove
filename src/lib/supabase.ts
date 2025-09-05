import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isDev = import.meta.env.DEV;

// Utiliser le mock en développement si CORS pose problème
const USE_MOCK = isDev && localStorage.getItem('use-mock-supabase') === 'true';

if (!supabaseUrl || !supabaseAnonKey) {
  if (!USE_MOCK) {
    throw new Error('Missing Supabase environment variables');
  }
}

export const supabase = USE_MOCK 
  ? mockSupabase as any
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'supabase.auth.token',
        storage: localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      },
    });