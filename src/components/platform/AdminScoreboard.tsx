'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type TabType = 'students' | 'teams' | 'bonuses';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  team_id: string | null;
  team_name: string | null;
  team_color: string | null;
  total_points: number;
}

interface Team {
  id: string;
  name: string;
  color: string;
  member_count: number;
  student_points: number;
  team_bonus: number;
  total_points: number;
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
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'student' | 'team'>('all');

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadStudents(), loadTeams(), loadBonuses()]);
    setIsLoading(false);
  };

  const loadStudents = async () => {
    // Carica tutti gli studenti del corso
    let query = supabase
      .from('students')
      .select(`
        id, first_name, last_name, email, team_id,
        teams!left(name, color)
      `);
    
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data: studentsData } = await query;
    if (!studentsData) return;

    // Per ogni studente, calcola i punti totali dai bonus
    const studentsWithPoints: Student[] = [];
    
    for (const student of studentsData) {
      const { data: bonusData } = await supabase
        .from('bonus_points')
        .select('points')
        .eq('student_id', student.id);
      
      const totalPoints = bonusData?.reduce((sum, b) => sum + b.points, 0) || 0;
      
      studentsWithPoints.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        team_id: student.team_id,
        team_name: (student.teams as any)?.name || null,
        team_color: (student.teams as any)?.color || null,
        total_points: totalPoints
      });
    }

    // Ordina per punteggio
    studentsWithPoints.sort((a, b) => b.total_points - a.total_points);
    setStudents(studentsWithPoints);
  };

  const loadTeams = async () => {
    // Carica squadre dalla leaderboard view
    let query = supabase.from('teams_leaderboard').select('*');
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    const { data: leaderboardData } = await query;

    if (!leaderboardData) return;

    // Per ogni squadra, calcola separatamente punti studenti e bonus squadra
    const teamsWithBreakdown: Team[] = [];

    for (const team of leaderboardData) {
      // Bonus direttamente alla squadra
      const { data: teamBonusData } = await supabase
        .from('bonus_points')
        .select('points')
        .eq('team_id', team.id);
      
      const teamBonus = teamBonusData?.reduce((sum, b) => sum + b.points, 0) || 0;

      // Studenti della squadra
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('team_id', team.id);

      let studentPoints = 0;
      if (students && students.length > 0) {
        const studentIds = students.map(s => s.id);
        const { data: studentBonusData } = await supabase
          .from('bonus_points')
          .select('points')
          .in('student_id', studentIds);
        studentPoints = studentBonusData?.reduce((sum, b) => sum + b.points, 0) || 0;
      }

      teamsWithBreakdown.push({
        id: team.id,
        name: team.name,
        color: team.color || '#6B7280',
        member_count: team.member_count || 0,
        student_points: studentPoints,
        team_bonus: teamBonus,
        total_points: studentPoints + teamBonus
      });
    }

    teamsWithBreakdown.sort((a, b) => b.total_points - a.total_points);
    setTeams(teamsWithBreakdown);
  };

  const loadBonuses = async () => {
    // Carica tutti i bonus
    const { data: bonusData } = await supabase
      .from('bonus_points')
      .select('*')
      .order('assigned_at', { ascending: false });

    if (!bonusData) return;

    // Carica nomi studenti e squadre
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

    // Filtra per corso se specificato
    let filteredBonuses = bonusData;
    if (courseId) {
      // Ottieni gli ID studenti del corso
      const { data: courseStudents } = await supabase
        .from('students')
        .select('id')
        .eq('course_id', courseId);
      const courseStudentIds = new Set(courseStudents?.map(s => s.id) || []);

      // Ottieni gli ID squadre del corso
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

  // Filtra bonus
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

  const tabs: { id: TabType; label: string; icon: string; count: number }[] = [
    { id: 'students', label: 'Studenti', icon: '👤', count: students.length },
    { id: 'teams', label: 'Squadre', icon: '🏆', count: teams.length },
    { id: 'bonuses', label: 'Bonus', icon: '🎁', count: bonuses.length }
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
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.icon} {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-indigo-500' : 'bg-gray-100'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id} className="border-t hover:bg-gray-50">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TEAMS TAB */}
        {activeTab === 'teams' && (
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
                </tr>
              </thead>
              <tbody>
                {teams.map((team, idx) => (
                  <tr key={team.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span 
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold"
                        style={{ backgroundColor: team.color }}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-800">
                      {team.name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {team.member_count} 👤
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {team.student_points}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {team.team_bonus > 0 ? (
                        <span className="text-emerald-600 font-medium">+{team.team_bonus}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-2xl font-bold" style={{ color: team.color }}>
                        {team.total_points}
                      </span>
                    </td>
                  </tr>
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Assegnato da</th>
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
      </div>
    </div>
  );
}
