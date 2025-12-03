import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  criteria_type: 'manual' | 'points' | 'modules' | 'quizzes' | 'team' | 'slides';
  criteria_value: number;
  points_reward: number;
  is_active: boolean;
  created_at: string;
  times_awarded?: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  awarded_by: string;
  badge?: Badge;
}

// ============================================
// BADGE CRUD
// ============================================

export async function getBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges_with_counts')
    .select('*')
    .order('criteria_value', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    // Fallback to badges table if view doesn't exist
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('criteria_value', { ascending: true });

    if (fallbackError) {
      console.error('Error fetching badges fallback:', fallbackError);
      return [];
    }
    return fallbackData || [];
  }

  return data || [];
}

export async function getBadge(id: string): Promise<Badge | null> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching badge:', error);
    return null;
  }

  return data;
}

export async function createBadge(badge: Omit<Badge, 'id' | 'created_at' | 'times_awarded'>): Promise<Badge | null> {
  const { data, error } = await supabase
    .from('badges')
    .insert([badge])
    .select()
    .single();

  if (error) {
    console.error('Error creating badge:', error);
    return null;
  }

  return data;
}

export async function updateBadge(id: string, updates: Partial<Badge>): Promise<Badge | null> {
  const { data, error } = await supabase
    .from('badges')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating badge:', error);
    return null;
  }

  return data;
}

export async function deleteBadge(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('badges')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting badge:', error);
    return false;
  }

  return true;
}

// ============================================
// USER BADGES
// ============================================

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }

  return data || [];
}

export async function awardBadge(
  userId: string,
  badgeId: string,
  awardedBy: string = 'system'
): Promise<UserBadge | null> {
  // Check if already awarded
  const { data: existing } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  if (existing) {
    console.log('Badge already awarded to user');
    return null;
  }

  const { data, error } = await supabase
    .from('user_badges')
    .insert([{
      user_id: userId,
      badge_id: badgeId,
      awarded_by: awardedBy
    }])
    .select()
    .single();

  if (error) {
    console.error('Error awarding badge:', error);
    return null;
  }

  // Get badge info for points reward
  const badge = await getBadge(badgeId);
  if (badge && badge.points_reward > 0) {
    // Add bonus points for earning badge
    await supabase
      .from('bonus_points')
      .insert([{
        student_id: userId,
        points: badge.points_reward,
        reason: `Badge ottenuto: ${badge.name}`,
        assigned_by: 'system'
      }]);
  }

  return data;
}

export async function revokeBadge(userId: string, badgeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_badges')
    .delete()
    .eq('user_id', userId)
    .eq('badge_id', badgeId);

  if (error) {
    console.error('Error revoking badge:', error);
    return false;
  }

  return true;
}

// ============================================
// AUTO-AWARD LOGIC
// ============================================

export async function checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
  const awardedBadges: UserBadge[] = [];

  // Get all badges and user stats
  const [badges, userBadges, stats] = await Promise.all([
    getBadges(),
    getUserBadges(userId),
    getUserStats(userId)
  ]);

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    let shouldAward = false;

    switch (badge.criteria_type) {
      case 'points':
        shouldAward = stats.total_points >= badge.criteria_value;
        break;
      case 'modules':
        shouldAward = stats.modules_completed >= badge.criteria_value;
        break;
      case 'quizzes':
        shouldAward = stats.quizzes_correct >= badge.criteria_value;
        break;
      case 'slides':
        shouldAward = stats.slides_viewed >= badge.criteria_value;
        break;
      case 'team':
        shouldAward = stats.has_team;
        break;
      case 'manual':
        // Manual badges are only awarded by admin
        break;
    }

    if (shouldAward) {
      const awarded = await awardBadge(userId, badge.id, 'system');
      if (awarded) {
        awardedBadges.push(awarded);
      }
    }
  }

  return awardedBadges;
}

// ============================================
// USER STATS HELPER
// ============================================

interface UserStats {
  total_points: number;
  modules_completed: number;
  quizzes_correct: number;
  slides_viewed: number;
  badges_earned: number;
  has_team: boolean;
}

async function getUserStats(userId: string): Promise<UserStats> {
  // Get points
  const { data: studentData } = await supabase
    .from('students_leaderboard')
    .select('points, team_id')
    .eq('id', userId)
    .single();

  // Get modules completed
  const { count: modulesCount } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_completed', true);

  // Get correct quizzes
  const { count: quizzesCount } = await supabase
    .from('student_quiz_scores')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', userId)
    .eq('is_correct', true);

  // Get slides viewed (from user_progress completed_slides)
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('completed_slides')
    .eq('user_id', userId);

  let slidesViewed = 0;
  if (progressData) {
    for (const p of progressData) {
      if (p.completed_slides && Array.isArray(p.completed_slides)) {
        slidesViewed += p.completed_slides.length;
      }
    }
  }

  // Get badges count
  const { count: badgesCount } = await supabase
    .from('user_badges')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    total_points: studentData?.points || 0,
    modules_completed: modulesCount || 0,
    quizzes_correct: quizzesCount || 0,
    slides_viewed: slidesViewed,
    badges_earned: badgesCount || 0,
    has_team: !!studentData?.team_id
  };
}

export { getUserStats };
