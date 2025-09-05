import React, { useState, useEffect } from 'react';
import { X, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useUsageStore } from '../stores/usageStore';

interface LimitModalProps {
  onClose: () => void;
  onLogin: () => void;
  isImageLimit?: boolean;
}

interface LimitInfo {
  isGroup: boolean;
  limitValue: number;
  usageCount: number;
  groupName?: string;
  isAdmin: boolean;
}

export function LimitModal({ onClose, onLogin, isImageLimit }: LimitModalProps) {
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { maxFreeImages, processCount } = useUsageStore();

  useEffect(() => {
    const fetchLimitInfo = async () => {
      setLoading(true);
      
      // Pour les utilisateurs non connectés
      if (!user) {
        setLimitInfo({
          isGroup: false,
          limitValue: maxFreeImages,
          usageCount: processCount,
          isAdmin: false
        });
        setLoading(false);
        return;
      }

      try {
        // Récupérer les vraies données via RPC (source unique et fiable)
        const { data: rpcData, error: rpcError } = await supabase.rpc('check_user_quota', {
          p_user_id: user.id,
          p_operations_count: 0 // Just checking current state
        });

        console.log('DEBUG - RPC check_user_quota:', rpcData, 'error:', rpcError);

        if (rpcError || !rpcData) {
          console.error('Error fetching RPC quota data:', rpcError);
          setLimitInfo({
            isGroup: false,
            limitValue: 1000,
            usageCount: 0,
            isAdmin: false
          });
          setLoading(false);
          return;
        }

        // Les fonctions RPC incluent déjà la logique admin et groupe
        // Utiliser uniquement les données RPC (source de vérité)
        
        if (rpcData.quota_type === 'group') {
          // Utilisateur avec groupe - quota du groupe
          console.log('DEBUG - Quota groupe détecté:', {
            quota_type: rpcData.quota_type,
            limit: rpcData.limit,
            used: rpcData.used,
            remaining: rpcData.remaining
          });
          
          setLimitInfo({
            isGroup: true,
            limitValue: rpcData.limit,
            usageCount: rpcData.used,
            groupName: 'Groupe', // Les RPC ne retournent pas le nom, mais on sait que c'est un groupe
            isAdmin: false
          });
        } else {
          // Utilisateur sans groupe - quota personnel (utiliser les données RPC)
          console.log('DEBUG - Quota personnel détecté:', {
            quota_type: rpcData.quota_type,
            limit: rpcData.limit,
            used: rpcData.used,
            remaining: rpcData.remaining
          });
          
          // Vérifier si c'est un admin (limite très élevée = admin)
          const isAdmin = rpcData.limit >= 999999;
          
          setLimitInfo({
            isGroup: false,
            limitValue: rpcData.limit,
            usageCount: rpcData.used,
            isAdmin: isAdmin
          });
        }
      } catch (error) {
        console.error('Error fetching limit info:', error);
        setLimitInfo({
          isGroup: false,
          limitValue: 1000,
          usageCount: 0,
          isAdmin: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLimitInfo();
  }, [user, maxFreeImages, processCount]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <LogIn className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-lg font-medium text-gray-200">
                {loading ? (
                  "Chargement..."
                ) : isImageLimit && limitInfo ? (
                  limitInfo.isGroup 
                    ? "Limite du groupe atteinte"
                    : user
                    ? "Quota personnel atteint"
                    : "Limite gratuite atteinte"
                ) : (
                  "Connectez-vous pour continuer"
                )}
              </p>
            </div>
            <button onClick={onClose} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-400">
            {loading ? (
              "Chargement des informations de quota..."
            ) : isImageLimit && limitInfo ? (
              limitInfo.isGroup ? (
                `Vous avez atteint la limite du groupe "${limitInfo.groupName}" pour ce mois : ${limitInfo.usageCount.toLocaleString()} / ${limitInfo.limitValue.toLocaleString()} opérations effectuées. Veuillez contacter l'administrateur du groupe pour augmenter la limite.`
              ) : user ? (
                `Vous avez atteint votre quota personnel : ${limitInfo.usageCount.toLocaleString()} / ${limitInfo.limitValue.toLocaleString()} opérations au total. Veuillez contacter le support pour augmenter votre limite.`
              ) : (
                `Vous avez atteint la limite gratuite : ${limitInfo.usageCount} / ${limitInfo.limitValue} images traitées. Connectez-vous pour bénéficier d'un quota plus élevé.`
              )
            ) : (
              "Connectez-vous pour profiter d'un nombre illimité de traitements et accéder à toutes les fonctionnalités."
            )}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors"
            >
              Plus tard
            </button>
            {!isImageLimit && (
              <button
                onClick={() => {
                  onClose();
                  onLogin();
                }}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                Se connecter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}