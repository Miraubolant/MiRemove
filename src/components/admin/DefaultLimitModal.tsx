import React, { useState } from 'react';
import { X, AlertTriangle, Lock, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DefaultLimitModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentLimit: number;
}

export function DefaultLimitModal({ onClose, onSuccess, currentLimit }: DefaultLimitModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState(currentLimit);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .rpc('update_default_image_limit', {
          new_limit: newLimit
        });

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de la modification de la limite par défaut');
      console.error('Error updating default limit:', err);
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
                <Lock className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">
                Limite d'images par défaut
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
                Nouvelle limite par défaut
              </label>
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                min="0"
              />
              <p className="text-sm text-gray-400">
                Cette limite sera appliquée à tous les nouveaux utilisateurs.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}