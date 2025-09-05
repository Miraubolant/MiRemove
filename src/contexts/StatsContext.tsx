import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

interface SessionStats {
  processedImages: number;
  successRate: number;
  averageProcessingTime: number;
  totalProcessingTime: number;
  successCount: number;
  failureCount: number;
}

interface StatsContextType {
  stats: SessionStats;
  addProcessingResult: (success: boolean, processingTime: number, operation?: string) => void;
  resetStats: () => void;
  refreshStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | null>(null);

const initialStats: SessionStats = {
  processedImages: 0,
  successRate: 100,
  averageProcessingTime: 0,
  totalProcessingTime: 0,
  successCount: 0,
  failureCount: 0
};

const calculateSuccessRate = (successCount: number, totalImages: number): number => {
  if (totalImages === 0) return 100;
  return Math.round((successCount / totalImages) * 100);
};

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<SessionStats>(initialStats);
  const { user } = useAuthStore();

  // Fonction pour charger les statistiques (externe pour pouvoir être appelée)
  const loadUserStats = useCallback(async () => {
      if (!user) {
        setStats(initialStats);
        return;
      }

      try {
        // Charger les statistiques depuis les tables directement
        const { data: userStatsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statsError) {
          console.error('Error loading user stats:', statsError);
          setStats(initialStats);
          return;
        }

        // Charger les logs récents pour calculer les taux de succès
        const { data: recentLogs, error: logsError } = await supabase
          .from('processing_logs')
          .select('success, processing_time_ms, created_at')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 30 derniers jours
          .order('created_at', { ascending: false })
          .limit(100);

        const logs = recentLogs || [];
        const successCount = logs.filter(log => log.success).length;
        const failureCount = logs.filter(log => !log.success).length;
        const totalProcessingTime = logs
          .filter(log => log.processing_time_ms)
          .reduce((sum, log) => sum + (log.processing_time_ms || 0), 0);

        setStats({
          processedImages: userStatsData?.total_operations || 0,
          successCount,
          failureCount,
          totalProcessingTime,
          successRate: calculateSuccessRate(successCount, successCount + failureCount),
          averageProcessingTime: successCount > 0 ? totalProcessingTime / successCount : 0
        });
      } catch (error) {
        console.error('Error in loadUserStats:', error);
        setStats(initialStats);
      }
    }, [user]);

    // Utiliser la fonction dans useEffect
    useEffect(() => {
      loadUserStats();
    }, [loadUserStats]);

    // Fonction publique pour rafraîchir les stats
    const refreshStats = useCallback(async () => {
      await loadUserStats();
    }, [loadUserStats]);

  const addProcessingResult = useCallback(async (success: boolean, processingTime: number, operation: string = 'bg_removal') => {
    // Mettre à jour les stats locales pour la session
    setStats(currentStats => {
      const newStats = {
        processedImages: currentStats.processedImages + 1,
        successCount: currentStats.successCount + (success ? 1 : 0),
        failureCount: currentStats.failureCount + (success ? 0 : 1),
        totalProcessingTime: currentStats.totalProcessingTime + processingTime,
        successRate: 0,
        averageProcessingTime: 0
      };

      const totalImages = newStats.successCount + newStats.failureCount;
      newStats.successRate = calculateSuccessRate(newStats.successCount, totalImages);
      newStats.averageProcessingTime = newStats.totalProcessingTime / newStats.processedImages;

      return newStats;
    });

    // Les stats sont maintenant gérées par logProcessingOperation dans usageStore
    // Ce contexte ne sert plus que pour les stats de session locale
  }, []);

  const resetStats = useCallback(async () => {
    setStats(initialStats);

    if (user) {
      try {
        const { error } = await supabase
          .from('user_stats')
          .update({
            processed_images: 0,
            success_count: 0,
            failure_count: 0,
            total_processing_time: 0,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error resetting user stats:', error);
        }
      } catch (error) {
        console.error('Error in resetStats:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    const handleImageProcessed = (event: CustomEvent<{ success: boolean; processingTime: number; operation?: string }>) => {
      const { success, processingTime, operation } = event.detail;
      addProcessingResult(success, processingTime, operation);
    };

    window.addEventListener('imageProcessed', handleImageProcessed as EventListener);
    return () => window.removeEventListener('imageProcessed', handleImageProcessed as EventListener);
  }, [addProcessingResult]);

  return (
    <StatsContext.Provider value={{ stats, addProcessingResult, resetStats, refreshStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}