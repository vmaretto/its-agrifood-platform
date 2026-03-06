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

interface AdminPunteggiProps {
  courseId?: string;
  onBack?: () => void;
}

export default function AdminPunteggi({ courseId, onBack }: AdminPunteggiProps) {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<TeamSummary | null>(null);
  const [duplicates, setDuplicates] = useState<BonusDetail[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        total_points: team.points || 0, // Usa il punteggio dalla view!
        member_count: team.member_count || 0,
        bonuses: allBonuses
      });
    }

    // Ordina per punteggio
    teamSummaries.sort((a, b) => b.total_points - a.total_points);
    setTeams(teamSummaries);

    // Trova duplicati globali
    await findDuplicates();

    setIsLoading(false);
  };

  const findDuplicates = async () => {
    const { data } = await supabase
      .from('bonus_points')
      .select('*')
      .like('reason', 'Modulo completato:%')
      .order('student_id')
      .order('reason')
      .order('assigned_at');

    if (!data) return;

    // Trova duplicati (stesso student_id + reason)
    const seen = new Map<string, BonusDetail>();
    const dups: BonusDetail[] = [];

    for (const bonus of data) {
      const key = `${bonus.student_id}-${bonus.reason}`;
      if (seen.has(key)) {
        dups.push(bonus);
      } else {
        seen.set(key, bonus);
      }
    }

    setDuplicates(dups);
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

  const deleteDuplicates = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${duplicates.length} bonus duplicati?`)) return;

    for (const dup of duplicates) {
      await supabase.from('bonus_points').delete().eq('id', dup.id);
    }

    setMessage({ type: 'success', text: `${duplicates.length} duplicati eliminati!` });
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

      {/* Duplicates Warning */}
      {duplicates.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-amber-800">⚠️ Trovati {duplicates.length} bonus duplicati</div>
              <div className="text-sm text-amber-600">
                Bonus "Modulo completato" assegnati più volte allo stesso studente
              </div>
            </div>
            <button
              onClick={deleteDuplicates}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
            >
              Elimina Duplicati
            </button>
          </div>
        </div>
      )}

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
  );
}
