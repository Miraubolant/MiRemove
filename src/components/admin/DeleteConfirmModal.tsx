import React from 'react';
import { AlertTriangle, X, Trash2, User } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
  loading?: boolean;
}

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userEmail, 
  loading = false 
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/50 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 space-y-4">
          {/* Header avec icône d'alerte */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/10 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-200">
                Confirmer la suppression
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Utilisateur à supprimer */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-200">Utilisateur à supprimer</p>
                <p className="text-sm text-gray-400">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Message d'avertissement détaillé */}
          <div className="space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-amber-400 font-medium">Attention !</p>
                  <p className="text-sm text-gray-300">
                    Cette action supprimera <strong>toutes les données applicatives</strong> de cet utilisateur :
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1 ml-4">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      Statistiques et historique de traitement
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      Sessions de traitement d'images
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      Appartenances aux groupes
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-1 rounded">
                  <span className="text-xs text-blue-400 font-bold">ℹ</span>
                </div>
                <div>
                  <p className="text-blue-400 font-medium text-sm">Note importante</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Le compte d'authentification restera actif. L'utilisateur pourra se reconnecter 
                    mais devra recommencer avec un profil vierge.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Confirmer la suppression
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}