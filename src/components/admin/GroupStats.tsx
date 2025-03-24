import React, { useState } from 'react';
import { Sparkles, Timer, CheckCircle2, Edit2, Save, X } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  image_limit: number;
  stats?: {
    avg_processing_time?: number;
    success_rate?: number;
  };
}

interface GroupStatsProps {
  group: Group;
  formatTime: (seconds: number) => string;
  onUpdateLimit: (groupId: string, newLimit: number) => Promise<void>;
}

export function GroupStats({ group, formatTime, onUpdateLimit }: GroupStatsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(group.image_limit);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (newLimit < 0) {
      setError("La limite ne peut pas être négative");
      return;
    }
    
    try {
      await onUpdateLimit(group.id, newLimit);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Erreur lors de la mise à jour de la limite");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
            <h4 className="text-sm font-medium text-gray-400">Limite d'images</h4>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(parseInt(e.target.value) || 0)}
                className="w-24 bg-slate-700/50 border border-gray-600/50 rounded px-2 py-1 text-sm"
                min="0"
              />
              <button
                onClick={handleSave}
                className="p-1 text-emerald-500 hover:text-emerald-400 rounded transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewLimit(group.image_limit);
                  setError(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setNewLimit(group.image_limit);
              }}
              className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400 mb-2">{error}</p>
        )}
        <p className="text-2xl font-semibold text-emerald-500">
          {group.image_limit}
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
          <h4 className="text-sm font-medium text-gray-400">Temps moyen</h4>
        </div>
        <p className="text-2xl font-semibold text-emerald-500">
          {formatTime(group.stats?.avg_processing_time || 0)}
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
          <h4 className="text-sm font-medium text-gray-400">Taux de réussite</h4>
        </div>
        <p className="text-2xl font-semibold text-emerald-500">
          {group.stats?.success_rate?.toFixed(1) || 0}%
        </p>
      </div>
    </div>
  );
}