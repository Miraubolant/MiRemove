import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 text-sm sm:text-base"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl animate-shimmer" />
        <div className="relative flex items-center gap-1.5 sm:gap-2">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce-scale" />
          <span className="hidden sm:inline max-w-[150px] truncate">{user.email}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden animate-in slide-in-from-top-2">
          <div className="p-2">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}