import React from 'react';
import { Users, CheckCircle2, Timer, ChevronUp, ChevronDown } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  image_limit: number;
  member_count?: number;
  total_processed?: number;
  stats?: {
    success_rate?: number;
    avg_processing_time?: number;
  };
}

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onToggleExpand: () => void;
  formatTime: (seconds: number) => string;
}

export function GroupCard({ 
  group, 
  isSelected, 
  isExpanded,
  onClick, 
  onToggleExpand,
  formatTime 
}: GroupCardProps) {
  return (
    <div
      className={`bg-slate-800/50 rounded-xl border transition-all duration-300 ${
        isSelected
          ? 'border-emerald-500/50'
          : 'border-gray-700/50 hover:border-gray-600/50'
      }`}
    >
      <button
        onClick={onClick}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-gray-200">{group.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {group.member_count || 0} membres
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-1 text-gray-400 hover:text-gray-300 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-2">
          <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
              style={{ 
                width: `${Math.min(((group.total_processed || 0) / group.image_limit) * 100, 100)}%` 
              }}
            />
          </div>
          <div className="mt-1 text-sm text-gray-400">
            {group.total_processed || 0} / {group.image_limit} images
          </div>
        </div>

        {isExpanded && group.stats && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{group.stats.success_rate?.toFixed(1)}% réussite</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Timer className="w-3.5 h-3.5 text-emerald-500" />
              <span>{formatTime(group.stats.avg_processing_time || 0)}</span>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}