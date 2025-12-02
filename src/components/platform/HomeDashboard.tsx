'use client';

import React, { useState, useEffect } from 'react';
import { getTeams, Team } from '@/services/teamsService';

interface HomeDashboardProps {
  setCurrentView: (view: string) => void;
  setActiveModule: (module: string | null) => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setCurrentView,
  setActiveModule,
}) => {
  const [classificaSquadre, setClassificaSquadre] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carica le squadre da Supabase
  useEffect(() => {
    const loadTeams = async () => {
      setIsLoading(true);
      try {
        const teams = await getTeams();
        setClassificaSquadre(teams);
      } catch (err) {
        console.error('Error loading teams:', err);
      }
      setIsLoading(false);
    };
    loadTeams();
  }, []);

  // TODO: In futuro, caricare la squadra dello studente loggato
  const squadra = classificaSquadre[0] || { name: 'Nessuna squadra', points: 0, color: 'bg-emerald-500' };
  const progressoCorso = 25;

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
        <h1 className="text-2xl font-bold text-gray-800">Benvenuto, Marco!</h1>
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
            Continua
          </button>
        </div>

        {/* Squadra */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="text-sm opacity-80 mb-1">La tua squadra</div>
          <div className="text-xl font-bold mb-2">{squadra.name}</div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-3xl font-bold">{squadra.points || 0}</div>
              <div className="text-xs opacity-80">punti</div>
            </div>
            <div className="text-4xl">
              {classificaSquadre.length > 0 && classificaSquadre[0].id === squadra.id ? '🥇' : '🏅'}
            </div>
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
          <h3 className="font-semibold text-gray-800 mb-4">Classifica Squadre</h3>
          {isLoading ? (
            <div className="text-gray-500 text-center py-4">Caricamento...</div>
          ) : classificaSquadre.length === 0 ? (
            <div className="text-gray-500 text-center py-4">Nessuna squadra</div>
          ) : (
            <div className="space-y-3">
              {classificaSquadre.map((team, idx) => (
                <div key={team.id} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 ${team.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{team.name}</div>
                  </div>
                  <div className="font-semibold text-gray-600">{team.points || 0} pt</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badge */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">I tuoi Badge</h3>
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
            <div className="text-sm opacity-80 mb-1">Modulo in corso</div>
            <div className="text-xl font-bold mb-2">Tendenze AgrifoodTech</div>
            <div className="text-sm opacity-80">
              10 slide interattive - 14 video - 33 articoli
            </div>
          </div>
          <button
            onClick={() => setActiveModule('agrifoodtech')}
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Continua il modulo
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
