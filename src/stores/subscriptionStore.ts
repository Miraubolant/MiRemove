import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SubscriptionState {
  subscription: any | null;
  loading: boolean;
  error: string | null;
  loadSubscription: (userId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  loading: false,
  error: null,

  loadSubscription: async (userId: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      set({ subscription: data });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  cancelSubscription: async () => {
    try {
      set({ loading: true, error: null });

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      set({ subscription: null });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));