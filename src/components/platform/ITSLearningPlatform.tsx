// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import HomeDashboard from './HomeDashboard';
import PercorsoView from './PercorsoView';
import PlaceholderView from './PlaceholderView';
import ModuloDinamico from '../moduli/ModuloDinamico';
import AdminNuovoModulo from './AdminNuovoModulo';
import AdminSquadre from './AdminSquadre';
import AuthPage from '../auth/AuthPage';
import { getModules, getModuleSync, deleteModule, getModulesSync } from '@/services/moduliStorage';
import { ModuleJSON } from '@/types/module';
import { getCurrentUser, signOut, UserProfile } from '@/services/authService';

// ============================================
// COMPONENTI ADMIN
// ============================================

// Helper per formattare il tempo in ore:minuti
const formatTotalTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds} sec`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

// Interfaccia per studente con dettagli
interface StudentWithProgress {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  points: number;
  team_id?: string;
  team_name?: string;
  team_color?: string;
  modules_completed: number;
  total_time_seconds: number;
}

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    studentsCount: 0,
    modulesCompleted: 0,
    quizzesPassed: 0,
    totalSlides: 0,
    totalTimeSeconds: 0
  });
  const [recentActivities, setRecentActivities] = React.useState<import('@/services/activitiesService').Activity[]>([]);
  const [teams, setTeams] = React.useState<import('@/services/teamsService').Team[]>([]);
  const [modules, setModules] = React.useState<{ id: string; titolo: string; completedBy: number }[]>([]);
  const [totalStudents, setTotalStudents] = React.useState(0);
  const [students, setStudents] = React.useState<StudentWithProgress[]>([]);

  // Stato per il modal dettaglio squadra
  const [selectedTeam, setSelectedTeam] = React.useState<import('@/services/teamsService').Team | null>(null);
  const [teamMembers, setTeamMembers] = React.useState<import('@/services/teamsService').Student[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = React.useState(false);

  // Stato per il modal dettaglio studente
  const [selectedStudent, setSelectedStudent] = React.useState<StudentWithProgress | null>(null);
  const [studentProgress, setStudentProgress] = React.useState<{ module_id: string; module_name: string; is_completed: boolean; time_spent: number; completed_slides: number; total_slides: number }[]>([]);
  const [isLoadingStudentProgress, setIsLoadingStudentProgress] = React.useState(false);

  // Stato per il modal bonus studente
  const [showBonusModal, setShowBonusModal] = React.useState(false);
  const [bonusStudent, setBonusStudent] = React.useState<StudentWithProgress | null>(null);
  const [bonusPoints, setBonusPoints] = React.useState(10);
  const [bonusReason, setBonusReason] = React.useState('');
  const [isAssigningBonus, setIsAssigningBonus] = React.useState(false);

  // Carica tutti i dati da Supabase
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { supabase } = await import('@/lib/supabase');
        const { getRecentActivities } = await import('@/services/activitiesService');
        const { getTeams } = await import('@/services/teamsService');
        const { getModules } = await import('@/services/moduliStorage');

        // Conta studenti
        const { count: studentsCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        // Conta moduli completati totali
        const { count: modulesCompleted } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('is_completed', true);

        // Conta quiz corretti
        const { count: quizzesPassed } = await supabase
          .from('student_quiz_scores')
          .select('*', { count: 'exact', head: true })
          .eq('is_correct', true);

        // Conta slide viste totali e tempo totale
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('completed_slides, time_spent_seconds');

        let totalSlides = 0;
        let totalTimeSeconds = 0;
        if (progressData) {
          for (const p of progressData) {
            if (p.completed_slides && Array.isArray(p.completed_slides)) {
              totalSlides += p.completed_slides.length;
            }
            if (p.time_spent_seconds) {
              totalTimeSeconds += p.time_spent_seconds;
            }
          }
        }

        setStats({
          studentsCount: studentsCount || 0,
          modulesCompleted: modulesCompleted || 0,
          quizzesPassed: quizzesPassed || 0,
          totalSlides,
          totalTimeSeconds
        });
        setTotalStudents(studentsCount || 0);

        // Carica attività recenti
        const activities = await getRecentActivities(10);
        setRecentActivities(activities);

        // Carica classifica squadre
        const teamsData = await getTeams();
        setTeams(teamsData);

        // Carica lista studenti dalla leaderboard (include già team_name, team_color, team_id, points)
        const { data: leaderboardData } = await supabase
          .from('students_leaderboard')
          .select('*')
          .order('points', { ascending: false });

        if (leaderboardData) {
          // Per ogni studente, calcola i moduli completati e il tempo totale
          const studentsWithProgress: StudentWithProgress[] = await Promise.all(
            leaderboardData.map(async (s) => {
              const { data: studentProgressData } = await supabase
                .from('user_progress')
                .select('is_completed, time_spent_seconds')
                .eq('user_id', s.id);

              let modulesCompleted = 0;
              let totalTime = 0;
              if (studentProgressData) {
                for (const p of studentProgressData) {
                  if (p.is_completed) modulesCompleted++;
                  if (p.time_spent_seconds) totalTime += p.time_spent_seconds;
                }
              }

              return {
                id: s.id,
                first_name: s.first_name,
                last_name: s.last_name,
                email: '', // La leaderboard non ha email, ma non è usato nella UI
                points: s.points || 0,
                team_id: s.team_id,
                team_name: s.team_name,
                team_color: s.team_color,
                modules_completed: modulesCompleted,
                total_time_seconds: totalTime
              };
            })
          );
          setStudents(studentsWithProgress);
        }

        // Carica moduli con conteggio completamenti
        const modulesData = await getModules();
        const modulesWithProgress = await Promise.all(
          modulesData.map(async (m) => {
            const { count } = await supabase
              .from('user_progress')
              .select('*', { count: 'exact', head: true })
              .eq('module_id', m.id)
              .eq('is_completed', true);
            return {
              id: m.id,
              titolo: m.titolo,
              completedBy: count || 0
            };
          })
        );
        setModules(modulesWithProgress);

      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Carica membri della squadra selezionata
  const handleTeamClick = async (team: import('@/services/teamsService').Team) => {
    setSelectedTeam(team);
    setIsLoadingMembers(true);
    try {
      const { getStudentsByTeam } = await import('@/services/teamsService');
      const members = await getStudentsByTeam(team.id);
      setTeamMembers(members);
    } catch (err) {
      console.error('Error loading team members:', err);
      setTeamMembers([]);
    }
    setIsLoadingMembers(false);
  };

  // Carica dettagli progresso studente
  const handleStudentClick = async (student: StudentWithProgress) => {
    setSelectedStudent(student);
    setIsLoadingStudentProgress(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { getModules } = await import('@/services/moduliStorage');

      // Carica tutti i moduli
      const modulesData = await getModules();

      // Carica il progresso dello studente
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('module_id, is_completed, time_spent_seconds, completed_slides')
        .eq('user_id', student.id);

      // Crea la lista di progresso per modulo
      const progressList = modulesData.map(m => {
        const progress = progressData?.find(p => p.module_id === m.id);
        return {
          module_id: m.id,
          module_name: m.titolo,
          is_completed: progress?.is_completed || false,
          time_spent: progress?.time_spent_seconds || 0,
          completed_slides: progress?.completed_slides?.length || 0,
          total_slides: m.slides?.length || 0
        };
      });

      setStudentProgress(progressList);
    } catch (err) {
      console.error('Error loading student progress:', err);
      setStudentProgress([]);
    }
    setIsLoadingStudentProgress(false);
  };

  // Apri modal per assegnare bonus a studente
  const handleOpenBonusModal = (student: StudentWithProgress, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita di aprire il modal dettaglio
    setBonusStudent(student);
    setBonusPoints(10);
    setBonusReason('');
    setShowBonusModal(true);
  };

  // Assegna bonus allo studente
  const handleAssignBonus = async () => {
    if (!bonusStudent || bonusPoints <= 0 || !bonusReason.trim()) return;

    setIsAssigningBonus(true);
    try {
      const { supabase } = await import('@/lib/supabase');

      // Inserisci il bonus nella tabella bonus_points
      // Il bonus viene associato allo studente E alla sua squadra (se presente)
      const { error } = await supabase.from('bonus_points').insert([{
        student_id: bonusStudent.id,
        team_id: bonusStudent.team_id || null,
        points: bonusPoints,
        reason: bonusReason.trim(),
        assigned_by: 'teacher'
      }]);

      if (error) {
        console.error('Error assigning bonus:', error);
        alert('Errore nell\'assegnazione del bonus');
      } else {
        // Aggiorna la lista studenti
        setStudents(prev => prev.map(s =>
          s.id === bonusStudent.id
            ? { ...s, points: s.points + bonusPoints }
            : s
        ));
        setShowBonusModal(false);
        setBonusStudent(null);
      }
    } catch (err) {
      console.error('Error assigning bonus:', err);
      alert('Errore nell\'assegnazione del bonus');
    }
    setIsAssigningBonus(false);
  };

  // Helper per formattare tempo relativo
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'ora';
    if (diffMin < 60) return `${diffMin} min fa`;
    if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? 'ora' : 'ore'} fa`;
    return `${diffDay} ${diffDay === 1 ? 'giorno' : 'giorni'} fa`;
  };

  // Helper per icona attività
  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'module_completed': return '✅';
      case 'module_started': return '▶️';
      case 'quiz_correct': return '🏆';
      case 'quiz_completed': return '🧠';
      case 'slide_viewed': return '📖';
      case 'badge_earned': return '🎖️';
      default: return '📝';
    }
  };

  // Helper per descrizione attività
  const getActivityDescription = (activity: import('@/services/activitiesService').Activity) => {
    switch (activity.action_type) {
      case 'module_completed': return 'ha completato';
      case 'module_started': return 'ha iniziato';
      case 'quiz_correct': return 'ha superato';
      case 'quiz_completed': return 'ha risposto a';
      case 'slide_viewed': return 'ha visualizzato';
      case 'badge_earned': return 'ha ottenuto';
      default: return 'ha fatto';
    }
  };

  const statCards = [
    { label: 'Studenti iscritti', value: stats.studentsCount, icon: '👥', color: 'bg-blue-500', isTime: false },
    { label: 'Moduli completati', value: stats.modulesCompleted, icon: '📚', color: 'bg-emerald-500', isTime: false },
    { label: 'Quiz superati', value: stats.quizzesPassed, icon: '🧠', color: 'bg-purple-500', isTime: false },
    { label: 'Tempo totale', value: stats.totalTimeSeconds, icon: '⏱️', color: 'bg-cyan-500', isTime: true },
    { label: 'Slide visualizzate', value: stats.totalSlides, icon: '📖', color: 'bg-amber-500', isTime: false },
  ];

  const moduleColors = ['bg-emerald-500', 'bg-indigo-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">Caricamento dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard Admin</h1>
        <p className="text-gray-500">Panoramica del corso ITS AgriFood Academy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white text-xl mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {stat.isTime ? formatTotalTime(stat.value) : stat.value}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Attività Recente */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">🕐 Attività Recente</h3>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nessuna attività recente</div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl">{getActivityIcon(activity.action_type)}</span>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-semibold">
                        {activity.first_name} {activity.last_name}
                      </span>
                      <span className="text-gray-500"> {getActivityDescription(activity)} </span>
                      <span className="font-medium text-indigo-600">{activity.target_name}</span>
                    </div>
                    <div className="text-xs text-gray-400">{formatTime(activity.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Classifica Squadre */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">🏆 Classifica Squadre</h3>
          <p className="text-xs text-gray-500 mb-3">Clicca su una squadra per vedere i membri</p>
          <div className="space-y-3">
            {teams.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nessuna squadra configurata</div>
            ) : (
              teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleTeamClick(team)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold`}
                    style={{ backgroundColor: team.color || (idx === 0 ? '#f59e0b' : idx === 1 ? '#9ca3af' : idx === 2 ? '#92400e' : '#d1d5db') }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{team.name}</div>
                    <div className="text-xs text-gray-500">{team.member_count || 0} membri</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{team.points || 0} pt</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Progresso Moduli */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">📚 Progresso Moduli</h3>
        <div className="space-y-4">
          {modules.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Nessun modulo configurato</div>
          ) : (
            modules.map((modulo, idx) => (
              <div key={modulo.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{modulo.titolo}</span>
                  <span className="text-gray-500">
                    {modulo.completedBy}/{totalStudents} studenti
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${moduleColors[idx % moduleColors.length]} rounded-full transition-all duration-500`}
                    style={{ width: totalStudents > 0 ? `${(modulo.completedBy / totalStudents) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lista Studenti */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">👥 Dettaglio Studenti</h3>
        <p className="text-xs text-gray-500 mb-4">Clicca su uno studente per vedere il dettaglio dei moduli</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-600 text-sm">Studente</th>
                <th className="text-center p-3 font-semibold text-gray-600 text-sm">Squadra</th>
                <th className="text-center p-3 font-semibold text-gray-600 text-sm">Moduli</th>
                <th className="text-center p-3 font-semibold text-gray-600 text-sm">Tempo</th>
                <th className="text-center p-3 font-semibold text-gray-600 text-sm">Punti</th>
                <th className="text-right p-3 font-semibold text-gray-600 text-sm">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Nessuno studente trovato
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr
                    key={student.id}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleStudentClick(student)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-xs text-gray-400">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {student.team_name ? (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: student.team_color || '#6366f1' }}
                        >
                          {student.team_name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-semibold text-gray-800">{student.modules_completed}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-gray-600">{formatTotalTime(student.total_time_seconds)}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-indigo-600">{student.points} pt</span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => handleOpenBonusModal(student, e)}
                        className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                        title="Assegna bonus"
                      >
                        +Bonus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dettaglio Squadra */}
      {selectedTeam && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedTeam(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 border-b" style={{ backgroundColor: selectedTeam.color || '#10b981' }}>
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h2 className="text-xl font-bold">{selectedTeam.name}</h2>
                    <p className="text-sm opacity-90">{selectedTeam.member_count || 0} membri - {selectedTeam.points || 0} pt totali</p>
                  </div>
                  <button
                    onClick={() => setSelectedTeam(null)}
                    className="text-white/80 hover:text-white text-2xl"
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Contenuto */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <h3 className="font-semibold text-gray-800 mb-4">Membri della squadra</h3>
                {isLoadingMembers ? (
                  <div className="text-center py-4 text-gray-500">Caricamento...</div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Nessun membro in questa squadra</div>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((member, idx) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {member.first_name} {member.last_name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-indigo-600">{member.points || 0} pt</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50">
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Dettaglio Studente */}
      {selectedStudent && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedStudent(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h2 className="text-xl font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                    <p className="text-sm opacity-90">
                      {selectedStudent.team_name || 'Nessuna squadra'} · {selectedStudent.points} pt · {formatTotalTime(selectedStudent.total_time_seconds)} totali
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-white/80 hover:text-white text-2xl"
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Contenuto */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <h3 className="font-semibold text-gray-800 mb-4">Progresso per modulo</h3>
                {isLoadingStudentProgress ? (
                  <div className="text-center py-4 text-gray-500">Caricamento...</div>
                ) : studentProgress.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Nessun modulo disponibile</div>
                ) : (
                  <div className="space-y-3">
                    {studentProgress.map((prog) => (
                      <div key={prog.module_id} className={`p-4 rounded-xl ${prog.is_completed ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gray-50 border-2 border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{prog.is_completed ? '✅' : '📚'}</span>
                            <span className="font-medium text-gray-800">{prog.module_name}</span>
                          </div>
                          {prog.is_completed && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                              Completato
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            📖 {prog.completed_slides}/{prog.total_slides} slide
                          </span>
                          {prog.time_spent > 0 && (
                            <span className="text-gray-500">
                              ⏱️ {formatTotalTime(prog.time_spent)}
                            </span>
                          )}
                        </div>
                        {/* Barra progresso */}
                        {prog.total_slides > 0 && (
                          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${prog.is_completed ? 'bg-emerald-500' : 'bg-indigo-500'} rounded-full transition-all`}
                              style={{ width: `${(prog.completed_slides / prog.total_slides) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Assegna Bonus */}
      {showBonusModal && bonusStudent && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowBonusModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-emerald-500 to-teal-600">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h2 className="text-xl font-bold">Assegna Bonus</h2>
                    <p className="text-sm opacity-90">
                      {bonusStudent.first_name} {bonusStudent.last_name}
                      {bonusStudent.team_name && ` - ${bonusStudent.team_name}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBonusModal(false)}
                    className="text-white/80 hover:text-white text-2xl"
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Contenuto */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Punti da assegnare</label>
                  <input
                    type="number"
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(Math.max(1, parseInt(e.target.value) || 0))}
                    min={1}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motivazione *</label>
                  <textarea
                    value={bonusReason}
                    onChange={(e) => setBonusReason(e.target.value)}
                    rows={3}
                    placeholder="Es: Partecipazione attiva in classe, Aiuto ai compagni..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                {bonusStudent.team_name && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                    I punti verranno assegnati anche alla squadra <strong>{bonusStudent.team_name}</strong>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50 flex gap-2">
                <button
                  onClick={() => setShowBonusModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAssignBonus}
                  disabled={isAssigningBonus || !bonusReason.trim() || bonusPoints <= 0}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAssigningBonus ? 'Assegnazione...' : `Assegna +${bonusPoints} pt`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const AdminContenuti = ({ setActiveModule, onRefresh, onEditModule }: { setActiveModule?: (id: string) => void; onRefresh?: number; onEditModule?: (moduleId: string) => void }) => {
  const [modules, setModules] = React.useState<ModuleJSON[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Carica i moduli da Supabase
  React.useEffect(() => {
    const loadModules = async () => {
      setIsLoading(true);
      try {
        // Carica tutti i moduli da Supabase
        const allModules = await getModules();
        setModules(allModules);
      } catch (err) {
        console.error('Error loading modules:', err);
        setModules(getModulesSync());
      }
      setIsLoading(false);
    };
    loadModules();
  }, [onRefresh]);

  const handleDeleteModule = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo modulo?')) {
      await deleteModule(id);
      const allModules = await getModules();
      setModules(allModules);
    }
  };

  // Converti moduli nel formato della tabella
  const allModules = modules.map(m => ({
    id: m.id,
    nome: m.titolo,
    slides: m.slides?.length || 0,
    video: m.slides?.reduce((acc, s) => acc + (s.videos?.length || 0), 0) || 0,
    articoli: m.slides?.reduce((acc, s) => acc + (s.articles?.length || 0), 0) || 0,
    stato: 'pubblicato',
    icon: m.icon,
    hasNoteDocente: m.slides?.some(s => s.noteDocente) || false,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📝 Gestione Contenuti</h1>
          <p className="text-gray-500">
            {isLoading ? 'Caricamento...' : `${allModules.length} moduli totali`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600">Modulo</th>
              <th className="text-center p-4 font-semibold text-gray-600">Slide</th>
              <th className="text-center p-4 font-semibold text-gray-600">Video</th>
              <th className="text-center p-4 font-semibold text-gray-600">Articoli</th>
              <th className="text-center p-4 font-semibold text-gray-600">Note</th>
              <th className="text-right p-4 font-semibold text-gray-600">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Caricamento moduli...
                </td>
              </tr>
            ) : allModules.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Nessun modulo trovato
                </td>
              </tr>
            ) : (
              allModules.map((modulo, idx) => (
                <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {modulo.icon && <span>{modulo.icon}</span>}
                      <div>
                        <div className="font-medium text-gray-800">{modulo.nome}</div>
                        <div className="text-xs text-gray-500">ID: {modulo.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-gray-800">{modulo.slides}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-gray-800">{modulo.video}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-gray-800">{modulo.articoli}</span>
                  </td>
                  <td className="p-4 text-center">
                    {modulo.hasNoteDocente ? (
                      <span className="text-emerald-500" title="Note docente presenti">✅</span>
                    ) : (
                      <span className="text-gray-300" title="Nessuna nota">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {setActiveModule && (
                      <button
                        onClick={() => setActiveModule(modulo.id)}
                        className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        Apri
                      </button>
                    )}
                    {onEditModule && (
                      <button
                        onClick={() => onEditModule(modulo.id)}
                        className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ml-2"
                      >
                        Modifica
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteModule(modulo.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// AdminSquadre è ora importato da ./AdminSquadre

const AdminBadge = () => {
  const [badges, setBadges] = React.useState<import('@/services/badgesService').Badge[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingBadge, setEditingBadge] = React.useState<import('@/services/badgesService').Badge | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    icon: '🏆',
    criteria_type: 'manual' as 'manual' | 'points' | 'modules' | 'quizzes' | 'team' | 'slides',
    criteria_value: 0,
    points_reward: 0,
    is_active: true
  });

  // Carica i badge da Supabase
  const loadBadges = async () => {
    setIsLoading(true);
    try {
      const { getBadges } = await import('@/services/badgesService');
      const data = await getBadges();
      setBadges(data);
    } catch (err) {
      console.error('Error loading badges:', err);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    loadBadges();
  }, []);

  // Apri modal per nuovo badge
  const handleNewBadge = () => {
    setEditingBadge(null);
    setFormData({
      name: '',
      description: '',
      icon: '🏆',
      criteria_type: 'manual',
      criteria_value: 0,
      points_reward: 0,
      is_active: true
    });
    setShowModal(true);
  };

  // Apri modal per modificare badge
  const handleEditBadge = (badge: import('@/services/badgesService').Badge) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description || '',
      icon: badge.icon,
      criteria_type: badge.criteria_type,
      criteria_value: badge.criteria_value,
      points_reward: badge.points_reward,
      is_active: badge.is_active
    });
    setShowModal(true);
  };

  // Salva badge (crea o aggiorna)
  const handleSaveBadge = async () => {
    try {
      if (editingBadge) {
        const { updateBadge } = await import('@/services/badgesService');
        await updateBadge(editingBadge.id, formData);
      } else {
        const { createBadge } = await import('@/services/badgesService');
        await createBadge(formData);
      }
      setShowModal(false);
      loadBadges();
    } catch (err) {
      console.error('Error saving badge:', err);
      alert('Errore nel salvataggio del badge');
    }
  };

  // Elimina badge
  const handleDeleteBadge = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo badge?')) return;
    try {
      const { deleteBadge } = await import('@/services/badgesService');
      await deleteBadge(id);
      loadBadges();
    } catch (err) {
      console.error('Error deleting badge:', err);
      alert('Errore nell\'eliminazione del badge');
    }
  };

  // Colori per tipo criterio
  const criteriaColors: Record<string, string> = {
    manual: 'bg-gray-100',
    points: 'bg-amber-100',
    modules: 'bg-blue-100',
    quizzes: 'bg-purple-100',
    team: 'bg-green-100',
    slides: 'bg-indigo-100'
  };

  const criteriaLabels: Record<string, string> = {
    manual: 'Manuale',
    points: 'Punti',
    modules: 'Moduli',
    quizzes: 'Quiz',
    team: 'Team',
    slides: 'Slide'
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🎖️ Gestione Badge</h1>
          <p className="text-gray-500">
            {isLoading ? 'Caricamento...' : `${badges.length} badge configurati`}
          </p>
        </div>
        <button
          onClick={handleNewBadge}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
        >
          + Nuovo Badge
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Caricamento badge...</div>
      ) : badges.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nessun badge configurato. Clicca su "Nuovo Badge" per crearne uno.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div key={badge.id} className={`${criteriaColors[badge.criteria_type] || 'bg-gray-100'} rounded-2xl p-6`}>
              <div className="flex items-start justify-between">
                <div className="text-4xl mb-3">{badge.icon}</div>
                {!badge.is_active && (
                  <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">Disattivo</span>
                )}
              </div>
              <div className="font-bold text-gray-800 mb-1">{badge.name}</div>
              <div className="text-sm text-gray-600 mb-2">{badge.description}</div>
              <div className="text-xs text-gray-500 mb-4">
                <span className="bg-white/50 px-2 py-1 rounded mr-2">
                  {criteriaLabels[badge.criteria_type]}: {badge.criteria_value}
                </span>
                <span className="bg-white/50 px-2 py-1 rounded">
                  +{badge.points_reward} pt
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{badge.times_awarded || 0} assegnati</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditBadge(badge)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crea/Modifica Badge */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingBadge ? 'Modifica Badge' : 'Nuovo Badge'}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icona</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={e => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-2xl text-center"
                      maxLength={4}
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Nome del badge"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    placeholder="Descrizione del badge"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Criterio</label>
                    <select
                      value={formData.criteria_type}
                      onChange={e => setFormData({ ...formData, criteria_type: e.target.value as typeof formData.criteria_type })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="manual">Manuale</option>
                      <option value="points">Punti raggiunt</option>
                      <option value="modules">Moduli completati</option>
                      <option value="quizzes">Quiz corretti</option>
                      <option value="slides">Slide viste</option>
                      <option value="team">Membro di un team</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valore Criterio</label>
                    <input
                      type="number"
                      value={formData.criteria_value}
                      onChange={e => setFormData({ ...formData, criteria_value: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min={0}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Punti Bonus</label>
                    <input
                      type="number"
                      value={formData.points_reward}
                      onChange={e => setFormData({ ...formData, points_reward: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min={0}
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Badge attivo</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveBadge}
                  disabled={!formData.name}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {editingBadge ? 'Salva Modifiche' : 'Crea Badge'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const AdminHackathon = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">💡 Setup Hackathon</h1>
        <p className="text-gray-500">Configura l hackathon finale del corso</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">📅 Dettagli Evento</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Nome Hackathon</label>
            <input 
              type="text" 
              defaultValue="AgriFood Innovation Challenge 2025"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Data</label>
            <input 
              type="date" 
              defaultValue="2025-01-15"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">Descrizione</label>
            <textarea 
              rows={3}
              defaultValue="Progetta una soluzione innovativa per la tracciabilità e sostenibilità nel settore agroalimentare."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">🏆 Premi</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
            <span className="text-3xl">🥇</span>
            <div className="flex-1">
              <div className="font-semibold">1° Posto</div>
              <input 
                type="text" 
                defaultValue="Stage presso azienda partner + certificazione"
                className="w-full mt-1 px-3 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
            <span className="text-3xl">🥈</span>
            <div className="flex-1">
              <div className="font-semibold">2° Posto</div>
              <input 
                type="text" 
                defaultValue="Corso avanzato gratuito + certificazione"
                className="w-full mt-1 px-3 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-amber-100 rounded-xl">
            <span className="text-3xl">🥉</span>
            <div className="flex-1">
              <div className="font-semibold">3° Posto</div>
              <input 
                type="text" 
                defaultValue="Certificazione + menzione speciale"
                className="w-full mt-1 px-3 py-1 border rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
            Salva Configurazione
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const [isResetting, setIsResetting] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetAllStatistics = async () => {
    if (!confirm('⚠️ ATTENZIONE: Questa operazione resetterà TUTTE le statistiche di TUTTI gli studenti.\n\nVerranno eliminati:\n- Progressi dei moduli\n- Punteggi quiz\n- Punti bonus\n- Badge ottenuti\n- Attività recenti\n\nQuesta operazione NON è reversibile. Continuare?')) {
      return;
    }

    if (!confirm('Sei ASSOLUTAMENTE sicuro? Tutti i dati degli studenti verranno persi permanentemente.')) {
      return;
    }

    setIsResetting(true);
    setResetMessage(null);

    try {
      const { resetAllStatistics } = await import('@/services/progressService');
      const success = await resetAllStatistics();
      if (success) {
        setResetMessage({ type: 'success', text: 'Tutte le statistiche sono state resettate con successo.' });
      } else {
        setResetMessage({ type: 'error', text: 'Si è verificato un errore durante il reset.' });
      }
    } catch (err) {
      console.error('Error resetting statistics:', err);
      setResetMessage({ type: 'error', text: 'Errore di connessione durante il reset.' });
    }

    setIsResetting(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">⚙️ Impostazioni</h1>
        <p className="text-gray-500">Configura le impostazioni della piattaforma</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">🎨 Aspetto</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">Colore primario</div>
                <div className="text-sm text-gray-500">Colore principale della piattaforma</div>
              </div>
              <input type="color" defaultValue="#10B981" className="w-12 h-10 rounded cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">Logo</div>
                <div className="text-sm text-gray-500">Logo visualizzato nella sidebar</div>
              </div>
              <button className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                Carica logo
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">🔔 Notifiche</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">Email nuovi contenuti</div>
                <div className="text-sm text-gray-500">Notifica studenti quando pubblichi nuovi moduli</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-700">Reminder scadenze</div>
                <div className="text-sm text-gray-500">Invia promemoria per quiz e sfide in scadenza</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">📊 Esportazione Dati</h3>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
              📥 Esporta Studenti (CSV)
            </button>
            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
              📥 Esporta Progressi (CSV)
            </button>
            <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
              📥 Report Completo (PDF)
            </button>
          </div>
        </div>

        {/* Zona Pericolo - Reset Statistiche */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-red-200">
          <h3 className="font-semibold text-red-700 mb-4">⚠️ Zona Pericolo</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="font-medium text-red-800 mb-2">Reset Statistiche</div>
              <p className="text-sm text-red-600 mb-4">
                Questa operazione eliminerà permanentemente tutti i progressi, punteggi, badge e attività di tutti gli studenti.
                Usa questa funzione solo per iniziare un nuovo anno accademico o per test.
              </p>
              {resetMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  resetMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {resetMessage.text}
                </div>
              )}
              <button
                onClick={handleResetAllStatistics}
                disabled={isResetting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isResetting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Reset in corso...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Reset Tutte le Statistiche</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPALE
// ============================================

const ITSLearningPlatform: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Deriva il ruolo dall'utente autenticato
  const userRole = currentUser?.role === 'teacher' || currentUser?.role === 'admin' ? 'admin' : 'student';
  const isAdmin = userRole === 'admin';

  // Carica l'utente corrente all'avvio
  useEffect(() => {
    const loadUser = async () => {
      setIsAuthLoading(true);
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error loading user:', err);
      }
      setIsAuthLoading(false);
    };
    loadUser();
  }, []);

  // Handler per login riuscito
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  // Handler per logout
  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setCurrentView('home');
  };

  // Handler per ricaricare i dati dell'utente (punti, ecc.)
  const refreshCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  // Mostra loading durante il check auth iniziale
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">ITS</div>
          <div className="text-xl">AgriFood Academy</div>
          <div className="mt-4 animate-pulse">Caricamento...</div>
        </div>
      </div>
    );
  }

  // Se non autenticato, mostra pagina login
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Handler per editare un modulo
  const handleEditModule = (moduleId: string) => {
    setEditingModuleId(moduleId);
    setCurrentView('admin-nuovo-modulo');
  };

  // Render del modulo attivo - tutti i moduli sono su Supabase
  const renderActiveModule = () => {
    if (!activeModule) return null;

    const dynamicModule = getModuleSync(activeModule);
    if (dynamicModule) {
      return (
        <ModuloDinamico
          module={dynamicModule}
          onBack={() => setActiveModule(null)}
          isAdmin={isAdmin}
          userRole={userRole}
          currentUser={currentUser}
        />
      );
    }
    return null;
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
      // Viste Studente
      case 'home':
        return (
          <HomeDashboard
            setCurrentView={setCurrentView}
            setActiveModule={setActiveModule}
            currentUser={currentUser}
          />
        );
      case 'percorso':
        return <PercorsoView setActiveModule={setActiveModule} currentUser={currentUser} />;
      case 'sfide':
        return <PlaceholderView title="Sfide & Competizioni" icon="🏆" />;
      case 'tutor':
        return <PlaceholderView title="AI Tutor" icon="🤖" />;
      case 'hackathon':
        return <PlaceholderView title="Hackathon Space" icon="💡" />;
      
      // Viste Admin
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-contenuti':
        return <AdminContenuti setActiveModule={setActiveModule} onEditModule={handleEditModule} />;
      case 'admin-squadre':
        return <AdminSquadre />;
      case 'admin-badge':
        return <AdminBadge />;
      case 'admin-hackathon':
        return <AdminHackathon />;
      case 'admin-settings':
        return <AdminSettings />;
      case 'admin-nuovo-modulo':
        return <AdminNuovoModulo
          editModuleId={editingModuleId}
          onModuleCreated={() => {
            setEditingModuleId(null);
            setCurrentView('admin-contenuti');
          }}
          onCancel={() => {
            setEditingModuleId(null);
            setCurrentView('admin-contenuti');
          }}
        />;

      default:
        // Per admin/docenti, mostra direttamente la dashboard admin
        if (isAdmin) {
          return <AdminDashboard />;
        }
        return (
          <HomeDashboard
            setCurrentView={setCurrentView}
            setActiveModule={setActiveModule}
            currentUser={currentUser}
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
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-auto">{renderView()}</div>
    </div>
  );
};

export default ITSLearningPlatform;
