import { supabase, DbUserProgress } from '@/lib/supabase';

export interface ProgressData {
  currentSlide: number;
  completedSlides: number[];
  quizScores: Record<string, number>;
  completed: boolean;
}

// Save or update user progress for a module
export async function saveProgress(
  userId: string,
  moduleId: string,
  data: Partial<ProgressData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        current_slide: data.currentSlide,
        completed_slides: data.completedSlides,
        quiz_scores: data.quizScores,
        completed: data.completed,
        completed_at: data.completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,module_id',
      });

    if (error) {
      console.error('Error saving progress:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error saving progress:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Get user progress for a specific module
export async function getProgress(
  userId: string,
  moduleId: string
): Promise<ProgressData | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - not an error, just no progress yet
        return null;
      }
      console.error('Error fetching progress:', error);
      return null;
    }

    return {
      currentSlide: data.current_slide,
      completedSlides: data.completed_slides || [],
      quizScores: data.quiz_scores || {},
      completed: data.completed,
    };
  } catch (err) {
    console.error('Error fetching progress:', err);
    return null;
  }
}

// Get all progress for a user
export async function getUserProgress(userId: string): Promise<DbUserProgress[]> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching user progress:', err);
    return [];
  }
}

// Mark a module as complete
export async function markModuleComplete(
  userId: string,
  moduleId: string
): Promise<{ success: boolean; error?: string }> {
  return saveProgress(userId, moduleId, {
    completed: true,
  });
}

// Update current slide position
export async function updateSlidePosition(
  userId: string,
  moduleId: string,
  slideIndex: number
): Promise<{ success: boolean; error?: string }> {
  return saveProgress(userId, moduleId, {
    currentSlide: slideIndex,
  });
}

// Save quiz score
export async function saveQuizScore(
  userId: string,
  moduleId: string,
  quizId: string,
  score: number
): Promise<{ success: boolean; error?: string }> {
  // First get existing scores
  const progress = await getProgress(userId, moduleId);
  const existingScores = progress?.quizScores || {};

  return saveProgress(userId, moduleId, {
    quizScores: {
      ...existingScores,
      [quizId]: score,
    },
  });
}
