import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export type ActionType =
  | 'quiz_completed'
  | 'quiz_correct'
  | 'module_started'
  | 'module_completed'
  | 'slide_viewed'
  | 'badge_earned'
  | 'bonus_received'
  | 'team_joined'
  | 'points_earned';

export type TargetType = 'module' | 'slide' | 'quiz' | 'badge' | 'team' | 'bonus';

export interface Activity {
  id: string;
  user_id: string | null;
  team_id: string | null;
  action_type: ActionType;
  target_type: TargetType | null;
  target_id: string | null;
  target_name: string | null;
  points_earned: number;
  details: Record<string, unknown> | null;
  created_at: string;
  // Joined fields
  first_name?: string;
  last_name?: string;
  team_name?: string;
  team_color?: string;
}

// ============================================
// LOG ACTIVITY
// ============================================

export async function logActivity(
  userId: string | null,
  actionType: ActionType,
  targetType: TargetType | null = null,
  targetId: string | null = null,
  targetName: string | null = null,
  pointsEarned: number = 0,
  details: Record<string, unknown> | null = null
): Promise<Activity | null> {
  // Get team_id from user if userId provided
  let teamId: string | null = null;
  if (userId) {
    const { data: student } = await supabase
      .from('students')
      .select('team_id')
      .eq('id', userId)
      .single();
    teamId = student?.team_id || null;
  }

  const { data, error } = await supabase
    .from('activity_logs')
    .insert([{
      user_id: userId,
      team_id: teamId,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      points_earned: pointsEarned,
      details
    }])
    .select()
    .single();

  if (error) {
    console.error('Error logging activity:', error);
    return null;
  }

  return data;
}

// ============================================
// GET ACTIVITIES
// ============================================

export async function getRecentActivities(limit: number = 20): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('recent_activities')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activities:', error);
    // Fallback to direct query
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('activity_logs')
      .select(`
        *,
        student:students(first_name, last_name, team_id, teams(name, color))
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fallbackError) {
      console.error('Error fetching activities fallback:', fallbackError);
      return [];
    }

    // Transform fallback data
    return (fallbackData || []).map(a => ({
      ...a,
      first_name: a.student?.first_name,
      last_name: a.student?.last_name,
      team_name: a.student?.teams?.name,
      team_color: a.student?.teams?.color
    }));
  }

  return data || [];
}

export async function getUserActivities(userId: string, limit: number = 10): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }

  return data || [];
}

export async function getTeamActivities(teamId: string, limit: number = 20): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      student:students(first_name, last_name)
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching team activities:', error);
    return [];
  }

  return (data || []).map(a => ({
    ...a,
    first_name: a.student?.first_name,
    last_name: a.student?.last_name
  }));
}

// ============================================
// HELPER: Format relative time
// ============================================

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'ora';
  } else if (diffMin < 60) {
    return `${diffMin} min fa`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'ora' : 'ore'} fa`;
  } else if (diffDay < 7) {
    return `${diffDay} ${diffDay === 1 ? 'giorno' : 'giorni'} fa`;
  } else {
    return date.toLocaleDateString('it-IT');
  }
}

// ============================================
// HELPER: Get action description in Italian
// ============================================

export function getActionDescription(activity: Activity): string {
  const name = activity.first_name
    ? `${activity.first_name} ${activity.last_name || ''}`
    : 'Utente';

  switch (activity.action_type) {
    case 'quiz_completed':
      return `${name} ha completato un quiz`;
    case 'quiz_correct':
      return `${name} ha risposto correttamente`;
    case 'module_started':
      return `${name} ha iniziato`;
    case 'module_completed':
      return `${name} ha completato`;
    case 'slide_viewed':
      return `${name} ha visualizzato`;
    case 'badge_earned':
      return `${name} ha ottenuto`;
    case 'bonus_received':
      return `${name} ha ricevuto bonus`;
    case 'team_joined':
      return `${name} è entrato in`;
    case 'points_earned':
      return `${name} ha guadagnato`;
    default:
      return name;
  }
}

// ============================================
// CONVENIENCE LOGGING FUNCTIONS
// ============================================

export async function logQuizCompleted(
  userId: string,
  moduleId: string,
  moduleName: string,
  slideId: number,
  isCorrect: boolean,
  points: number
): Promise<void> {
  await logActivity(
    userId,
    isCorrect ? 'quiz_correct' : 'quiz_completed',
    'quiz',
    `${moduleId}-${slideId}`,
    moduleName,
    points,
    { slide_id: slideId, is_correct: isCorrect }
  );
}

export async function logModuleStarted(
  userId: string,
  moduleId: string,
  moduleName: string
): Promise<void> {
  await logActivity(
    userId,
    'module_started',
    'module',
    moduleId,
    moduleName
  );
}

export async function logModuleCompleted(
  userId: string,
  moduleId: string,
  moduleName: string,
  points: number = 0
): Promise<void> {
  await logActivity(
    userId,
    'module_completed',
    'module',
    moduleId,
    moduleName,
    points
  );
}

export async function logSlideViewed(
  userId: string,
  moduleId: string,
  moduleName: string,
  slideId: number
): Promise<void> {
  await logActivity(
    userId,
    'slide_viewed',
    'slide',
    `${moduleId}-${slideId}`,
    `${moduleName} - Slide ${slideId}`,
    0,
    { slide_id: slideId }
  );
}

export async function logBadgeEarned(
  userId: string,
  badgeId: string,
  badgeName: string,
  points: number
): Promise<void> {
  await logActivity(
    userId,
    'badge_earned',
    'badge',
    badgeId,
    badgeName,
    points
  );
}

export async function logTeamJoined(
  userId: string,
  teamId: string,
  teamName: string
): Promise<void> {
  await logActivity(
    userId,
    'team_joined',
    'team',
    teamId,
    teamName
  );
}
