import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Check, Shield, Users, Settings, Clock, BarChart3, Sparkles, Timer } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserStats {
  id: string;
  user_id: string;
  email: string;
  image_limit: number;
  processed_images: number;
  success_count: number;
  failure_count: number;
  total_processing_time: number;
  is_admin: boolean;
}

interface AdminSettingsModalProps {
  onClose: () => void;
}

interface UserSettingsPopupProps {
  user: UserStats;
  onClose: () => void;
  onSuccess: () => void;
}

function UserSettingsPopup({ user, onClose, onSuccess }: UserSettingsPopupProps) {
  const [newImageLimit, setNewImageLimit] = useState(user.image_limit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdateImageLimit() {
    if (newImageLimit < 0) return;

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          image_limit: newImageLimit,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      setError("Erreur lors de la modification de la limite d'images");
      console.error('Error updating image limit:', err);
    } finally {
      setSaving(false);
    }
  }

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
                <Settings className="w-5 h-5 text-emerald-500" />
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
                Limite d'images
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={newImageLimit}
                  onChange={(e) => setNewImageLimit(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-field flex-1"
                  min="0"
                />
                <button
                  onClick={handleUpdateImageLimit}
                  disabled={saving || newImageLimit === user.image_limit}
                  className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </div>

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

export function AdminSettingsModal({ onClose }: AdminSettingsModalProps) {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [totalStats, setTotalStats] = useState({
    totalImages: 0,
    totalTime: 0,
    avgSuccessRate: 0,
    avgProcessingTime: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Calculate global statistics
    const totalImages = users.reduce((sum, user) => sum + user.processed_images, 0);
    const totalTime = users.reduce((sum, user) => sum + user.total_processing_time, 0);
    const totalSuccess = users.reduce((sum, user) => sum + user.success_count, 0);
    
    setTotalStats({
      totalImages,
      totalTime,
      avgSuccessRate: totalImages > 0 ? (totalSuccess / totalImages) * 100 : 0,
      avgProcessingTime: totalImages > 0 ? totalTime / totalImages : 0
    });
  }, [users]);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }

  const formatTimeNumeric = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="relative bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-5xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto mx-auto my-auto">
        {/* Effet de gradient sur le fond */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent rounded-xl pointer-events-none"></div>

        {/* En-tête */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-xl animate-pulse"></div>
              <div className="bg-emerald-500/10 p-2 rounded-lg relative">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Statistiques globales
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Global Statistics */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-medium text-gray-400">Total images traitées</h3>
              </div>
              <p className="text-2xl font-semibold text-emerald-500">{totalStats.totalImages}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-medium text-gray-400">Temps total de traitement</h3>
              </div>
              <p className="text-2xl font-semibold text-emerald-500">{formatTimeNumeric(totalStats.totalTime)}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-medium text-gray-400">Taux de réussite moyen</h3>
              </div>
              <p className="text-2xl font-semibold text-emerald-500">{totalStats.avgSuccessRate.toFixed(1)}%</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-medium text-gray-400">Temps moyen par image</h3>
              </div>
              <p className="text-2xl font-semibold text-emerald-500">{formatTimeNumeric(totalStats.avgProcessingTime)}</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Utilisateur</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                    <div className="flex items-center justify-end gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Images traitées</span>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                    <div className="flex items-center justify-end gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Taux de réussite</span>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                    <div className="flex items-center justify-end gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Temps moyen</span>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                    <div className="flex items-center justify-end gap-2">
                      <Timer className="w-4 h-4" />
                      <span>Temps total</span>
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const successRate = user.processed_images > 0
                    ? Math.round((user.success_count / user.processed_images) * 100)
                    : 0;
                  const avgTime = user.processed_images > 0
                    ? user.total_processing_time / user.processed_images
                    : 0;

                  return (
                    <tr key={user.id} className="border-b border-gray-800/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">{user.email}</span>
                          {user.is_admin && (
                            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-gray-300">{user.processed_images}</span>
                        <span className="text-gray-500"> / </span>
                        <span className="text-emerald-500">{user.image_limit}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`${
                          successRate >= 90 ? 'text-emerald-500' :
                          successRate >= 70 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {successRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300">
                        {formatTimeNumeric(avgTime)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300">
                        {formatTimeNumeric(user.total_processing_time)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 px-2 py-1 rounded transition-colors"
                          >
                            Modifier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUser && (
        <UserSettingsPopup
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={loadUsers}
        />
      )}
    </div>
  );
}