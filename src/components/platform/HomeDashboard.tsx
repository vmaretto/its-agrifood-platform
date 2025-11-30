'use client';

import React from 'react';

interface HomeDashboardProps {
  setCurrentView: (view: string) => void;
  setActiveModule: (module: string | null) => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setCurrentView,
  setActiveModule,
}) => {
  const squadra = { nome: 'AgriTech Pioneers', punti: 850, posizione: 1 };
  const progressoCorso = 25;

  const classificaSquadre = [
    { nome: 'AgriTech Pioneers', punti: 850, colore: 'bg-emerald-500' },
    { nome: 'Farm Innovators', punti: 720, colore: 'bg-blue-500' },
    { nome: 'Green Data', punti: 680, colore: 'bg-purple-500' },
    { nome: 'Blockchain Farmers', punti: 590, colore: 'bg-amber-500' },
  ];

  const badges = [
    { nome: 'Primo Passo', icon: '🎯', ottenuto: true },
    { nome: 'Quiz Master', icon: '🧠', ottenuto: true },
    { nome: 'Team Player', icon: '🤝', ottenuto: false },
    { nome: 'Blockchain Expert', icon: '⛓️', ottenuto: false },
    { nome: 'Innovatore', icon: '💡', ottenuto: false },
    { nome: 'Campione', icon: '🏆', ottenuto: false },
  ];

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Benvenuto, Marco! 👋</h1>
        <p className="text-gray-500">Continua il tuo percorso di apprendimento</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Progresso Corso */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">Progresso Corso</span>
            <span className="text-2xl font-bold text-emerald-600">{progressoCorso}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressoCorso}%` }}
            ></div>
          </div>
          <button
            onClick={() => setCurrentView('percorso')}
            className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Continua →
          </button>
        </div>

        {/* Squadra */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="text-sm opacity-80 mb-1">La tua squadra</div>
          <div className="text-xl font-bold mb-2">{squadra.nome}</div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-3xl font-bold">{squadra.punti}</div>
              <div className="text-xs opacity-80">punti</div>
            </div>
            <div className="text-4xl">🥇</div>
          </div>
        </div>

        {/* Prossima Sfida */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-gray-500 mb-2">Prossima sfida</div>
          <div className="font-semibold text-gray-800 mb-1">Quiz Supply Chain</div>
          <div className="text-sm text-gray-500 mb-3">Scade tra 2 giorni</div>
          <button
            onClick={() => setCurrentView('sfide')}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            Partecipa
          </button>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Classifica */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">🏆 Classifica Squadre</h3>
          <div className="space-y-3">
            {classificaSquadre.map((team, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 ${team.colore} rounded-full flex items-center justify-center text-white text-sm font-bold`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{team.nome}</div>
                </div>
                <div className="font-semibold text-gray-600">{team.punti} pt</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">🎖️ I tuoi Badge</h3>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-center ${
                  badge.ottenuto ? 'bg-amber-50' : 'bg-gray-100 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-medium text-gray-600">{badge.nome}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Modulo in evidenza */}
      <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80 mb-1">📚 Modulo in corso</div>
            <div className="text-xl font-bold mb-2">Tendenze AgrifoodTech</div>
            <div className="text-sm opacity-80">
              10 slide interattive • 14 video • 33 articoli
            </div>
          </div>
          <button
            onClick={() => setActiveModule('agrifoodtech')}
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Continua il modulo →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
