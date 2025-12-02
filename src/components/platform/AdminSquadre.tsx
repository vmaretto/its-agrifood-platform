'use client';

import React, { useState, useEffect } from 'react';
import {
  Team,
  Student,
  getTeams,
  getStudentsByTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  createStudent,
  updateStudent,
  deleteStudent,
  addBonusToStudent,
  addBonusToTeam,
  getStudents,
  moveStudentToTeam
} from '@/services/teamsService';

// ============================================
// MODAL COMPONENTS
// ============================================

interface TeamModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (team: Omit<Team, 'id' | 'points' | 'member_count' | 'created_at'>) => void;
}

const TeamModal: React.FC<TeamModalProps> = ({ team, isOpen, onClose, onSave }) => {
  const [name, setName] = useState(team?.name || '');
  const [color, setColor] = useState(team?.color || 'bg-emerald-500');

  useEffect(() => {
    setName(team?.name || '');
    setColor(team?.color || 'bg-emerald-500');
  }, [team, isOpen]);

  if (!isOpen) return null;

  const colors = [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500',
    'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {team ? 'Modifica Squadra' : 'Nuova Squadra'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nome Squadra</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Es. AgriTech Pioneers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Colore</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full ${c} ${color === c ? 'ring-4 ring-offset-2 ring-gray-400' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onSave({ name: name.trim(), color });
                onClose();
              }
            }}
            disabled={!name.trim()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {team ? 'Salva' : 'Crea'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface StudentModalProps {
  student: Student | null;
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: { first_name: string; last_name: string; team_id: string | null }) => void;
}

const StudentModal: React.FC<StudentModalProps> = ({ student, teams, isOpen, onClose, onSave }) => {
  const [firstName, setFirstName] = useState(student?.first_name || '');
  const [lastName, setLastName] = useState(student?.last_name || '');
  const [teamId, setTeamId] = useState<string | null>(student?.team_id || null);

  useEffect(() => {
    setFirstName(student?.first_name || '');
    setLastName(student?.last_name || '');
    setTeamId(student?.team_id || null);
  }, [student, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {student ? 'Modifica Studente' : 'Nuovo Studente'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nome</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Es. Marco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cognome</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Es. Rossi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Squadra</label>
            <select
              value={teamId || ''}
              onChange={(e) => setTeamId(e.target.value || null)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Nessuna squadra</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={() => {
              if (firstName.trim() && lastName.trim()) {
                onSave({ first_name: firstName.trim(), last_name: lastName.trim(), team_id: teamId });
                onClose();
              }
            }}
            disabled={!firstName.trim() || !lastName.trim()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {student ? 'Salva' : 'Crea'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface BonusModalProps {
  target: { type: 'student' | 'team'; id: string; name: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (points: number, reason: string) => void;
}

const BonusModal: React.FC<BonusModalProps> = ({ target, isOpen, onClose, onSave }) => {
  const [points, setPoints] = useState(10);
  const [reason, setReason] = useState('');

  useEffect(() => {
    setPoints(10);
    setReason('');
  }, [isOpen]);

  if (!isOpen || !target) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Assegna Bonus a {target.name}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Punti</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              min="-100"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">Usa valori negativi per togliere punti</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Motivazione (opzionale)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows={2}
              placeholder="Es. Ottima partecipazione al progetto..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={() => {
              onSave(points, reason);
              onClose();
            }}
            disabled={points === 0}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            Assegna Bonus
          </button>
        </div>
      </div>
    </div>
  );
};

interface TeamDetailModalProps {
  team: Team | null;
  students: Student[];
  allTeams: Team[];
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onBonusStudent: (student: Student) => void;
  onBonusTeam: () => void;
  onMoveStudent: (student: Student, newTeamId: string | null) => void;
}

const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  team,
  students,
  allTeams,
  isOpen,
  onClose,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onBonusStudent,
  onBonusTeam,
  onMoveStudent
}) => {
  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${team.color} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{team.name}</h2>
              <p className="opacity-80">{students.length} membri</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{team.points || 0} pt</div>
              <button
                onClick={onBonusTeam}
                className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                + Bonus Squadra
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Studenti</h3>
            <button
              onClick={onAddStudent}
              className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              + Aggiungi Studente
            </button>
          </div>

          {students.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessuno studente in questa squadra</p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {student.first_name[0]}{student.last_name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{student.points || 0} punti</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Move to another team */}
                    <select
                      value={student.team_id || ''}
                      onChange={(e) => onMoveStudent(student, e.target.value || null)}
                      className="text-xs px-2 py-1 border rounded-lg bg-white"
                      title="Sposta in altra squadra"
                    >
                      <option value="">Nessuna</option>
                      {allTeams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => onBonusStudent(student)}
                      className="px-2 py-1 text-amber-600 hover:bg-amber-50 rounded text-sm"
                      title="Assegna bonus"
                    >
                      +Bonus
                    </button>
                    <button
                      onClick={() => onEditStudent(student)}
                      className="px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded text-sm"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => onDeleteStudent(student)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AdminSquadre: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedTeamStudents, setSelectedTeamStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusTarget, setBonusTarget] = useState<{ type: 'student' | 'team'; id: string; name: string } | null>(null);
  const [showTeamDetail, setShowTeamDetail] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [preselectedTeamId, setPreselectedTeamId] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [teamsData, studentsData] = await Promise.all([
        getTeams(),
        getStudents()
      ]);
      setTeams(teamsData);
      setAllStudents(studentsData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setIsLoading(false);
  };

  const loadTeamStudents = async (teamId: string) => {
    const students = await getStudentsByTeam(teamId);
    setSelectedTeamStudents(students);
  };

  // Team handlers
  const handleCreateTeam = () => {
    setEditingTeam(null);
    setShowTeamModal(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setShowTeamModal(true);
  };

  const handleSaveTeam = async (teamData: Omit<Team, 'id' | 'points' | 'member_count' | 'created_at'>) => {
    setIsSaving(true);
    if (editingTeam) {
      await updateTeam(editingTeam.id, teamData);
    } else {
      await createTeam(teamData);
    }
    await loadData();
    setIsSaving(false);
  };

  const handleDeleteTeam = async (team: Team) => {
    if (confirm(`Sei sicuro di voler eliminare la squadra "${team.name}"? Gli studenti rimarranno senza squadra.`)) {
      setIsSaving(true);
      await deleteTeam(team.id);
      await loadData();
      setIsSaving(false);
    }
  };

  const handleShowTeamDetail = async (team: Team) => {
    setSelectedTeam(team);
    await loadTeamStudents(team.id);
    setShowTeamDetail(true);
  };

  // Student handlers
  const handleCreateStudent = (teamId?: string) => {
    setEditingStudent(null);
    setPreselectedTeamId(teamId || null);
    setShowStudentModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setPreselectedTeamId(student.team_id);
    setShowStudentModal(true);
  };

  const handleSaveStudent = async (studentData: { first_name: string; last_name: string; team_id: string | null }) => {
    setIsSaving(true);
    if (editingStudent) {
      await updateStudent(editingStudent.id, studentData);
    } else {
      await createStudent(studentData);
    }
    await loadData();
    if (selectedTeam) {
      await loadTeamStudents(selectedTeam.id);
    }
    setIsSaving(false);
  };

  const handleDeleteStudent = async (student: Student) => {
    if (confirm(`Sei sicuro di voler eliminare "${student.first_name} ${student.last_name}"?`)) {
      setIsSaving(true);
      await deleteStudent(student.id);
      await loadData();
      if (selectedTeam) {
        await loadTeamStudents(selectedTeam.id);
      }
      setIsSaving(false);
    }
  };

  const handleMoveStudent = async (student: Student, newTeamId: string | null) => {
    setIsSaving(true);
    await moveStudentToTeam(student.id, newTeamId);
    await loadData();
    if (selectedTeam) {
      await loadTeamStudents(selectedTeam.id);
    }
    setIsSaving(false);
  };

  // Bonus handlers
  const handleBonusStudent = (student: Student) => {
    setBonusTarget({ type: 'student', id: student.id, name: `${student.first_name} ${student.last_name}` });
    setShowBonusModal(true);
  };

  const handleBonusTeam = (team: Team) => {
    setBonusTarget({ type: 'team', id: team.id, name: team.name });
    setShowBonusModal(true);
  };

  const handleSaveBonus = async (points: number, reason: string) => {
    if (!bonusTarget) return;
    setIsSaving(true);
    if (bonusTarget.type === 'student') {
      await addBonusToStudent(bonusTarget.id, points, reason);
    } else {
      await addBonusToTeam(bonusTarget.id, points, reason);
    }
    await loadData();
    if (selectedTeam) {
      await loadTeamStudents(selectedTeam.id);
    }
    setIsSaving(false);
  };

  // Calculate totals
  const totalStudents = allStudents.length;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="text-2xl mb-2">Caricamento...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestione Squadre</h1>
          <p className="text-gray-500">
            {teams.length} squadre • {totalStudents} studenti totali
            {isSaving && <span className="ml-2 text-emerald-600">Salvataggio...</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleCreateStudent()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
          >
            + Nuovo Studente
          </button>
          <button
            onClick={handleCreateTeam}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            + Nuova Squadra
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-gray-500 mb-4">Nessuna squadra creata</p>
          <button
            onClick={handleCreateTeam}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Crea la prima squadra
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {teams.map((team) => {
            const teamStudents = allStudents.filter(s => s.team_id === team.id);
            return (
              <div key={team.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className={`${team.color} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-lg">{team.name}</div>
                    <div className="text-2xl font-bold">{team.points || 0} pt</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-500 mb-3">Membri ({teamStudents.length})</div>
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {teamStudents.slice(0, 6).map((student) => (
                      <span key={student.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        {student.first_name} {student.last_name[0]}.
                      </span>
                    ))}
                    {teamStudents.length > 6 && (
                      <span className="px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-600">
                        +{teamStudents.length - 6} altri
                      </span>
                    )}
                    {teamStudents.length === 0 && (
                      <span className="text-gray-400 text-sm">Nessun membro</span>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                    <button
                      onClick={() => handleBonusTeam(team)}
                      className="px-3 py-1 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      +Bonus
                    </button>
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleShowTeamDetail(team)}
                      className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Dettagli
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Studenti senza squadra */}
      {allStudents.filter(s => !s.team_id).length > 0 && (
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Studenti senza squadra</h3>
          <div className="flex flex-wrap gap-3">
            {allStudents.filter(s => !s.team_id).map((student) => (
              <div key={student.id} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <span className="text-gray-700">{student.first_name} {student.last_name}</span>
                <span className="text-xs text-gray-500">({student.points || 0} pt)</span>
                <select
                  value=""
                  onChange={(e) => handleMoveStudent(student, e.target.value)}
                  className="text-xs px-2 py-1 border rounded bg-white ml-2"
                >
                  <option value="">Assegna a...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <TeamModal
        team={editingTeam}
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        onSave={handleSaveTeam}
      />

      <StudentModal
        student={editingStudent ? { ...editingStudent, team_id: preselectedTeamId } : null}
        teams={teams}
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onSave={handleSaveStudent}
      />

      <BonusModal
        target={bonusTarget}
        isOpen={showBonusModal}
        onClose={() => setShowBonusModal(false)}
        onSave={handleSaveBonus}
      />

      <TeamDetailModal
        team={selectedTeam}
        students={selectedTeamStudents}
        allTeams={teams}
        isOpen={showTeamDetail}
        onClose={() => setShowTeamDetail(false)}
        onAddStudent={() => {
          if (selectedTeam) {
            handleCreateStudent(selectedTeam.id);
          }
        }}
        onEditStudent={handleEditStudent}
        onDeleteStudent={handleDeleteStudent}
        onBonusStudent={handleBonusStudent}
        onBonusTeam={() => selectedTeam && handleBonusTeam(selectedTeam)}
        onMoveStudent={handleMoveStudent}
      />
    </div>
  );
};

export default AdminSquadre;
