import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface Team {
  id: string;
  name: string;
  color: string;
  points?: number;
  member_count?: number;
  created_at?: string;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  team_id: string | null;
  team_name?: string;
  team_color?: string;
  points?: number;
  created_at?: string;
}

export interface BonusPoint {
  id: string;
  student_id: string | null;
  team_id: string | null;
  points: number;
  reason: string | null;
  assigned_by: string;
  assigned_at: string;
}

export interface QuizScore {
  id: string;
  student_id: string;
  module_id: string;
  slide_id: number;
  score: number;
  is_correct: boolean;
  answered_at: string;
}

// ============================================
// TEAMS CRUD
// ============================================

export async function getTeams(): Promise<Team[]> {
  // Usa la view per avere i punti calcolati
  const { data, error } = await supabase
    .from('teams_leaderboard')
    .select('*')
    .order('points', { ascending: false });

  if (error) {
    console.error('Error fetching teams:', error);
    // Fallback alla tabella base
    const { data: baseData } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: true });
    return (baseData || []).map(t => ({ ...t, points: 0, member_count: 0 }));
  }

  return data || [];
}

export async function getTeam(id: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams_leaderboard')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching team:', error);
    return null;
  }

  return data;
}

export async function createTeam(team: Omit<Team, 'id' | 'points' | 'member_count' | 'created_at'>): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .insert([{ name: team.name, color: team.color }])
    .select()
    .single();

  if (error) {
    console.error('Error creating team:', error);
    return null;
  }

  return { ...data, points: 0, member_count: 0 };
}

export async function updateTeam(id: string, updates: Partial<Pick<Team, 'name' | 'color'>>): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating team:', error);
    return null;
  }

  return data;
}

export async function deleteTeam(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting team:', error);
    return false;
  }

  return true;
}

// ============================================
// STUDENTS CRUD
// ============================================

export async function getStudents(): Promise<Student[]> {
  // Usa la view per avere i punti calcolati
  const { data, error } = await supabase
    .from('students_leaderboard')
    .select('*')
    .order('points', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
    // Fallback alla tabella base con join
    const { data: baseData } = await supabase
      .from('students')
      .select(`
        *,
        teams (name, color)
      `)
      .order('last_name', { ascending: true });

    return (baseData || []).map(s => ({
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      team_id: s.team_id,
      team_name: s.teams?.name,
      team_color: s.teams?.color,
      points: 0
    }));
  }

  return data || [];
}

export async function getStudentsByTeam(teamId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students_leaderboard')
    .select('*')
    .eq('team_id', teamId)
    .order('points', { ascending: false });

  if (error) {
    console.error('Error fetching students by team:', error);
    return [];
  }

  return data || [];
}

export async function getStudent(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students_leaderboard')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching student:', error);
    return null;
  }

  return data;
}

export async function createStudent(student: Omit<Student, 'id' | 'points' | 'team_name' | 'team_color' | 'created_at'>): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .insert([{
      first_name: student.first_name,
      last_name: student.last_name,
      team_id: student.team_id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating student:', error);
    return null;
  }

  return { ...data, points: 0 };
}

export async function updateStudent(id: string, updates: Partial<Pick<Student, 'first_name' | 'last_name' | 'team_id'>>): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating student:', error);
    return null;
  }

  return data;
}

export async function deleteStudent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting student:', error);
    return false;
  }

  return true;
}

// Promuove/degrada un utente (solo per admin)
export async function updateUserRole(id: string, role: 'student' | 'teacher' | 'admin'): Promise<boolean> {
  const { error } = await supabase
    .from('students')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating user role:', error);
    return false;
  }

  return true;
}

// ============================================
// BONUS POINTS
// ============================================

export async function addBonusToStudent(studentId: string, points: number, reason?: string): Promise<BonusPoint | null> {
  const { data, error } = await supabase
    .from('bonus_points')
    .insert([{
      student_id: studentId,
      team_id: null,
      points,
      reason: reason || null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding bonus to student:', error);
    return null;
  }

  return data;
}

export async function addBonusToTeam(teamId: string, points: number, reason?: string): Promise<BonusPoint | null> {
  const { data, error } = await supabase
    .from('bonus_points')
    .insert([{
      student_id: null,
      team_id: teamId,
      points,
      reason: reason || null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding bonus to team:', error);
    return null;
  }

  return data;
}

export async function getBonusHistory(studentId?: string, teamId?: string): Promise<BonusPoint[]> {
  let query = supabase
    .from('bonus_points')
    .select('*')
    .order('assigned_at', { ascending: false });

  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  if (teamId) {
    query = query.eq('team_id', teamId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching bonus history:', error);
    return [];
  }

  return data || [];
}

export async function deleteBonus(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('bonus_points')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting bonus:', error);
    return false;
  }

  return true;
}

// ============================================
// QUIZ SCORES
// ============================================

export async function saveQuizAnswer(
  studentId: string,
  moduleId: string,
  slideId: number,
  isCorrect: boolean,
  pointsEarned: number = 10
): Promise<QuizScore | null> {
  const { data, error } = await supabase
    .from('student_quiz_scores')
    .upsert([{
      student_id: studentId,
      module_id: moduleId,
      slide_id: slideId,
      score: isCorrect ? pointsEarned : 0,
      is_correct: isCorrect
    }], {
      onConflict: 'student_id,module_id,slide_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving quiz answer:', error);
    return null;
  }

  return data;
}

export async function getStudentQuizScores(studentId: string): Promise<QuizScore[]> {
  const { data, error } = await supabase
    .from('student_quiz_scores')
    .select('*')
    .eq('student_id', studentId)
    .order('answered_at', { ascending: false });

  if (error) {
    console.error('Error fetching quiz scores:', error);
    return [];
  }

  return data || [];
}

// ============================================
// UTILITY
// ============================================

export async function getTeamWithStudents(teamId: string): Promise<{ team: Team; students: Student[] } | null> {
  const team = await getTeam(teamId);
  if (!team) return null;

  const students = await getStudentsByTeam(teamId);

  return { team, students };
}

export async function moveStudentToTeam(studentId: string, newTeamId: string | null): Promise<boolean> {
  const result = await updateStudent(studentId, { team_id: newTeamId });
  return result !== null;
}
