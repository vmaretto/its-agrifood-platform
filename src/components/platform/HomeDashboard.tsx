'use client';

import React, { useState, useEffect } from 'react';
import { getTeams, Team, getTeam } from '@/services/teamsService';
import { UserProfile } from '@/services/authService';

interface HomeDashboardProps {
  setCurrentView: (view: string) => void;
  setActiveModule: (module: string | null) => void;
  currentUser: UserProfile | null;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setCurrentView,
  setActiveModule,
  currentUser,
}) => {
  const [classificaSquadre, setClassificaSquadre] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carica le squadre da Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const teams = await getTeams();
        setClassificaSquadre(teams);

        // Carica la squadra dell'utente corrente se ha un team_id
        if (currentUser?.team_id) {
          const team = await getTeam(currentUser.team_id);
          setUserTeam(team);
        }
      } catch (err) {
        console.error('Error loading teams:', err);
      }
      setIsLoading(false);
    };
    loadData();
  }, [currentUser?.team_id]);

  // Nome dell'utente
  const userName = currentUser ? currentUser.first_name : 'Studente';

  // Punti dell'utente
  const userPoints = currentUser?.points || 0;

  // Squadra dell'utente (o placeholder se non assegnato)
  const squadra = userTeam || { name: 'Nessuna squadra', points: 0, color: 'bg-gray-400', id: '' };

  // Trova la posizione della squadra dell'utente nella classifica
  const teamPosition = userTeam
    ? classificaSquadre.findIndex(t => t.id === userTeam.id) + 1
    : 0;

  // Progresso corso (placeholder - in futuro calcolato dai moduli completati)
  const progressoCorso = 25;

  const badges = [
    { nome: 'Primo Passo', icon: '🎯', ottenuto: userPoints > 0 },
    { nome: 'Quiz Master', icon: '🧠', ottenuto: userPoints >= 50 },
    { nome: 'Team Player', icon: '🤝', ottenuto: !!userTeam },
    { nome: 'Blockchain Expert', icon: '⛓️', ottenuto: false },
    { nome: 'Innovatore', icon: '💡', ottenuto: false },
    { nome: 'Campione', icon: '🏆', ottenuto: userPoints >= 100 },
  ];

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Benvenuto, {userName}!</h1>
        <p className="text-gray-500">Continua il tuo percorso di apprendimento</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Punti Personali */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500">I tuoi punti</span>
            <span className="text-2xl font-bold text-emerald-600">{userPoints}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((userPoints / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {userPoints < 50 ? 'Continua a fare quiz per guadagnare punti!' : 'Ottimo lavoro!'}
          </p>
        </div>

        {/* Squadra */}
        <div className={`bg-gradient-to-br ${userTeam ? 'from-emerald-500 to-teal-600' : 'from-gray-400 to-gray-500'} rounded-2xl p-6 text-white`}>
          <div className="text-sm opacity-80 mb-1">La tua squadra</div>
          <div className="text-xl font-bold mb-2">{squadra.name}</div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-3xl font-bold">{squadra.points || 0}</div>
              <div className="text-xs opacity-80">punti squadra</div>
            </div>
            <div className="text-4xl">
              {teamPosition === 1 ? '🥇' : teamPosition === 2 ? '🥈' : teamPosition === 3 ? '🥉' : '🏅'}
            </div>
          </div>
          {!userTeam && (
            <p className="mt-2 text-xs opacity-80">Il docente ti assegnera a una squadra</p>
          )}
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
                <div
                  key={team.id}
                  className={`flex items-center gap-3 ${userTeam?.id === team.id ? 'bg-emerald-50 -mx-2 px-2 py-1 rounded-lg' : ''}`}
                >
                  <div
                    className={`w-8 h-8 ${team.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {team.name}
                      {userTeam?.id === team.id && <span className="ml-2 text-xs text-emerald-600">(tu)</span>}
                    </div>
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
