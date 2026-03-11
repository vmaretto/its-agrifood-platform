'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface BonusDetail {
  id: string;
  student_id: string | null;
  team_id: string | null;
  points: number;
  reason: string;
  assigned_by: string;
  assigned_at: string;
  student_name?: string;
  team_name?: string;
}

interface TeamSummary {
  id: string;
  name: string;
  color: string;
  total_points: number;
  member_count: number;
  bonuses: BonusDetail[];
}

interface CheatAlert {
  type: 'duplicate_module' | 'duplicate_quiz' | 'fast_completion';
  student_id: string;
  student_name: string;
  team_name: string;
  detail: string;
  count?: number;
  time_seconds?: number;
  ids_to_delete?: string[];
}

interface AdminPunteggiProps {
  courseId?: string;
  onBack?: () => void;
}

export default function AdminPunteggi({ courseId, onBack }: AdminPunteggiProps) {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<TeamSummary | null>(null);
  const [cheatAlerts, setCheatAlerts] = useState<CheatAlert[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'alerts'>('alerts');

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Carica squadre del corso
    let teamsQuery = supabase.from('teams').select('*');
    if (courseId) {
      teamsQuery = teamsQuery.eq('course_id', courseId);
    }
    const { data: teamsData } = await teamsQuery;

    if (!teamsData) {
      setIsLoading(false);
      return;
    }

    const teamIds = teamsData.map(t => t.id);

    // Carica tutti gli studenti delle squadre del corso
    const { data: allStudents } = await supabase
      .from('students')
      .select('id, first_name, last_name, team_id')
      .in('team_id', teamIds);

    const studentMap = new Map(allStudents?.map(s => [s.id, s]) || []);
    const teamMap = new Map(teamsData.map(t => [t.id, t]));

    // Carica punteggi dalla view (stessa fonte della dashboard)
    let leaderboardQuery = supabase.from('teams_leaderboard').select('*');
    if (courseId) {
      leaderboardQuery = leaderboardQuery.eq('course_id', courseId);
    }
    const { data: leaderboardData } = await leaderboardQuery;

    // Per ogni squadra, carica i dettagli bonus
    const teamSummaries: TeamSummary[] = [];

    for (const team of (leaderboardData || [])) {
      // Carica studenti della squadra
      const { data: students } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('team_id', team.id);

      const studentIds = students?.map(s => s.id) || [];

      // Carica bonus squadra
      const { data: teamBonuses } = await supabase
        .from('bonus_points')
        .select('*')
        .eq('team_id', team.id);

      // Carica bonus studenti
      let studentBonuses: any[] = [];
      if (studentIds.length > 0) {
        const { data } = await supabase
          .from('bonus_points')
          .select('*')
          .in('student_id', studentIds);
        studentBonuses = data || [];
      }

      // Combina bonus (solo per visualizzazione dettaglio)
      const allBonuses: BonusDetail[] = [
        ...(teamBonuses || []).map(b => ({
          ...b,
          team_name: team.name,
          student_name: null
        })),
        ...studentBonuses.map(b => {
          const student = students?.find(s => s.id === b.student_id);
          return {
            ...b,
            team_name: team.name,
            student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown'
          };
        })
      ].sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime());

      teamSummaries.push({
        id: team.id,
        name: team.name,
        color: team.color || '#6B7280',
        total_points: team.points || 0,
        member_count: team.member_count || 0,
        bonuses: allBonuses
      });
    }

    // Ordina per punteggio
    teamSummaries.sort((a, b) => b.total_points - a.total_points);
    setTeams(teamSummaries);

    // Trova tutti i problemi (cheat alerts)
    await findCheatAlerts(studentMap, teamMap);

    setIsLoading(false);
  };

  const findCheatAlerts = async (
    studentMap: Map<string, any>,
    teamMap: Map<string, any>
  ) => {
    const alerts: CheatAlert[] = [];

    // 1. MODULI COMPLETATI PIÙ VOLTE (bonus duplicati)
    const { data: moduleBonuses } = await supabase
      .from('bonus_points')
      .select('*')
      .like('reason', 'Modulo completato:%')
      .order('student_id')
      .order('reason')
      .order('assigned_at');

    if (moduleBonuses) {
      const moduleCount = new Map<string, { count: number; ids: string[]; reason: string }>();
      
      for (const bonus of moduleBonuses) {
        const key = `${bonus.student_id}-${bonus.reason}`;
        const existing = moduleCount.get(key);
        if (existing) {
          existing.count++;
          existing.ids.push(bonus.id);
        } else {
          moduleCount.set(key, { count: 1, ids: [bonus.id], reason: bonus.reason });
        }
      }

      for (const [key, value] of moduleCount) {
        if (value.count > 1) {
          const studentId = key.split('-')[0];
          const student = studentMap.get(studentId);
          const team = student ? teamMap.get(student.team_id) : null;
          
          alerts.push({
            type: 'duplicate_module',
            student_id: studentId,
            student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown',
            team_name: team?.name || 'Unknown',
            detail: value.reason.replace('Modulo completato: ', ''),
            count: value.count,
            ids_to_delete: value.ids.slice(1) // Mantieni solo il primo
          });
        }
      }
    }

    // 2. QUIZ RIFATTI PIÙ VOLTE
    const { data: quizScores } = await supabase
      .from('student_quiz_scores')
      .select('*')
      .order('student_id')
      .order('module_id')
      .order('quiz_index')
      .order('created_at');

    if (quizScores) {
      const quizCount = new Map<string, { count: number; correct: number; module_id: string; quiz_index: number }>();
      
      for (const score of quizScores) {
        const key = `${score.student_id}-${score.module_id}-${score.quiz_index}`;
        const existing = quizCount.get(key);
        if (existing) {
          existing.count++;
          if (score.is_correct) existing.correct++;
        } else {
          quizCount.set(key, { 
            count: 1, 
            correct: score.is_correct ? 1 : 0,
            module_id: score.module_id,
            quiz_index: score.quiz_index
          });
        }
      }

      for (const [key, value] of quizCount) {
        if (value.count > 1) {
          const [studentId] = key.split('-');
          const student = studentMap.get(studentId);
          const team = student ? teamMap.get(student.team_id) : null;
          
          alerts.push({
            type: 'duplicate_quiz',
            student_id: studentId,
            student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown',
            team_name: team?.name || 'Unknown',
            detail: `Quiz ${value.quiz_index + 1} (${value.correct}/${value.count} corrette)`,
            count: value.count
          });
        }
      }
    }

    // 3. COMPLETAMENTI TROPPO VELOCI (< 2 minuti per modulo)
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('is_completed', true)
      .lt('time_spent_seconds', 120) // Meno di 2 minuti
      .order('student_id');

    if (progressData) {
      for (const progress of progressData) {
        const student = studentMap.get(progress.student_id);
        const team = student ? teamMap.get(student.team_id) : null;
        
        // Solo se lo studente è del corso corrente
        if (student) {
          alerts.push({
            type: 'fast_completion',
            student_id: progress.student_id,
            student_name: `${student.first_name} ${student.last_name}`,
            team_name: team?.name || 'Unknown',
            detail: progress.module_id,
            time_seconds: progress.time_spent_seconds
          });
        }
      }
    }

    // Ordina: prima duplicate_module, poi duplicate_quiz, poi fast_completion
    alerts.sort((a, b) => {
      const order = { duplicate_module: 0, duplicate_quiz: 1, fast_completion: 2 };
      return order[a.type] - order[b.type];
    });

    setCheatAlerts(alerts);
  };

  const deleteBonus = async (bonusId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo bonus?')) return;

    const { error } = await supabase
      .from('bonus_points')
      .delete()
      .eq('id', bonusId);

    if (error) {
      setMessage({ type: 'error', text: 'Errore eliminazione' });
    } else {
      setMessage({ type: 'success', text: 'Bonus eliminato!' });
      loadData();
    }
  };

  const fixAlert = async (alert: CheatAlert) => {
    if (alert.type === 'duplicate_module' && alert.ids_to_delete) {
      if (!confirm(`Eliminare ${alert.ids_to_delete.length} bonus duplicati per "${alert.detail}"?`)) return;
      
      for (const id of alert.ids_to_delete) {
        await supabase.from('bonus_points').delete().eq('id', id);
      }
      
      setMessage({ type: 'success', text: 'Duplicati eliminati!' });
      loadData();
    }
  };

  const fixAllDuplicates = async () => {
    const duplicateAlerts = cheatAlerts.filter(a => a.type === 'duplicate_module');
    if (duplicateAlerts.length === 0) return;
    
    const totalToDelete = duplicateAlerts.reduce((sum, a) => sum + (a.ids_to_delete?.length || 0), 0);
    if (!confirm(`Eliminare ${totalToDelete} bonus duplicati da ${duplicateAlerts.length} casi?`)) return;

    for (const alert of duplicateAlerts) {
      if (alert.ids_to_delete) {
        for (const id of alert.ids_to_delete) {
          await supabase.from('bonus_points').delete().eq('id', id);
        }
      }
    }

    setMessage({ type: 'success', text: `${totalToDelete} duplicati eliminati!` });
    loadData();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const getAlertIcon = (type: CheatAlert['type']) => {
    switch (type) {
      case 'duplicate_module': return '⚠️';
      case 'duplicate_quiz': return '🔄';
      case 'fast_completion': return '⚡';
    }
  };

  const getAlertColor = (type: CheatAlert['type']) => {
    switch (type) {
      case 'duplicate_module': return 'bg-amber-50 border-amber-300 text-amber-800';
      case 'duplicate_quiz': return 'bg-blue-50 border-blue-300 text-blue-800';
      case 'fast_completion': return 'bg-red-50 border-red-300 text-red-800';
    }
  };

  const getAlertLabel = (type: CheatAlert['type']) => {
    switch (type) {
      case 'duplicate_module': return 'Modulo completato più volte';
      case 'duplicate_quiz': return 'Quiz rifatto più volte';
      case 'fast_completion': return 'Completamento troppo veloce';
    }
  };

  // Conta per tipo
  const duplicateModuleCount = cheatAlerts.filter(a => a.type === 'duplicate_module').length;
  const duplicateQuizCount = cheatAlerts.filter(a => a.type === 'duplicate_quiz').length;
  const fastCompletionCount = cheatAlerts.filter(a => a.type === 'fast_completion').length;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Caricamento punteggi...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {onBack && (
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            ← Indietro
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-800">🔍 Controllo Punteggi</h1>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
        >
          🔄 Aggiorna
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-xl ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🚨 Anomalie ({cheatAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'teams'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          👥 Squadre ({teams.length})
        </button>
      </div>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="text-3xl font-bold text-amber-700">{duplicateModuleCount}</div>
              <div className="text-amber-600">⚠️ Moduli duplicati</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-700">{duplicateQuizCount}</div>
              <div className="text-blue-600">🔄 Quiz ripetuti</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="text-3xl font-bold text-red-700">{fastCompletionCount}</div>
              <div className="text-red-600">⚡ Troppo veloci</div>
            </div>
          </div>

          {/* Fix All Button */}
          {duplicateModuleCount > 0 && (
            <div className="mb-4">
              <button
                onClick={fixAllDuplicates}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
              >
                🗑️ Elimina tutti i {duplicateModuleCount} moduli duplicati
              </button>
            </div>
          )}

          {/* Alerts List */}
          {cheatAlerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
              ✅ Nessuna anomalia rilevata!
            </div>
          ) : (
            <div className="space-y-3">
              {cheatAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                      <div>
                        <div className="font-bold">
                          {alert.student_name}
                          <span className="ml-2 text-sm font-normal opacity-70">({alert.team_name})</span>
                        </div>
                        <div className="text-sm">
                          {getAlertLabel(alert.type)}: <strong>{alert.detail}</strong>
                          {alert.count && alert.count > 1 && (
                            <span className="ml-2 px-2 py-0.5 bg-white/50 rounded-full text-xs">
                              {alert.count}x
                            </span>
                          )}
                          {alert.time_seconds !== undefined && (
                            <span className="ml-2 px-2 py-0.5 bg-white/50 rounded-full text-xs">
                              {formatTime(alert.time_seconds)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {alert.type === 'duplicate_module' && alert.ids_to_delete && (
                      <button
                        onClick={() => fixAlert(alert)}
                        className="px-3 py-1 bg-white hover:bg-gray-100 rounded-lg text-sm font-medium border"
                      >
                        🗑️ Rimuovi duplicati
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div>
          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {teams.map((team, idx) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeam(selectedTeam?.id === team.id ? null : team)}
                className={`p-4 rounded-xl text-left transition-all ${
                  selectedTeam?.id === team.id
                    ? 'ring-2 ring-indigo-500 bg-indigo-50'
                    : 'bg-white hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: team.color }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{team.name}</div>
                      <div className="text-sm text-gray-500">{team.member_count} membri • {team.bonuses.length} bonus</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: team.color }}>
                    {team.total_points}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Team Detail */}
          {selectedTeam && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {selectedTeam.name} — Dettaglio Bonus
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Data</th>
                      <th className="text-left py-2 px-3">Studente</th>
                      <th className="text-left py-2 px-3">Motivo</th>
                      <th className="text-left py-2 px-3">Assegnato da</th>
                      <th className="text-right py-2 px-3">Punti</th>
                      <th className="text-right py-2 px-3">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTeam.bonuses.map((bonus) => (
                      <tr key={bonus.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-500">{formatDate(bonus.assigned_at)}</td>
                        <td className="py-2 px-3">
                          {bonus.student_name || <span className="text-gray-400 italic">Squadra</span>}
                        </td>
                        <td className="py-2 px-3 max-w-xs truncate" title={bonus.reason}>
                          {bonus.reason}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            bonus.assigned_by === 'system' ? 'bg-gray-100 text-gray-600' :
                            bonus.assigned_by === 'teacher' ? 'bg-blue-100 text-blue-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {bonus.assigned_by}
                          </span>
                        </td>
                        <td className={`py-2 px-3 text-right font-bold ${
                          bonus.points >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {bonus.points > 0 ? '+' : ''}{bonus.points}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => deleteBonus(bonus.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={4} className="py-2 px-3 text-right">Totale:</td>
                      <td className="py-2 px-3 text-right text-lg">{selectedTeam.total_points}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
