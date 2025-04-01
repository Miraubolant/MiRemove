import React, { useState } from 'react';
import { X, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserStats {
  id: string;
  user_id: string;
  email: string;
  is_admin: boolean;
}

interface UserSettingsPopupProps {
  user: UserStats;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserSettingsPopup({ user, onClose, onSuccess }: UserSettingsPopupProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggleAdmin() {
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          is_admin: !user.is_admin,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de la modification des droits administrateur');
      console.error('Error updating admin rights:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">
                Paramètres de {user.email}
              </h3>
            </div>
            <button onClick={onClose} className="btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Droits administrateur
              </label>
              <button
                onClick={handleToggleAdmin}
                disabled={saving}
                className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                <Shield className="w-5 h-5" />
                <span>
                  {saving ? 'Modification...' : user.is_admin ? 'Retirer les droits admin' : 'Donner les droits admin'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}