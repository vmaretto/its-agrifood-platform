'use client';

import React from 'react';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
}

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  userRole: 'student' | 'admin';
  setUserRole: (role: 'student' | 'admin') => void;
  activeModule: string | null;
  setActiveModule: (module: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  userRole,
  setUserRole,
  activeModule,
  setActiveModule,
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
    { id: 'admin-squadre', icon: '👥', label: 'Squadre' },
    { id: 'admin-badge', icon: '🎖️', label: 'Badge' },
    { id: 'admin-hackathon', icon: '💡', label: 'Hackathon' },
    { id: 'admin-settings', icon: '⚙️', label: 'Impostazioni' },
  ];

  const menu = userRole === 'student' ? studentMenu : adminMenu;

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
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div>
            <div className="text-sm font-medium">Marco Rossi</div>
            <div className="text-xs text-gray-500">
              {userRole === 'student' ? 'Studente' : 'Docente'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setUserRole(userRole === 'student' ? 'admin' : 'student')}
          className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 border rounded"
        >
          Passa a vista {userRole === 'student' ? 'Admin' : 'Studente'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
