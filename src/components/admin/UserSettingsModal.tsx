import React, { useState, useEffect } from 'react';
import { X, Shield, AlertTriangle, Lock, Save, Users, Crown, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Group {
  id: string;
  name: string;
  image_limit: number;
}

interface UserStats {
  id: string;
  user_id: string;
  email: string;
  is_admin: boolean;
  image_limit: number;
  groups?: Group[];
}

interface UserSettingsModalProps {
  user: UserStats;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserSettingsModal({ user, onClose, onSuccess }: UserSettingsModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLimit, setImageLimit] = useState(user.image_limit);
  const [isAdmin, setIsAdmin] = useState(user.is_admin);
  const [userGroups, setUserGroups] = useState<Group[]>([]);

  useEffect(() => {
    loadUserGroups();
  }, []);

  async function loadUserGroups() {
    try {
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            name,
            image_limit
          )
        `)
        .eq('user_id', user.user_id);

      if (membersError) throw membersError;

      const groups = groupMembers
        ?.map(member => member.groups)
        .filter(group => group !== null) as Group[];

      setUserGroups(groups || []);
    } catch (err) {
      console.error('Error loading user groups:', err);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          is_admin: isAdmin,
          image_limit: imageLimit,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      setError('Erreur lors de la modification des paramètres');
      console.error('Error updating user settings:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-200">
                  Paramètres utilisateur
                </h3>
                <div className="flex flex-col gap-2 mt-1">
                  <p className="text-sm text-gray-400">{user.email}</p>
                  {userGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {userGroups.map(group => (
                        <span
                          key={group.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-full"
                        >
                          <Users className="w-3 h-3" />
                          {group.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Settings Form */}
          <div className="space-y-6">
            {/* Image Limit */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Limite d'images
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={imageLimit}
                  onChange={(e) => setImageLimit(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 bg-slate-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  min="0"
                />
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <Lock className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Nombre maximum d'images que l'utilisateur peut traiter
              </p>
            </div>

            {/* Admin Rights */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Droits administrateur
              </label>
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-300">Administrateur</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="animate-spin">⌛</span>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}