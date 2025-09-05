import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, X, Plus, Edit3, Trash2, 
  AlertTriangle, CheckCircle, Loader2, 
  Globe, Users, Wrench, RefreshCw, Database
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStats } from '../../contexts/StatsContext';
import { refreshHeaderStats } from '../Header';

interface AdminSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface AdminSettingsProps {
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

export function AdminSettings({ onError, onSuccess }: AdminSettingsProps) {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSetting, setNewSetting] = useState({ key: '', value: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      setSettings(data || []);
    } catch (err) {
      console.error('Error loading admin settings:', err);
      const errorMsg = 'Erreur lors du chargement des paramètres';
      setLocalError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string, key: string, value: string, description: string) => {
    setSaving(id);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          value: value.trim(),
          description: description.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Mettre à jour l'état local
      setSettings(prev => prev.map(setting => 
        setting.id === id 
          ? { ...setting, value: value.trim(), description: description.trim(), updated_at: new Date().toISOString() }
          : setting
      ));

      setEditingId(null);
      const successMsg = `Paramètre "${key}" mis à jour avec succès`;
      setLocalSuccess(successMsg);
      onSuccess?.(successMsg);
      setTimeout(() => setLocalSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving setting:', err);
      const errorMsg = 'Erreur lors de la sauvegarde du paramètre';
      setLocalError(errorMsg);
      onError?.(errorMsg);
      setTimeout(() => setLocalError(null), 3000);
    } finally {
      setSaving(null);
    }
  };

  const handleAdd = async () => {
    if (!newSetting.key.trim() || !newSetting.value.trim()) {
      setLocalError('La clé et la valeur sont obligatoires');
      setTimeout(() => setLocalError(null), 3000);
      return;
    }

    // Vérifier que la clé n'existe pas déjà
    if (settings.some(s => s.key.toLowerCase() === newSetting.key.trim().toLowerCase())) {
      setLocalError('Cette clé existe déjà');
      setTimeout(() => setLocalError(null), 3000);
      return;
    }

    setSaving('new');
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .insert([{
          key: newSetting.key.trim().toLowerCase(),
          value: newSetting.value.trim(),
          description: newSetting.description.trim() || null
        }])
        .select()
        .single();

      if (error) throw error;

      setSettings(prev => [...prev, data].sort((a, b) => a.key.localeCompare(b.key)));
      setNewSetting({ key: '', value: '', description: '' });
      setShowAddForm(false);

      const successMsg = `Paramètre "${data.key}" créé avec succès`;
      setLocalSuccess(successMsg);
      onSuccess?.(successMsg);
      setTimeout(() => setLocalSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding setting:', err);
      const errorMsg = 'Erreur lors de l\'ajout du paramètre';
      setLocalError(errorMsg);
      onError?.(errorMsg);
      setTimeout(() => setLocalError(null), 3000);
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le paramètre "${key}" ?`)) {
      return;
    }

    setSaving(id);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSettings(prev => prev.filter(s => s.id !== id));
      
      const successMsg = `Paramètre "${key}" supprimé avec succès`;
      setLocalSuccess(successMsg);
      onSuccess?.(successMsg);
      setTimeout(() => setLocalSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting setting:', err);
      const errorMsg = 'Erreur lors de la suppression du paramètre';
      setLocalError(errorMsg);
      onError?.(errorMsg);
      setTimeout(() => setLocalError(null), 3000);
    } finally {
      setSaving(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSettingIcon = (key: string) => {
    if (key.includes('limit') || key.includes('max')) return Users;
    if (key.includes('maintenance') || key.includes('mode')) return Wrench;
    return Globe;
  };

  const getSettingColor = (key: string) => {
    if (key.includes('limit') || key.includes('max')) return 'text-blue-400';
    if (key.includes('maintenance') || key.includes('mode')) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {localError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{localError}</p>
        </div>
      )}

      {localSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{localSuccess}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-500" />
          Paramètres administrateur
          <span className="text-sm text-gray-400 ml-2">({settings.length} paramètre{settings.length > 1 ? 's' : ''})</span>
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Add New Setting Form */}
      {showAddForm && (
        <div className="bg-slate-800/50 rounded-lg border border-gray-700/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-200">Nouveau paramètre</h4>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewSetting({ key: '', value: '', description: '' });
              }}
              className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-slate-700/50 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Clé *</label>
              <input
                type="text"
                value={newSetting.key}
                onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                placeholder="exemple_parametre"
                className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Valeur *</label>
              <input
                type="text"
                value={newSetting.value}
                onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                placeholder="valeur"
                className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <input
                type="text"
                value={newSetting.description}
                onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du paramètre"
                className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={saving === 'new' || !newSetting.key.trim() || !newSetting.value.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {saving === 'new' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Ajouter
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Settings List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Chargement des paramètres...
        </div>
      ) : settings.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun paramètre configuré</p>
          <p className="text-sm mt-1">Cliquez sur "Ajouter" pour créer le premier paramètre</p>
        </div>
      ) : (
        <div className="space-y-3">
          {settings.map(setting => {
            const Icon = getSettingIcon(setting.key);
            const iconColor = getSettingColor(setting.key);
            const isEditing = editingId === setting.id;

            return (
              <div key={setting.id} className="bg-slate-800/50 rounded-lg border border-gray-700/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <EditingForm 
                        setting={setting}
                        saving={saving === setting.id}
                        onSave={handleSave}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <ViewMode
                        setting={setting}
                        formatDate={formatDate}
                        onEdit={() => setEditingId(setting.id)}
                        onDelete={() => handleDelete(setting.id, setting.key)}
                        saving={saving === setting.id}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section dangereuse */}
      <div className="mt-8 pt-6 border-t border-gray-700/50">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400 mb-1">Zone dangereuse</h3>
              <p className="text-xs text-gray-400 mb-3">
                Ces actions sont irréversibles et peuvent affecter toutes les données de l'application.
              </p>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-sm"
              >
                <Database className="w-4 h-4" />
                Supprimer les données de traitement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de suppression des données */}
      {showDeleteModal && (
        <DeleteDataModal 
          onClose={() => setShowDeleteModal(false)}
          onSuccess={(message) => {
            setLocalSuccess(message);
            setTimeout(() => setLocalSuccess(null), 5000);
          }}
          onError={(message) => {
            setLocalError(message);
            setTimeout(() => setLocalError(null), 5000);
          }}
        />
      )}
    </div>
  );
}

// Composant modal pour la suppression des données
interface DeleteDataModalProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

function DeleteDataModal({ onClose, onSuccess, onError }: DeleteDataModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<'user' | 'group' | ''>('');
  const [selectedId, setSelectedId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { refreshStats } = useStats();

  useEffect(() => {
    loadUsersAndGroups();
  }, []);

  const loadUsersAndGroups = async () => {
    setLoading(true);
    try {
      // Charger les utilisateurs avec leurs stats
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select(`
          user_id, 
          email, 
          user_level,
          user_stats(total_operations)
        `);
      setUsers(usersData || []);

      // Charger les groupes
      const { data: groupsData } = await supabase
        .from('groups')
        .select('id, name, image_limit')
        .order('name');
      setGroups(groupsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTarget || !selectedId) {
      onError('Veuillez sélectionner une cible et un élément');
      return;
    }

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer TOUTES les données de traitement de ${
        selectedTarget === 'user' ? 'cet utilisateur' : 'ce groupe'
      } ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      if (selectedTarget === 'user') {
        // Supprimer toutes les données d'un utilisateur
        const { error: logsError } = await supabase
          .from('processing_logs')
          .delete()
          .eq('user_id', selectedId);

        if (logsError) throw logsError;

        // Supprimer les anciennes sessions si elles existent encore
        const { error: sessionsError } = await supabase
          .from('processing_sessions')
          .delete()
          .eq('user_id', selectedId);

        // Ignorer l'erreur si la table n'existe pas
        if (sessionsError && !sessionsError.message.includes('does not exist')) {
          console.warn('Warning deleting sessions:', sessionsError);
        }

        // Remettre les stats utilisateur à zéro
        const { error: statsError } = await supabase
          .from('user_stats')
          .upsert({
            user_id: selectedId,
            total_operations: 0,
            success_count: 0,
            total_processing_time: 0,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (statsError) {
          console.warn('Warning updating user stats:', statsError);
        }

        const selectedUser = users.find(u => u.user_id === selectedId);
        onSuccess(`Toutes les données de traitement de ${selectedUser?.email} ont été supprimées`);
      } else {
        // Supprimer les données d'un groupe
        const { data: groupMembers } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', selectedId);

        if (groupMembers && groupMembers.length > 0) {
          const memberIds = groupMembers.map(m => m.user_id);

          // Supprimer tous les logs des membres du groupe
          const { error: logsError } = await supabase
            .from('processing_logs')
            .delete()
            .in('user_id', memberIds);

          if (logsError) throw logsError;

          // Supprimer les anciennes sessions si elles existent encore
          const { error: sessionsError } = await supabase
            .from('processing_sessions')
            .delete()
            .in('user_id', memberIds);

          // Ignorer l'erreur si la table n'existe pas
          if (sessionsError && !sessionsError.message.includes('does not exist')) {
            console.warn('Warning deleting sessions:', sessionsError);
          }

          // Remettre les stats des membres à zéro
          for (const userId of memberIds) {
            const { error: statsError } = await supabase
              .from('user_stats')
              .upsert({
                user_id: userId,
                total_operations: 0,
                success_count: 0,
                total_processing_time: 0,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              });

            if (statsError) {
              console.warn(`Warning updating user stats for ${userId}:`, statsError);
            }
          }
        }

        const selectedGroup = groups.find(g => g.id === selectedId);
        onSuccess(`Toutes les données de traitement du groupe "${selectedGroup?.name}" ont été supprimées`);
      }

      // Rafraîchir les stats dans le header
      await refreshStats();
      refreshHeaderStats();
      
      onClose();
    } catch (err) {
      console.error('Error deleting data:', err);
      onError(`Erreur lors de la suppression des données: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-gray-800/50 w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <Database className="w-5 h-5 text-red-500" />
              Supprimer les données de traitement
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type de cible</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedTarget('user');
                    setSelectedId('');
                  }}
                  className={`p-2 border rounded-lg text-sm transition-colors ${
                    selectedTarget === 'user'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  Utilisateur
                </button>
                <button
                  onClick={() => {
                    setSelectedTarget('group');
                    setSelectedId('');
                  }}
                  className={`p-2 border rounded-lg text-sm transition-colors ${
                    selectedTarget === 'group'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  Groupe
                </button>
              </div>
            </div>

            {selectedTarget && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sélectionner {selectedTarget === 'user' ? 'un utilisateur' : 'un groupe'}
                </label>
                {loading ? (
                  <div className="text-center py-4 text-gray-400">Chargement...</div>
                ) : (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-slate-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="">-- Sélectionner --</option>
                    {selectedTarget === 'user'
                      ? users.map(user => (
                          <option key={user.user_id} value={user.user_id}>
                            {user.email} ({user.user_stats?.[0]?.total_operations || 0} opérations)
                          </option>
                        ))
                      : groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))
                    }
                  </select>
                )}
              </div>
            )}

            {selectedTarget && selectedId && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">
                  ⚠️ Cette action supprimera définitivement TOUTES les données de traitement 
                  (sessions et statistiques) {selectedTarget === 'user' ? "de l'utilisateur sélectionné" : "de tous les membres du groupe"}.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={!selectedTarget || !selectedId || deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Supprimer les données
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour l'édition d'un paramètre
interface EditingFormProps {
  setting: AdminSetting;
  saving: boolean;
  onSave: (id: string, key: string, value: string, description: string) => void;
  onCancel: () => void;
}

function EditingForm({ setting, saving, onSave, onCancel }: EditingFormProps) {
  const [value, setValue] = useState(setting.value);
  const [description, setDescription] = useState(setting.description || '');

  return (
    <div className="space-y-3">
      <div>
        <p className="font-medium text-gray-200">{setting.key}</p>
        <p className="text-xs text-gray-500">Clé non modifiable</p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Valeur</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-slate-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 text-gray-400 hover:text-gray-300 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={() => onSave(setting.id, setting.key, value, description)}
          disabled={saving || !value.trim()}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Sauvegarder
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Composant pour l'affichage d'un paramètre
interface ViewModeProps {
  setting: AdminSetting;
  formatDate: (date: string) => string;
  onEdit: () => void;
  onDelete: () => void;
  saving: boolean;
}

function ViewMode({ setting, formatDate, onEdit, onDelete, saving }: ViewModeProps) {
  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-200">{setting.key}</span>
            <span className="bg-slate-700/50 text-gray-300 text-xs px-2 py-0.5 rounded">
              {setting.value}
            </span>
          </div>
          {setting.description && (
            <p className="text-sm text-gray-400 mb-2">{setting.description}</p>
          )}
          <p className="text-xs text-gray-500">
            Modifié le {formatDate(setting.updated_at)}
          </p>
        </div>

        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={onEdit}
            disabled={saving}
            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors disabled:opacity-50"
            title="Modifier"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={saving}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
            title="Supprimer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}