import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface HackathonVote {
  id: string;
  hackathon_id: string;
  team_id: string;
  voter_id: string;
  voter_type: 'teacher' | 'jury' | 'student';
  criterion_id: string;
  score: number; // 1-5 stelle
  created_at?: string;
}

export interface JuryMember {
  id: string;
  hackathon_id: string;
  name: string;
  role: string;
  icon: string;
  added_by: string;
  created_at?: string;
}

export interface TeamVotesSummary {
  team_id: string;
  team_name: string;
  team_color: string;
  jury_total_stars: number;
  jury_votes_count: number;
  peer_total_stars: number;
  peer_votes_count: number;
  total_points: number;
}

// Punti per ogni stella
export const POINTS_PER_STAR = 100;

// Premi per posizione
export const PRIZE_POINTS = {
  1: 2000,
  2: 1000,
  3: 500
};

// ============================================
// VOTES CRUD
// ============================================

// Salva un voto (docente/giurato/studente)
export async function submitVote(
  hackathonId: string,
  teamId: string,
  voterId: string,
  voterType: 'teacher' | 'jury' | 'student',
  criterionId: string,
  score: number
): Promise<HackathonVote | null> {
  // Upsert: se esiste già un voto dallo stesso votante per lo stesso criterio/squadra, aggiorna
  const { data, error } = await supabase
    .from('hackathon_votes')
    .upsert([{
      hackathon_id: hackathonId,
      team_id: teamId,
      voter_id: voterId,
      voter_type: voterType,
      criterion_id: criterionId,
      score
    }], {
      onConflict: 'hackathon_id,team_id,voter_id,criterion_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting vote:', error);
    return null;
  }

  return data;
}

// Salva tutti i voti per una squadra in una sola operazione
export async function submitTeamVotes(
  hackathonId: string,
  teamId: string,
  voterId: string,
  voterType: 'teacher' | 'jury' | 'student',
  votes: { criterionId: string; score: number }[]
): Promise<boolean> {
  const votesToInsert = votes.map(v => ({
    hackathon_id: hackathonId,
    team_id: teamId,
    voter_id: voterId,
    voter_type: voterType,
    criterion_id: v.criterionId,
    score: v.score
  }));

  const { error } = await supabase
    .from('hackathon_votes')
    .upsert(votesToInsert, {
      onConflict: 'hackathon_id,team_id,voter_id,criterion_id'
    });

  if (error) {
    console.error('Error submitting team votes:', error);
    return false;
  }

  return true;
}

// Ottieni i voti di un votante per un hackathon
export async function getVoterVotes(
  hackathonId: string,
  voterId: string
): Promise<HackathonVote[]> {
  const { data, error } = await supabase
    .from('hackathon_votes')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .eq('voter_id', voterId);

  if (error) {
    console.error('Error fetching voter votes:', error);
    return [];
  }

  return data || [];
}

// Controlla se uno studente ha già votato per una squadra
export async function hasStudentVoted(
  hackathonId: string,
  studentId: string
): Promise<{ hasVoted: boolean; votedTeamId: string | null }> {
  const { data, error } = await supabase
    .from('hackathon_votes')
    .select('team_id')
    .eq('hackathon_id', hackathonId)
    .eq('voter_id', studentId)
    .eq('voter_type', 'student')
    .limit(1);

  if (error) {
    console.error('Error checking student vote:', error);
    return { hasVoted: false, votedTeamId: null };
  }

  if (data && data.length > 0) {
    return { hasVoted: true, votedTeamId: data[0].team_id };
  }

  return { hasVoted: false, votedTeamId: null };
}

// Ottieni il riepilogo dei voti per tutte le squadre
export async function getVotesSummary(hackathonId: string): Promise<TeamVotesSummary[]> {
  // Prima ottieni tutte le squadre
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, color')
    .order('name');

  if (teamsError || !teams) {
    console.error('Error fetching teams:', teamsError);
    return [];
  }

  // Poi ottieni tutti i voti per questo hackathon
  const { data: votes, error: votesError } = await supabase
    .from('hackathon_votes')
    .select('*')
    .eq('hackathon_id', hackathonId);

  if (votesError) {
    console.error('Error fetching votes:', votesError);
    return [];
  }

  // Calcola i punteggi per ogni squadra
  return teams.map(team => {
    const teamVotes = (votes || []).filter(v => v.team_id === team.id);

    const juryVotes = teamVotes.filter(v => v.voter_type === 'teacher' || v.voter_type === 'jury');
    const peerVotes = teamVotes.filter(v => v.voter_type === 'student');

    const juryTotalStars = juryVotes.reduce((sum, v) => sum + v.score, 0);
    const peerTotalStars = peerVotes.reduce((sum, v) => sum + v.score, 0);

    // Conta votanti unici per giuria e peer
    const juryVotersCount = new Set(juryVotes.map(v => v.voter_id)).size;
    const peerVotersCount = new Set(peerVotes.map(v => v.voter_id)).size;

    // Calcola punti totali (ogni stella = 100 punti)
    const totalPoints = (juryTotalStars + peerTotalStars) * POINTS_PER_STAR;

    return {
      team_id: team.id,
      team_name: team.name,
      team_color: team.color,
      jury_total_stars: juryTotalStars,
      jury_votes_count: juryVotersCount,
      peer_total_stars: peerTotalStars,
      peer_votes_count: peerVotersCount,
      total_points: totalPoints
    };
  }).sort((a, b) => b.total_points - a.total_points);
}

// ============================================
// JURY MEMBERS CRUD
// ============================================

// Aggiungi un giurato
export async function addJuryMember(
  hackathonId: string,
  name: string,
  role: string,
  icon: string,
  addedBy: string
): Promise<JuryMember | null> {
  const { data, error } = await supabase
    .from('hackathon_jury')
    .insert([{
      hackathon_id: hackathonId,
      name,
      role,
      icon,
      added_by: addedBy
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding jury member:', error);
    return null;
  }

  return data;
}

// Ottieni tutti i giurati per un hackathon
export async function getJuryMembers(hackathonId: string): Promise<JuryMember[]> {
  const { data, error } = await supabase
    .from('hackathon_jury')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching jury members:', error);
    return [];
  }

  return data || [];
}

// Rimuovi un giurato
export async function removeJuryMember(juryMemberId: string): Promise<boolean> {
  const { error } = await supabase
    .from('hackathon_jury')
    .delete()
    .eq('id', juryMemberId);

  if (error) {
    console.error('Error removing jury member:', error);
    return false;
  }

  return true;
}

// ============================================
// PRIZE ASSIGNMENT
// ============================================

// Assegna i premi finali alle squadre (solo docente)
export async function assignPrizes(
  hackathonId: string,
  rankings: { teamId: string; position: number }[]
): Promise<boolean> {
  // Assegna bonus points per ogni posizione
  for (const ranking of rankings) {
    const prizePoints = PRIZE_POINTS[ranking.position as keyof typeof PRIZE_POINTS] || 0;

    if (prizePoints > 0) {
      const { error } = await supabase
        .from('bonus_points')
        .insert([{
          team_id: ranking.teamId,
          student_id: null,
          points: prizePoints,
          reason: `Hackathon - ${ranking.position}° classificato`
        }]);

      if (error) {
        console.error('Error assigning prize:', error);
        return false;
      }
    }
  }

  return true;
}

// ============================================
// UTILITY
// ============================================

// Calcola la classifica finale
export async function getFinalRankings(hackathonId: string): Promise<TeamVotesSummary[]> {
  const summary = await getVotesSummary(hackathonId);
  return summary.sort((a, b) => b.total_points - a.total_points);
}
