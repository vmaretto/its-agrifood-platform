// @ts-nocheck
'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import HomeDashboard from './HomeDashboard';
import PercorsoView from './PercorsoView';
import PlaceholderView from './PlaceholderView';
import ModuloAgrifoodTech from '../moduli/ModuloAgrifoodTech';
import ModuloTrendTecnologici from '../moduli/ModuloTrendTecnologici';

const ITSLearningPlatform: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // Render del modulo attivo
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'agrifoodtech':
        return <ModuloAgrifoodTech onBack={() => setActiveModule(null)} />;
      case 'trend-tecnologici':
        return <ModuloTrendTecnologici onBack={() => setActiveModule(null)} />;
      default:
        return null;
    }
  };

  // Se c'è un modulo attivo, mostra il modulo a schermo intero
  if (activeModule) {
    const moduleComponent = renderActiveModule();
    if (moduleComponent) {
      return moduleComponent;
    }
  }

  // Render della vista corrente
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeDashboard
            setCurrentView={setCurrentView}
            setActiveModule={setActiveModule}
          />
        );
      case 'percorso':
        return <PercorsoView setActiveModule={setActiveModule} />;
      case 'sfide':
        return <PlaceholderView title="Sfide & Competizioni" icon="🏆" />;
      case 'tutor':
        return <PlaceholderView title="AI Tutor" icon="🤖" />;
      case 'hackathon':
        return <PlaceholderView title="Hackathon Space" icon="💡" />;
      case 'admin-dashboard':
        return <PlaceholderView title="Dashboard Admin" icon="📊" />;
      case 'admin-contenuti':
        return <PlaceholderView title="Gestione Contenuti" icon="📝" />;
      case 'admin-squadre':
        return <PlaceholderView title="Gestione Squadre" icon="👥" />;
      case 'admin-badge':
        return <PlaceholderView title="Gestione Badge" icon="🎖️" />;
      case 'admin-hackathon':
        return <PlaceholderView title="Setup Hackathon" icon="💡" />;
      case 'admin-settings':
        return <PlaceholderView title="Impostazioni" icon="⚙️" />;
      default:
        return (
          <HomeDashboard
            setCurrentView={setCurrentView}
            setActiveModule={setActiveModule}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        userRole={userRole}
        setUserRole={setUserRole}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />
      <div className="flex-1 overflow-auto">{renderView()}</div>
    </div>
  );
};

export default ITSLearningPlatform;
