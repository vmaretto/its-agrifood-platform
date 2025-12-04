'use client';

import React, { useState, useEffect } from 'react';
import { SlideJSON, HackathonTeam } from '@/types/module';
import { getTeams, Team } from '@/services/teamsService';

interface TeamsSlideProps {
  slide: SlideJSON;
}

export function TeamsSlide({ slide }: TeamsSlideProps) {
  const vc = slide.visualContent || {};
  const staticTeams = vc.teams as HackathonTeam[] | undefined;
  const currentLeaderboard = vc.currentLeaderboard as boolean | undefined;

  const [liveTeams, setLiveTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<HackathonTeam | null>(null);

  // Carica i dati live da Supabase se richiesto
  useEffect(() => {
    if (currentLeaderboard) {
      const loadTeams = async () => {
        setIsLoading(true);
        try {
          const teams = await getTeams();
          setLiveTeams(teams);
        } catch (err) {
          console.error('Error loading teams:', err);
        }
        setIsLoading(false);
      };
      loadTeams();

      // Polling ogni 30 secondi
      const interval = setInterval(loadTeams, 30000);
      return () => clearInterval(interval);
    }
  }, [currentLeaderboard]);

  // Merge dei dati statici con quelli live
  const displayTeams: HackathonTeam[] = staticTeams?.map(staticTeam => {
    const liveTeam = liveTeams.find(t => t.name === staticTeam.name);
    return {
      ...staticTeam,
      points: liveTeam?.points ?? staticTeam.points,
    };
  }).sort((a, b) => b.points - a.points) || [];

  return (
    <div className="space-y-6">
      {/* Intro */}
      {vc.introParagraph && (
        <p className="text-lg text-gray-600">{vc.introParagraph}</p>
      )}

      {isLoading && (
        <div className="text-center py-4 text-gray-500">
          Caricamento squadre...
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayTeams.map((team, idx) => {
          const rank = idx + 1;
          const isSelected = selectedTeam?.name === team.name;

          return (
            <button
              key={team.name}
              onClick={() => setSelectedTeam(isSelected ? null : team)}
              className={`relative p-4 rounded-2xl text-left transition-all ${
                isSelected
                  ? 'ring-2 ring-offset-2 shadow-xl scale-105'
                  : 'hover:shadow-lg'
              }`}
              style={{
                backgroundColor: isSelected ? `${team.color}20` : 'white',
                borderColor: team.color,
                '--tw-ring-color': team.color,
              } as React.CSSProperties}
            >
              {/* Rank Badge */}
              <div
                className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ backgroundColor: team.color }}
              >
                {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
              </div>

              {/* Team Info */}
              <div className="pt-3">
                <h4 className="font-bold text-gray-800 text-lg">{team.name}</h4>

                {/* Points */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold" style={{ color: team.color }}>
                    {team.points.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-sm">pt</span>
                </div>

                {/* Members count */}
                <div className="text-sm text-gray-500 mt-2">
                  👥 {team.members.length} membri
                </div>

                {/* Tech Focus Pills */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {team.techFocus.slice(0, 2).map((tech, techIdx) => (
                    <span
                      key={techIdx}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Team Detail */}
      {selectedTeam && (
        <div
          className="rounded-2xl p-6 animate-in fade-in duration-300"
          style={{ backgroundColor: `${selectedTeam.color}10`, borderColor: selectedTeam.color, borderWidth: 2 }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: selectedTeam.color }}
            >
              {selectedTeam.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800">{selectedTeam.name}</h3>
              <p className="text-gray-600 italic mt-1">💡 {selectedTeam.ideaHint}</p>

              {/* Members */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">👥 Membri del team</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTeam.members.map((member, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm"
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tech Focus */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">🔧 Focus Tecnologico</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTeam.techFocus.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm text-white"
                      style={{ backgroundColor: selectedTeam.color }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Points */}
            <div className="text-right">
              <div className="text-4xl font-bold" style={{ color: selectedTeam.color }}>
                {selectedTeam.points.toLocaleString()}
              </div>
              <div className="text-gray-500">punti totali</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamsSlide;
