import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useUsageStore } from './usageStore';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Translate error messages to French
        let errorMessage = "Une erreur est survenue lors de la connexion";
        if (error.message === "Invalid login credentials") {
          errorMessage = "Email ou mot de passe incorrect";
        }
        throw new Error(errorMessage);
      }

      set({ user: data.user, error: null });
      useUsageStore.getState().setAuthenticated(true);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Une erreur est survenue" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        // Translate error messages to French
        let errorMessage = "Une erreur est survenue lors de l'inscription";
        if (error.message.includes("already registered")) {
          errorMessage = "Cet email est déjà utilisé";
        }
        throw new Error(errorMessage);
      }

      set({ user: data.user, error: null });
      useUsageStore.getState().setAuthenticated(true);
      
      // Créer le profil manuellement si le trigger a échoué
      if (data.user) {
        try {
          await supabase.rpc('create_user_profile_manual', {
            p_user_id: data.user.id,
            p_email: data.user.email
          });
        } catch (profileError) {
          console.warn('Warning: Could not create user profile:', profileError);
          // L'inscription a réussi même si le profil n'a pas été créé
        }
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Une erreur est survenue" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ user: null, error: null });
      useUsageStore.getState().setAuthenticated(false);
      
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token');
    } catch (err) {
      console.error('Error signing out:', err);
      set({ error: "Une erreur est survenue lors de la déconnexion" });
      // Still clear local state even if API call fails
      set({ user: null });
      useUsageStore.getState().setAuthenticated(false);
    } finally {
      set({ loading: false });
    }
  },
  setUser: (user) => {
    set({ user, loading: false });
    useUsageStore.getState().setAuthenticated(!!user);
  },
  clearError: () => set({ error: null })
}));

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setUser(session?.user ?? null);
});

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setUser(session?.user ?? null);
});