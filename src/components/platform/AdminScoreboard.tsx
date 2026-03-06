'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type TabType = 'students' | 'teams' | 'bonuses' | 'verify';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  team_id: string | null;
  team_name: string | null;
  team_color: string | null;
  total_points: number;
  bonuses: BonusDetail[];
}

interface Team {
  id: string;
  name: string;
  color: string;
  member_count: number;
  student_points: number;
  team_bonus: number;
  calculated_total: number;
  leaderboard_total: number;
  has_discrepancy: boolean;
  members: { id: string; name: string; points: number }[];
  team_bonuses: BonusDetail[];
}

interface BonusDetail {
  id: string;
  points: number;
  reason: string;
  assigned_by: string;
  assigned_at: string;
}

interface Bonus {
  id: string;
  student_id: string | null;
  team_id: string | null;
  points: number;
  reason: string;
  assigned_by: string;
  assigned_at: string;
  student_name: string | null;
  team_name: string | null;
}

interface AdminScoreboardProps {
  courseId?: string;
  onBack?: () => void;
}

export default function AdminScoreboard({ courseId, onBack }: AdminScoreboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('teams');
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'student' | 'team'>('all');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadStudents(), loadTeams(), loadBonuses()]);
    setIsLoading(false);
  };

  const loadStudents = async () => {
    // Prima ottieni i team del corso
    let teamIds: string[] = [];
    if (courseId) {
      const { data: courseTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('course_id', courseId);
      teamIds = courseTeams?.map(t => t.id) || [];
    }

    // Poi carica gli studenti (filtrati per team se c'è un corso)
    let query = supabase
      .from('students')
      .select(`id, first_name, last_name, email, team_id, teams!left(name, color, course_id)`);
    
    if (courseId && teamIds.length > 0) {
      query = query.in('team_id', teamIds);
    } else if (courseId) {
      // Se il corso non ha team, non mostrare studenti
      setStudents([]);
      return;
    }
    
    const { data: studentsData } = await query;
    if (!studentsData) return;

    const studentsWithPoints: Student[] = [];
    
    for (const student of studentsData) {
      // Bonus points
      const { data: bonusData } = await supabase
        .from('bonus_points')
        .select('id, points, reason, assigned_by, assigned_at')
        .eq('student_id', student.id)
        .order('assigned_at', { ascending: false });
      
      const bonusPoints = bonusData?.reduce((sum, b) => sum + b.points, 0) || 0;

      // Quiz scores
      const { data: quizData } = await supabase
        .from('student_quiz_scores')
        .select('score')
        .eq('student_id', student.id);
      
      const quizPoints = quizData?.reduce((sum, q) => sum + (q.score || 0), 0) || 0;

      const totalPoints = quizPoints + bonusPoints;
      
      studentsWithPoints.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        team_id: student.team_id,
        team_name: (student.teams as any)?.name || null,
        team_color: (student.teams as any)?.color || null,
        total_points: totalPoints,
        bonuses: bonusData || []
      });
    }

    studentsWithPoints.sort((a, b) => b.total_points - a.total_points);
    setStudents(studentsWithPoints);
  };

  const loadTeams = async () => {
    // Carica dalla leaderboard view (questa è la "verità" mostrata agli utenti)
    let query = supabase.from('teams_leaderboard').select('*');
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    const { data: leaderboardData } = await query;

    if (!leaderboardData) return;

    const teamsWithBreakdown: Team[] = [];

    for (const team of leaderboardData) {
      // Bonus direttamente alla squadra
      const { data: teamBonusData } = await supabase
        .from('bonus_points')
        .select('id, points, reason, assigned_by, assigned_at')
        .eq('team_id', team.id)
        .order('assigned_at', { ascending: false });
      
      const teamBonus = teamBonusData?.reduce((sum, b) => sum + b.points, 0) || 0;

      // Studenti della squadra con i loro punti
      const { data: teamStudents } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('team_id', team.id);

      const members: { id: string; name: string; points: number }[] = [];
      let studentPoints = 0;

      if (teamStudents && teamStudents.length > 0) {
        for (const student of teamStudents) {
          // Bonus dello studente
          const { data: studentBonusData } = await supabase
            .from('bonus_points')
            .select('points')
            .eq('student_id', student.id);
          
          const bonusPts = studentBonusData?.reduce((sum, b) => sum + b.points, 0) || 0;

          // Quiz scores dello studente
          const { data: quizData } = await supabase
            .from('student_quiz_scores')
            .select('score')
            .eq('student_id', student.id);
          
          const quizPts = quizData?.reduce((sum, q) => sum + (q.score || 0), 0) || 0;

          const pts = bonusPts + quizPts;
          studentPoints += pts;
          members.push({
            id: student.id,
            name: `${student.first_name} ${student.last_name}`,
            points: pts
          });
        }
      }

      const calculatedTotal = studentPoints + teamBonus;
      const leaderboardTotal = team.points || 0;

      teamsWithBreakdown.push({
        id: team.id,
        name: team.name,
        color: team.color || '#6B7280',
        member_count: team.member_count || 0,
        student_points: studentPoints,
        team_bonus: teamBonus,
        calculated_total: calculatedTotal,
        leaderboard_total: leaderboardTotal,
        has_discrepancy: calculatedTotal !== leaderboardTotal,
        members: members.sort((a, b) => b.points - a.points),
        team_bonuses: teamBonusData || []
      });
    }

    teamsWithBreakdown.sort((a, b) => b.calculated_total - a.calculated_total);
    setTeams(teamsWithBreakdown);
  };

  const loadBonuses = async () => {
    const { data: bonusData } = await supabase
      .from('bonus_points')
      .select('*')
      .order('assigned_at', { ascending: false });

    if (!bonusData) return;

    const studentIds = Array.from(new Set(bonusData.filter(b => b.student_id).map(b => b.student_id)));
    const teamIds = Array.from(new Set(bonusData.filter(b => b.team_id).map(b => b.team_id)));

    let studentsMap: Record<string, string> = {};
    let teamsMap: Record<string, string> = {};

    if (studentIds.length > 0) {
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .in('id', studentIds);
      
      studentsMap = Object.fromEntries(
        (studentsData || []).map(s => [s.id, `${s.first_name} ${s.last_name}`])
      );
    }

    if (teamIds.length > 0) {
      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', teamIds);
      
      teamsMap = Object.fromEntries(
        (teamsData || []).map(t => [t.id, t.name])
      );
    }

    let filteredBonuses = bonusData;
    if (courseId) {
      const { data: courseStudents } = await supabase
        .from('students')
        .select('id')
        .eq('course_id', courseId);
      const courseStudentIds = new Set(courseStudents?.map(s => s.id) || []);

      const { data: courseTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('course_id', courseId);
      const courseTeamIds = new Set(courseTeams?.map(t => t.id) || []);

      filteredBonuses = bonusData.filter(b => 
        (b.student_id && courseStudentIds.has(b.student_id)) ||
        (b.team_id && courseTeamIds.has(b.team_id))
      );
    }

    const bonusesWithNames: Bonus[] = filteredBonuses.map(b => ({
      ...b,
      student_name: b.student_id ? studentsMap[b.student_id] || 'Unknown' : null,
      team_name: b.team_id ? teamsMap[b.team_id] || 'Unknown' : null
    }));

    setBonuses(bonusesWithNames);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBonuses = bonuses.filter(b => {
    const matchesSearch = searchQuery === '' || 
      b.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.team_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' ||
      (filterType === 'student' && b.student_id) ||
      (filterType === 'team' && b.team_id && !b.student_id);
    
    return matchesSearch && matchesType;
  });

  const discrepancyCount = teams.filter(t => t.has_discrepancy).length;
  const totalCalculated = teams.reduce((sum, t) => sum + t.calculated_total, 0);
  const totalLeaderboard = teams.reduce((sum, t) => sum + t.leaderboard_total, 0);

  const tabs: { id: TabType; label: string; icon: string; count?: number; alert?: boolean }[] = [
    { id: 'teams', label: 'Squadre', icon: '🏆', count: teams.length },
    { id: 'students', label: 'Studenti', icon: '👤', count: students.length },
    { id: 'bonuses', label: 'Bonus', icon: '🎁', count: bonuses.length },
    { id: 'verify', label: 'Verifica', icon: '🔍', alert: discrepancyCount > 0 }
  ];

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Caricamento dati...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {onBack && (
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
            ← Indietro
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-800">📊 Scoreboard Completo</h1>
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
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all relative ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.icon} {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-indigo-500' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            )}
            {tab.alert && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        {/* TEAMS TAB */}
        {activeTab === 'teams' && (
          <div>
            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <div className="flex gap-8 justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{teams.length}</div>
                  <div className="text-sm text-gray-500">Squadre</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{totalCalculated}</div>
                  <div className="text-sm text-gray-500">Punti totali</div>
                </div>
                {discrepancyCount > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{discrepancyCount}</div>
                    <div className="text-sm text-gray-500">Discrepanze</div>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Squadra</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Membri</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Punti Studenti</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Bonus Squadra</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Totale</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Dettagli</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, idx) => (
                    <React.Fragment key={team.id}>
                      <tr className={`border-t hover:bg-gray-50 ${team.has_discrepancy ? 'bg-red-50' : ''}`}>
                        <td className="py-3 px-4">
                          <span 
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold"
                            style={{ backgroundColor: team.color }}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-800">{team.name}</div>
                          {team.has_discrepancy && (
                            <div className="text-xs text-red-600">⚠️ Discrepanza rilevata</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                            {team.member_count} 👤
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600 font-medium">
                          {team.student_points}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {team.team_bonus > 0 ? (
                            <span className="text-emerald-600 font-medium">+{team.team_bonus}</span>
                          ) : team.team_bonus < 0 ? (
                            <span className="text-red-600 font-medium">{team.team_bonus}</span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-2xl font-bold" style={{ color: team.color }}>
                            {team.calculated_total}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                          >
                            {expandedTeam === team.id ? '▲ Chiudi' : '▼ Espandi'}
                          </button>
                        </td>
                      </tr>
                      {expandedTeam === team.id && (
                        <tr>
                          <td colSpan={7} className="bg-gray-50 p-4">
                            <div className="grid grid-cols-2 gap-4">
                              {/* Membri */}
                              <div>
                                <h4 className="font-bold text-gray-700 mb-2">👤 Membri ({team.members.length})</h4>
                                {team.members.length > 0 ? (
                                  <table className="w-full text-sm">
                                    <tbody>
                                      {team.members.map(m => (
                                        <tr key={m.id} className="border-b">
                                          <td className="py-1">{m.name}</td>
                                          <td className="py-1 text-right font-bold text-indigo-600">{m.points}</td>
                                        </tr>
                                      ))}
                                      <tr className="font-bold bg-gray-100">
                                        <td className="py-1">Totale studenti</td>
                                        <td className="py-1 text-right">{team.student_points}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="text-gray-400 italic">Nessun membro</div>
                                )}
                              </div>
                              {/* Bonus squadra */}
                              <div>
                                <h4 className="font-bold text-gray-700 mb-2">🎁 Bonus Squadra ({team.team_bonuses.length})</h4>
                                {team.team_bonuses.length > 0 ? (
                                  <table className="w-full text-sm">
                                    <tbody>
                                      {team.team_bonuses.map(b => (
                                        <tr key={b.id} className="border-b">
                                          <td className="py-1 max-w-xs truncate" title={b.reason}>{b.reason}</td>
                                          <td className="py-1 text-right font-bold text-emerald-600">+{b.points}</td>
                                          <td className="py-1 text-right">
                                            <button
                                              onClick={() => deleteBonus(b.id)}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              🗑️
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                      <tr className="font-bold bg-gray-100">
                                        <td className="py-1">Totale bonus</td>
                                        <td className="py-1 text-right">{team.team_bonus}</td>
                                        <td></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="text-gray-400 italic">Nessun bonus diretto</div>
                                )}
                              </div>
                            </div>
                            {/* Riepilogo calcolo */}
                            <div className="mt-4 p-3 bg-white rounded-lg border">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                  <strong>Calcolo:</strong> {team.student_points} (studenti) + {team.team_bonus} (bonus) = <strong>{team.calculated_total}</strong>
                                </div>
                                {team.has_discrepancy ? (
                                  <div className="text-red-600 font-bold">
                                    ⚠️ Leaderboard mostra: {team.leaderboard_total} (differenza: {team.leaderboard_total - team.calculated_total})
                                  </div>
                                ) : (
                                  <div className="text-emerald-600 font-bold">✅ Corretto</div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Studente</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Squadra</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Punti</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Dettagli</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <React.Fragment key={student.id}>
                    <tr className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-gray-100 text-gray-700' :
                          idx === 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {student.email}
                      </td>
                      <td className="py-3 px-4">
                        {student.team_name ? (
                          <span 
                            className="px-3 py-1 rounded-full text-sm text-white"
                            style={{ backgroundColor: student.team_color || '#6B7280' }}
                          >
                            {student.team_name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Nessuna</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xl font-bold text-indigo-600">
                          {student.total_points}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                        >
                          {expandedStudent === student.id ? '▲' : '▼'} {student.bonuses.length}
                        </button>
                      </td>
                    </tr>
                    {expandedStudent === student.id && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 p-4">
                          <h4 className="font-bold text-gray-700 mb-2">🎁 Bonus assegnati</h4>
                          {student.bonuses.length > 0 ? (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-gray-500">
                                  <th className="text-left py-1">Data</th>
                                  <th className="text-left py-1">Motivo</th>
                                  <th className="text-left py-1">Da</th>
                                  <th className="text-right py-1">Punti</th>
                                  <th className="text-right py-1"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {student.bonuses.map(b => (
                                  <tr key={b.id} className="border-b">
                                    <td className="py-1 text-gray-500">{formatDate(b.assigned_at)}</td>
                                    <td className="py-1">{b.reason}</td>
                                    <td className="py-1">
                                      <span className={`px-2 py-0.5 rounded text-xs ${
                                        b.assigned_by === 'system' ? 'bg-gray-100' : 'bg-blue-100 text-blue-700'
                                      }`}>
                                        {b.assigned_by}
                                      </span>
                                    </td>
                                    <td className={`py-1 text-right font-bold ${b.points >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {b.points > 0 ? '+' : ''}{b.points}
                                    </td>
                                    <td className="py-1 text-right">
                                      <button onClick={() => deleteBonus(b.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="font-bold bg-gray-100">
                                  <td colSpan={3} className="py-1 text-right">Totale:</td>
                                  <td className="py-1 text-right text-indigo-600">{student.total_points}</td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          ) : (
                            <div className="text-gray-400 italic">Nessun bonus</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BONUSES TAB */}
        {activeTab === 'bonuses' && (
          <div>
            {/* Filters */}
            <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="🔍 Cerca per nome o motivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border rounded-lg flex-1 min-w-[200px]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  Tutti
                </button>
                <button
                  onClick={() => setFilterType('student')}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    filterType === 'student' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  👤 Studenti
                </button>
                <button
                  onClick={() => setFilterType('team')}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    filterType === 'team' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  🏆 Squadre
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <div className="flex gap-8 justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {filteredBonuses.length}
                  </div>
                  <div className="text-sm text-gray-500">Bonus totali</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    +{filteredBonuses.filter(b => b.points > 0).reduce((sum, b) => sum + b.points, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Punti assegnati</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredBonuses.filter(b => b.points < 0).reduce((sum, b) => sum + b.points, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Penalità</div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Destinatario</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Motivo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Da</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Punti</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBonuses.map((bonus) => (
                    <tr key={bonus.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(bonus.assigned_at)}
                      </td>
                      <td className="py-3 px-4">
                        {bonus.student_id ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            👤 Studente
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            🏆 Squadra
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {bonus.student_name || bonus.team_name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={bonus.reason}>
                        {bonus.reason}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          bonus.assigned_by === 'system' ? 'bg-gray-100 text-gray-600' :
                          bonus.assigned_by === 'teacher' ? 'bg-blue-100 text-blue-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {bonus.assigned_by}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold text-lg ${
                        bonus.points >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {bonus.points > 0 ? '+' : ''}{bonus.points}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => deleteBonus(bonus.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Elimina bonus"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBonuses.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nessun bonus trovato con i filtri selezionati
                </div>
              )}
            </div>
          </div>
        )}

        {/* VERIFY TAB */}
        {activeTab === 'verify' && (
          <div>
            {/* Summary */}
            <div className={`p-6 ${discrepancyCount > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <div className="flex items-center justify-center gap-4">
                <div className={`text-4xl ${discrepancyCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {discrepancyCount > 0 ? '⚠️' : '✅'}
                </div>
                <div>
                  <div className={`text-xl font-bold ${discrepancyCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {discrepancyCount > 0 
                      ? `${discrepancyCount} squadre con discrepanze`
                      : 'Tutti i punteggi sono corretti!'
                    }
                  </div>
                  <div className="text-gray-600">
                    Totale calcolato: {totalCalculated} | Totale leaderboard: {totalLeaderboard}
                    {totalCalculated !== totalLeaderboard && (
                      <span className="text-red-600 font-bold ml-2">
                        (diff: {totalLeaderboard - totalCalculated})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed verification */}
            <div className="p-4">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Squadra</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Studenti</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Bonus</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Calcolato</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Leaderboard</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id} className={`border-t ${team.has_discrepancy ? 'bg-red-50' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="font-medium">{team.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">{team.student_points}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{team.team_bonus}</td>
                      <td className="py-3 px-4 text-right font-bold">{team.calculated_total}</td>
                      <td className="py-3 px-4 text-right font-bold">{team.leaderboard_total}</td>
                      <td className="py-3 px-4 text-center">
                        {team.has_discrepancy ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                            ❌ {team.leaderboard_total - team.calculated_total > 0 ? '+' : ''}{team.leaderboard_total - team.calculated_total}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                            ✅ OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="py-3 px-4">TOTALE</td>
                    <td className="py-3 px-4 text-right">{teams.reduce((s, t) => s + t.student_points, 0)}</td>
                    <td className="py-3 px-4 text-right">{teams.reduce((s, t) => s + t.team_bonus, 0)}</td>
                    <td className="py-3 px-4 text-right">{totalCalculated}</td>
                    <td className="py-3 px-4 text-right">{totalLeaderboard}</td>
                    <td className="py-3 px-4 text-center">
                      {totalCalculated === totalLeaderboard ? '✅' : '❌'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {discrepancyCount > 0 && (
              <div className="p-4 bg-amber-50 border-t">
                <div className="text-amber-800">
                  <strong>💡 Suggerimento:</strong> Le discrepanze possono essere causate da:
                  <ul className="list-disc ml-6 mt-2">
                    <li>View <code>teams_leaderboard</code> non aggiornata</li>
                    <li>Bonus assegnati a studenti che non sono più nella squadra</li>
                    <li>Cache del database</li>
                  </ul>
                  <div className="mt-2">Prova a cliccare <strong>🔄 Aggiorna</strong> o verifica la view in Supabase.</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
