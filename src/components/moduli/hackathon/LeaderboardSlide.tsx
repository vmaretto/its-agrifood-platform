'use client';

import React, { useState, useEffect } from 'react';
import { SlideJSON, LeaderboardStanding, HackathonBadge } from '@/types/module';
import { getTeams, Team } from '@/services/teamsService';
import { getVotesSummary, TeamVotesSummary } from '@/services/hackathonVotingService';
import { UserProfile } from '@/services/authService';

interface LeaderboardSlideProps {
  slide: SlideJSON;
  courseId?: string;
  hackathonId?: string;
  currentUser?: UserProfile | null;
}

interface LeaderboardConfig {
  showPreHackathonPoints: boolean;
  showHackathonPoints: boolean;
  showTotalPoints: boolean;
  showBadges: boolean;
  animated: boolean;
}

interface PointsBreakdown {
  firstPlace: { jury: number; peer: number; total: number };
  secondPlace: { jury: number; peer: number; total: number };
  thirdPlace: { jury: number; peer: number; total: number };
  specialAwards: number;
}

export function LeaderboardSlide({ slide, courseId, hackathonId = 'hackathon-agrifuture-2024', currentUser }: LeaderboardSlideProps) {
  const vc = slide.visualContent || {};
  const leaderboardConfig = vc.leaderboardConfig as LeaderboardConfig | undefined;
  const staticStandings = vc.currentStandings as LeaderboardStanding[] | undefined;
  const pointsBreakdown = vc.pointsBreakdown as PointsBreakdown | undefined;
  const possibleBadges = vc.possibleBadges as HackathonBadge[] | undefined;

  const [liveTeams, setLiveTeams] = useState<Team[]>([]);
  const [hackathonVotes, setHackathonVotes] = useState<TeamVotesSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [animatedPoints, setAnimatedPoints] = useState<Record<string, number>>({});

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  // Carica dati live
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const teams = await getTeams(courseId);
        setLiveTeams(teams);
        
        // Carica anche i voti hackathon
        const votes = await getVotesSummary(hackathonId, courseId);
        setHackathonVotes(votes);
      } catch (err) {
        console.error('Error loading data:', err);
      }
      setIsLoading(false);
    };
    loadData();

    // Polling ogni 30 secondi
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [courseId, hackathonId]);

  // Se abbiamo courseId, usa solo i dati dal DB; altrimenti merge con statici
  const standings: LeaderboardStanding[] = courseId && liveTeams.length > 0
    ? liveTeams.map((team) => {
        // Trova i punti hackathon per questa squadra
        const hackVotes = hackathonVotes.find(v => v.team_id === team.id);
        const hackPoints = hackVotes?.total_points || 0;
        const prePoints = team.points || 0;
        return {
          rank: 0,
          team: team.name,
          prePoints: prePoints,
          hackPoints: hackPoints,
          total: prePoints + hackPoints,
          badges: []
        };
      }).sort((a, b) => b.total - a.total).map((s, idx) => ({ ...s, rank: idx + 1 }))
    : staticStandings?.map(standing => {
        const liveTeam = liveTeams.find(t => t.name === standing.team);
        const hackVotes = hackathonVotes.find(v => v.team_name === standing.team);
        const hackPoints = hackVotes?.total_points || standing.hackPoints;
        return {
          ...standing,
          prePoints: liveTeam?.points ?? standing.prePoints,
          hackPoints: hackPoints,
          total: (liveTeam?.points ?? standing.prePoints) + hackPoints,
        };
      }).sort((a, b) => b.total - a.total).map((s, idx) => ({ ...s, rank: idx + 1 })) || [];

  // Animazione punti
  useEffect(() => {
    if (!leaderboardConfig?.animated) return;

    standings.forEach((standing, idx) => {
      setTimeout(() => {
        setAnimatedPoints(prev => ({
          ...prev,
          [standing.team]: standing.total
        }));
      }, idx * 200);
    });
  }, [standings, leaderboardConfig?.animated]);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-200 text-gray-700';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-500 text-amber-100';
    return 'bg-gray-100 text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Nascondi agli studenti
  if (!isTeacher) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-xl font-bold text-amber-800 mb-2">Classifica in arrivo!</h3>
        <p className="text-amber-600">I risultati saranno svelati a breve dal docente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      {vc.introParagraph && (
        <p className="text-lg text-gray-600">{vc.introParagraph}</p>
      )}

      {isLoading && (
        <div className="text-center py-2 text-gray-500 text-sm">
          Aggiornamento classifica...
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>🏆</span>
              <span>Classifica Live</span>
            </h3>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <span className="animate-pulse">●</span>
              <span>Aggiornamento automatico</span>
            </div>
          </div>
        </div>

        {/* Standings */}
        <div className="divide-y divide-gray-100">
          {standings.map((standing, idx) => {
            const displayPoints = leaderboardConfig?.animated
              ? animatedPoints[standing.team] ?? 0
              : standing.total;

            return (
              <div
                key={standing.team}
                className={`flex items-center gap-4 p-4 transition-all ${
                  standing.rank <= 3 ? 'bg-amber-50' : ''
                }`}
                style={{
                  animationDelay: `${idx * 100}ms`
                }}
              >
                {/* Rank */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankStyle(standing.rank)}`}
                >
                  {getRankIcon(standing.rank)}
                </div>

                {/* Team Name */}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg">{standing.team}</h4>
                  {/* Badges */}
                  {leaderboardConfig?.showBadges && standing.badges.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {standing.badges.map((badgeId, bidx) => {
                        const badge = possibleBadges?.find(b => b.id === badgeId);
                        return badge ? (
                          <span key={bidx} className="text-sm" title={badge.description}>
                            {badge.emoji}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* Points Breakdown */}
                {leaderboardConfig?.showPreHackathonPoints && leaderboardConfig?.showHackathonPoints && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="text-gray-500">Pre-Hackathon</div>
                      <div className="font-medium text-gray-700">{standing.prePoints.toLocaleString()}</div>
                    </div>
                    <span className="text-gray-400">+</span>
                    <div className="text-right">
                      <div className="text-gray-500">Hackathon</div>
                      <div className="font-medium text-emerald-600">
                        {standing.hackPoints > 0 ? `+${standing.hackPoints}` : '-'}
                      </div>
                    </div>
                    <span className="text-gray-400">=</span>
                  </div>
                )}

                {/* Total Points */}
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    standing.rank === 1 ? 'text-amber-600' :
                    standing.rank === 2 ? 'text-gray-600' :
                    standing.rank === 3 ? 'text-amber-700' :
                    'text-indigo-600'
                  }`}>
                    {displayPoints.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">punti</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points Breakdown Info */}
      {pointsBreakdown && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h4 className="font-bold text-gray-800 mb-4">📊 Distribuzione Punti Hackathon</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🥇</div>
              <div className="text-2xl font-bold text-amber-600">+{pointsBreakdown.firstPlace.total}</div>
              <div className="text-xs text-gray-500 mt-1">
                Giuria {pointsBreakdown.firstPlace.jury} + Peer {pointsBreakdown.firstPlace.peer}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🥈</div>
              <div className="text-2xl font-bold text-gray-600">+{pointsBreakdown.secondPlace.total}</div>
              <div className="text-xs text-gray-500 mt-1">
                Giuria {pointsBreakdown.secondPlace.jury} + Peer {pointsBreakdown.secondPlace.peer}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🥉</div>
              <div className="text-2xl font-bold text-amber-700">+{pointsBreakdown.thirdPlace.total}</div>
              <div className="text-xs text-gray-500 mt-1">
                Giuria {pointsBreakdown.thirdPlace.jury} + Peer {pointsBreakdown.thirdPlace.peer}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🌟</div>
              <div className="text-2xl font-bold text-purple-600">+{pointsBreakdown.specialAwards}</div>
              <div className="text-xs text-gray-500 mt-1">Per premio speciale</div>
            </div>
          </div>
        </div>
      )}

      {/* Possible Badges */}
      {possibleBadges && possibleBadges.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-4">🏅 Badge Disponibili</h4>
          <div className="flex flex-wrap gap-3">
            {possibleBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2"
              >
                <span className="text-xl">{badge.emoji}</span>
                <div>
                  <div className="font-medium text-gray-800 text-sm">{badge.name}</div>
                  <div className="text-xs text-gray-500">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Box */}
      {vc.alertBox && (
        <div className={`rounded-2xl p-6 ${
          vc.alertBox.type === 'success' ? 'bg-emerald-50 border border-emerald-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-4">
            <span className="text-3xl">{vc.alertBox.icon}</span>
            <div>
              <h4 className={`font-bold text-lg ${
                vc.alertBox.type === 'success' ? 'text-emerald-800' : 'text-blue-800'
              }`}>
                {vc.alertBox.title}
              </h4>
              <p className={`mt-1 ${
                vc.alertBox.type === 'success' ? 'text-emerald-700' : 'text-blue-700'
              }`}>
                {vc.alertBox.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaderboardSlide;
