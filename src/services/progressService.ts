import { supabase } from '@/lib/supabase';
import { logSlideViewed, logModuleStarted, logModuleCompleted } from './activitiesService';
import { checkAndAwardBadges } from './badgesService';

// ============================================
// TYPES
// ============================================

export interface ModuleProgress {
  id?: string;
  user_id: string;
  module_id: string;
  current_slide: number;
  completed_slides: number[];
  quiz_scores: Record<string, { score: number; is_correct: boolean }>;
  is_completed: boolean;
  started_at?: string;
  completed_at?: string | null;
  last_accessed_at?: string;
}

export interface UserProgressSummary {
  total_modules: number;
  completed_modules: number;
  total_slides_viewed: number;
  total_quizzes_correct: number;
  overall_progress: number; // percentage
}

// ============================================
// PROGRESS CRUD
// ============================================

export async function getModuleProgress(userId: string, moduleId: string): Promise<ModuleProgress | null> {
  console.log('[getModuleProgress] Fetching for:', { userId, moduleId });

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .maybeSingle(); // Usa maybeSingle invece di single per evitare errori 406

  if (error) {
    console.error('[getModuleProgress] Error:', error);
    // Se è un errore di RLS o altro, ritorna null
    return null;
  }

  console.log('[getModuleProgress] Result:', data);
  return data;
}

export async function initModuleProgress(
  userId: string,
  moduleId: string,
  moduleName: string
): Promise<ModuleProgress | null> {
  console.log('[initModuleProgress] Starting for:', { userId, moduleId, moduleName });

  // Check if progress already exists
  const existing = await getModuleProgress(userId, moduleId);
  if (existing) {
    console.log('[initModuleProgress] Progress exists, updating last_accessed_at');
    // Update last accessed
    await supabase
      .from('user_progress')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('module_id', moduleId);
    return existing;
  }

  console.log('[initModuleProgress] Creating new progress record');

  // Create new progress usando upsert per evitare conflitti
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      module_id: moduleId,
      current_slide: 1,
      completed_slides: [],
      quiz_scores: {},
      is_completed: false,
      started_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,module_id'
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('[initModuleProgress] Error:', error);
    // Prova a recuperare il record esistente se c'è stato un errore
    const retryFetch = await getModuleProgress(userId, moduleId);
    if (retryFetch) {
      console.log('[initModuleProgress] Retrieved existing record after error');
      return retryFetch;
    }
    return null;
  }

  console.log('[initModuleProgress] Created:', data);

  // Log activity solo se è stato creato un nuovo record
  if (data) {
    await logModuleStarted(userId, moduleId, moduleName);
  }

  return data;
}

export async function updateSlidePosition(
  userId: string,
  moduleId: string,
  slideNumber: number,
  moduleName: string = ''
): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .update({
      current_slide: slideNumber,
      last_accessed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('module_id', moduleId);

  if (error) {
    console.error('Error updating slide position:', error);
  }
}

export async function markSlideCompleted(
  userId: string,
  moduleId: string,
  slideNumber: number,
  totalSlides: number,
  moduleName: string
): Promise<boolean> {
  console.log('[markSlideCompleted] Called with:', { userId, moduleId, slideNumber, totalSlides, moduleName });

  // Get current progress
  let progress = await getModuleProgress(userId, moduleId);
  console.log('[markSlideCompleted] Current progress:', progress);

  // Se non esiste il progress, crealo ora
  if (!progress) {
    console.log('[markSlideCompleted] No progress found, creating it now...');
    progress = await initModuleProgress(userId, moduleId, moduleName);

    if (!progress) {
      console.log('[markSlideCompleted] Failed to create progress, using default values');
      // Crea un oggetto di default per continuare
      progress = {
        user_id: userId,
        module_id: moduleId,
        current_slide: 1,
        completed_slides: [],
        quiz_scores: {},
        is_completed: false
      };
    }
  }

  // Se il modulo era già completato, non ritornare true per il modal
  const wasAlreadyCompleted = progress.is_completed;
  console.log('[markSlideCompleted] wasAlreadyCompleted:', wasAlreadyCompleted);

  const completedSlides = progress.completed_slides || [];
  if (!completedSlides.includes(slideNumber)) {
    completedSlides.push(slideNumber);
  }

  // Check if module is completed
  const isCompleted = completedSlides.length >= totalSlides;
  console.log('[markSlideCompleted] Slide tracking:', {
    completedSlidesCount: completedSlides.length,
    totalSlides,
    isCompleted,
    willReturnTrue: isCompleted && !wasAlreadyCompleted
  });

  // Usa upsert invece di update per creare il record se non esiste
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      module_id: moduleId,
      current_slide: slideNumber,
      completed_slides: completedSlides,
      quiz_scores: progress.quiz_scores || {},
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      last_accessed_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,module_id'
    });

  if (error) {
    console.error('[markSlideCompleted] Error upserting progress:', error);
    // Prova comunque a ritornare true se tutte le slide sono state viste
    // (il tracking locale potrebbe essere corretto anche se il salvataggio fallisce)
    return isCompleted && !wasAlreadyCompleted;
  }

  console.log('[markSlideCompleted] Progress saved successfully');

  // Log activity for first time viewing slide
  if (!progress.completed_slides?.includes(slideNumber)) {
    await logSlideViewed(userId, moduleId, moduleName, slideNumber);
  }

  // If module completed for the first time, log and check badges
  if (isCompleted && !wasAlreadyCompleted) {
    await logModuleCompleted(userId, moduleId, moduleName, 50); // 50 points for completing module

    // Add bonus points for module completion
    await supabase
      .from('bonus_points')
      .insert([{
        student_id: userId,
        points: 50,
        reason: `Modulo completato: ${moduleName}`,
        assigned_by: 'system'
      }]);

    // Check for new badges
    await checkAndAwardBadges(userId);
  }

  // Ritorna true solo se il modulo è stato completato per la PRIMA volta
  return isCompleted && !wasAlreadyCompleted;
}

export async function saveQuizProgress(
  userId: string,
  moduleId: string,
  slideId: number,
  score: number,
  isCorrect: boolean
): Promise<void> {
  const progress = await getModuleProgress(userId, moduleId);
  if (!progress) return;

  const quizScores = progress.quiz_scores || {};
  quizScores[slideId.toString()] = { score, is_correct: isCorrect };

  await supabase
    .from('user_progress')
    .update({
      quiz_scores: quizScores,
      last_accessed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('module_id', moduleId);
}

// ============================================
// USER PROGRESS SUMMARY
// ============================================

export async function getUserProgressSummary(userId: string): Promise<UserProgressSummary> {
  // Get all user progress
  const { data: progressData, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user progress summary:', error);
    return {
      total_modules: 0,
      completed_modules: 0,
      total_slides_viewed: 0,
      total_quizzes_correct: 0,
      overall_progress: 0
    };
  }

  // Get total modules
  const { count: totalModules } = await supabase
    .from('modules')
    .select('*', { count: 'exact', head: true });

  const progress = progressData || [];
  const completedModules = progress.filter(p => p.is_completed).length;
  const totalSlidesViewed = progress.reduce((acc, p) => acc + (p.completed_slides?.length || 0), 0);
  const totalQuizzesCorrect = progress.reduce((acc, p) => {
    const scores = p.quiz_scores || {};
    return acc + Object.values(scores).filter((s) => (s as { is_correct: boolean }).is_correct).length;
  }, 0);

  return {
    total_modules: totalModules || 0,
    completed_modules: completedModules,
    total_slides_viewed: totalSlidesViewed,
    total_quizzes_correct: totalQuizzesCorrect,
    overall_progress: totalModules ? Math.round((completedModules / totalModules) * 100) : 0
  };
}

export async function getAllModulesProgress(userId: string): Promise<Record<string, ModuleProgress>> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching all modules progress:', error);
    return {};
  }

  const result: Record<string, ModuleProgress> = {};
  for (const p of (data || [])) {
    result[p.module_id] = p;
  }
  return result;
}

// ============================================
// ADMIN: RESET STATISTICS
// ============================================

export async function resetUserStatistics(userId: string): Promise<boolean> {
  try {
    // Delete user progress
    await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId);

    // Delete quiz scores
    await supabase
      .from('student_quiz_scores')
      .delete()
      .eq('student_id', userId);

    // Delete bonus points
    await supabase
      .from('bonus_points')
      .delete()
      .eq('student_id', userId);

    // Delete user badges
    await supabase
      .from('user_badges')
      .delete()
      .eq('user_id', userId);

    // Delete activity logs
    await supabase
      .from('activity_logs')
      .delete()
      .eq('user_id', userId);

    return true;
  } catch (err) {
    console.error('Error resetting user statistics:', err);
    return false;
  }
}

export async function resetTeamStatistics(teamId: string): Promise<boolean> {
  try {
    // Get all students in team
    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('team_id', teamId);

    if (students) {
      for (const student of students) {
        await resetUserStatistics(student.id);
      }
    }

    // Delete team bonus points
    await supabase
      .from('bonus_points')
      .delete()
      .eq('team_id', teamId);

    // Delete team activity logs
    await supabase
      .from('activity_logs')
      .delete()
      .eq('team_id', teamId);

    return true;
  } catch (err) {
    console.error('Error resetting team statistics:', err);
    return false;
  }
}

export async function resetAllStatistics(): Promise<boolean> {
  try {
    // Delete all progress
    await supabase.from('user_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete all quiz scores
    await supabase.from('student_quiz_scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete all bonus points
    await supabase.from('bonus_points').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete all user badges
    await supabase.from('user_badges').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete all activity logs
    await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete leaderboard history
    await supabase.from('leaderboard_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    return true;
  } catch (err) {
    console.error('Error resetting all statistics:', err);
    return false;
  }
}
