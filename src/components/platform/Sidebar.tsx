'use client';

import React from 'react';
import { UserProfile } from '@/services/authService';
import { Course } from '@/services/coursesService';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
}

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  userRole: 'student' | 'admin';
  activeModule: string | null;
  setActiveModule: (module: string | null) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  activeCourse?: Course | null;
  onChangeCourse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  userRole,
  activeModule,
  setActiveModule,
  currentUser,
  onLogout,
  activeCourse,
  onChangeCourse,
}) => {
  const studentMenu: MenuItem[] = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'percorso', icon: '📚', label: 'Percorso' },
    { id: 'sfide', icon: '🏆', label: 'Sfide' },
    { id: 'tutor', icon: '🤖', label: 'AI Tutor' },
    { id: 'hackathon', icon: '💡', label: 'Hackathon' },
  ];

  const adminMenu: MenuItem[] = [
    { id: 'admin-dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'admin-contenuti', icon: '📝', label: 'Contenuti' },
    { id: 'admin-nuovo-modulo', icon: '🚀', label: 'Nuovo Modulo' },
    { id: 'admin-squadre', icon: '👥', label: 'Squadre' },
    { id: 'admin-iscrizioni', icon: '📋', label: 'Iscrizioni' },
    { id: 'admin-scoreboard', icon: '🏅', label: 'Scoreboard' },
    { id: 'admin-badge', icon: '🎖️', label: 'Badge' },
    { id: 'admin-hackathon', icon: '💡', label: 'Hackathon' },
    { id: 'admin-hackathon-config', icon: '⏱️', label: 'Countdown' },
    { id: 'admin-punteggi', icon: '🔍', label: 'Punteggi' },
    { id: 'admin-settings', icon: '⚙️', label: 'Impostazioni' },
  ];

  const menu = userRole === 'student' ? studentMenu : adminMenu;

  // Nome utente da mostrare
  const userName = currentUser
    ? `${currentUser.first_name} ${currentUser.last_name}`
    : 'Utente';

  // Ruolo da mostrare
  const roleLabel = currentUser?.role === 'teacher' || currentUser?.role === 'admin'
    ? 'Docente'
    : 'Studente';

  // Iniziali per avatar
  const initials = currentUser
    ? `${currentUser.first_name[0]}${currentUser.last_name[0]}`
    : '??';

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
            ITS
          </div>
          <div>
            <div className="font-semibold text-gray-800">AgriFood Academy</div>
            <div className="text-xs text-gray-500">ITS Eat Agrifuture</div>
          </div>
        </div>
        {activeCourse && (
          <button
            onClick={onChangeCourse}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg text-sm text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <span>{activeCourse.icon}</span>
            <span className="font-medium truncate flex-1 text-left">{activeCourse.name}</span>
            <span className="text-xs text-emerald-500">↩</span>
          </button>
        )}
      </div>

      {/* Breadcrumb se siamo in un modulo */}
      {activeModule && (
        <div className="px-4 py-2 bg-emerald-50 border-b">
          <button
            onClick={() => setActiveModule(null)}
            className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800"
          >
            <span>←</span>
            <span>Torna al percorso</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setActiveModule(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentView === item.id && !activeModule
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{userName}</div>
            <div className="text-xs text-gray-500">{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-xs text-red-500 hover:text-red-700 py-2 border border-red-200 rounded hover:bg-red-50 transition-colors"
        >
          Esci
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
