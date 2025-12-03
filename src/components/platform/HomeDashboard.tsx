'use client';

import React, { useState, useEffect } from 'react';
import { getTeams, Team, getTeam } from '@/services/teamsService';
import { UserProfile } from '@/services/authService';
import { getUserBadges, getBadges, Badge, UserBadge } from '@/services/badgesService';
import { getRecentActivities, Activity, formatRelativeTime, getActionDescription } from '@/services/activitiesService';
import { getUserProgressSummary, UserProgressSummary } from '@/services/progressService';

interface HomeDashboardProps {
  setCurrentView: (view: string) => void;
  setActiveModule: (module: string | null) => void;
  currentUser: UserProfile | null;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setCurrentView,
  currentUser,
}) => {
  const [classificaSquadre, setClassificaSquadre] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [progressSummary, setProgressSummary] = useState<UserProgressSummary | null>(null);

  // Carica tutti i dati
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carica squadre
        const teams = await getTeams();
        setClassificaSquadre(teams);

        // Carica la squadra dell'utente corrente se ha un team_id
        if (currentUser?.team_id) {
          const team = await getTeam(currentUser.team_id);
          setUserTeam(team);
        }

        // Carica badges
        const badges = await getBadges();
        setAllBadges(badges);

        if (currentUser?.id) {
          // Carica badge utente
          const uBadges = await getUserBadges(currentUser.id);
          setUserBadges(uBadges);

          // Carica progresso
          const progress = await getUserProgressSummary(currentUser.id);
          setProgressSummary(progress);
        }

        // Carica attività recenti
        const activities = await getRecentActivities(5);
        setRecentActivities(activities);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
      setIsLoading(false);
    };
    loadData();
  }, [currentUser?.team_id, currentUser?.id]);

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

  // Badge ottenuti dall'utente
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  // Progresso corso
  const progressoCorso = progressSummary?.overall_progress || 0;

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

        {/* Progresso Corso */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-gray-500 mb-2">Progresso Corso</div>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-3xl font-bold text-indigo-600">{progressoCorso}%</div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressoCorso}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {progressSummary ? (
              <>
                {progressSummary.completed_modules}/{progressSummary.total_modules} moduli completati
              </>
            ) : (
              'Caricamento...'
            )}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Classifica */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Classifica Squadre</h3>
          {isLoading ? (
            <div className="text-gray-500 text-center py-4">Caricamento...</div>
          ) : classificaSquadre.length === 0 ? (
            <div className="text-gray-500 text-center py-4">Nessuna squadra</div>
          ) : (
            <div className="space-y-3">
              {classificaSquadre.slice(0, 5).map((team, idx) => (
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

        {/* Attività Recenti */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Attività Recenti</h3>
          {recentActivities.length === 0 ? (
            <div className="text-gray-500 text-center py-4">Nessuna attività recente</div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                    {activity.action_type === 'quiz_correct' ? '✅' :
                     activity.action_type === 'badge_earned' ? '🏆' :
                     activity.action_type === 'module_completed' ? '📚' :
                     activity.action_type === 'team_joined' ? '👥' : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800">
                      {getActionDescription(activity)} {activity.target_name && <span className="font-medium">{activity.target_name}</span>}
                    </div>
                    {activity.points_earned > 0 && (
                      <span className="text-xs text-emerald-600">+{activity.points_earned} pt</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {formatRelativeTime(activity.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Badge Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">I tuoi Badge</h3>
        <div className="grid grid-cols-6 gap-3">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-xl text-center transition-all ${
                  isEarned ? 'bg-amber-50 shadow-sm' : 'bg-gray-100 opacity-50'
                }`}
                title={badge.description || badge.name}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-medium text-gray-600 truncate">{badge.name}</div>
                {isEarned && (
                  <div className="text-xs text-amber-600 mt-1">+{badge.points_reward} pt</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Modulo in evidenza */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80 mb-1">Inizia il tuo percorso</div>
            <div className="text-xl font-bold mb-2">Vai ai Moduli Formativi</div>
            <div className="text-sm opacity-80">
              Esplora i moduli disponibili e inizia ad apprendere
            </div>
          </div>
          <button
            onClick={() => setCurrentView('percorso')}
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Esplora i moduli
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
