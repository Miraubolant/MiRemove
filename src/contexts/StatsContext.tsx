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
  addProcessingResult: (success: boolean, processingTime: number, operationType: string) => void;
  resetStats: () => void;
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

  // Charger les statistiques de l'utilisateur depuis Supabase
  useEffect(() => {
    async function loadUserStats() {
      if (!user) {
        setStats(initialStats);
        return;
      }

      try {
        const { data: existingStats, error } = await supabase
          .from('user_stats')
          .select('processed_images, success_count, failure_count, total_processing_time')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading user stats:', error);
          return;
        }

        if (existingStats) {
          const totalImages = existingStats.success_count + existingStats.failure_count;
          setStats({
            processedImages: existingStats.processed_images,
            successCount: existingStats.success_count,
            failureCount: existingStats.failure_count,
            totalProcessingTime: existingStats.total_processing_time,
            successRate: calculateSuccessRate(existingStats.success_count, totalImages),
            averageProcessingTime: existingStats.total_processing_time / existingStats.processed_images || 0
          });
        } else {
          // Initialiser les stats pour un nouvel utilisateur
          const initialUserStats = {
            user_id: user.id,
            processed_images: 0,
            success_count: 0,
            failure_count: 0,
            total_processing_time: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: insertError } = await supabase
            .from('user_stats')
            .insert([initialUserStats]);

          if (insertError) {
            console.error('Error initializing user stats:', insertError);
          }

          setStats(initialStats);
        }
      } catch (error) {
        console.error('Error in loadUserStats:', error);
        setStats(initialStats);
      }
    }

    loadUserStats();
  }, [user]);

  const addProcessingResult = useCallback(async (success: boolean, processingTime: number, operationType: string) => {
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

    // Si l'utilisateur est connecté, mettre à jour les stats dans Supabase
    if (user) {
      try {
        const { error } = await supabase
          .rpc('update_operation_stats', {
            p_user_id: user.id,
            p_operation: operationType,
            p_success: success,
            p_processing_time: processingTime
          });

        if (error) throw error;
      } catch (err) {
        console.error('Error updating operation stats:', err);
      }
    }
  }, [user]);

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
    const handleImageProcessed = (event: CustomEvent<{ 
      success: boolean; 
      processingTime: number;
      operationType: string;
    }>) => {
      const { success, processingTime, operationType } = event.detail;
      addProcessingResult(success, processingTime, operationType);
    };

    window.addEventListener('imageProcessed', handleImageProcessed as EventListener);
    return () => window.removeEventListener('imageProcessed', handleImageProcessed as EventListener);
  }, [addProcessingResult]);

  return (
    <StatsContext.Provider value={{ stats, addProcessingResult, resetStats }}>
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