import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface HackathonConfig {
  id: string;
  course_id: string;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// CONFIG CRUD
// ============================================

// Ottieni la configurazione hackathon per un corso
export async function getHackathonConfig(courseId: string): Promise<HackathonConfig | null> {
  const { data, error } = await supabase
    .from('hackathon_config')
    .select('*')
    .eq('course_id', courseId)
    .single();

  if (error) {
    console.error('Error fetching hackathon config:', error);
    return null;
  }

  return data;
}

// Crea o aggiorna la configurazione hackathon
export async function upsertHackathonConfig(
  courseId: string,
  startTime: string,
  endTime: string,
  isActive: boolean = true
): Promise<HackathonConfig | null> {
  // Prima prova a trovare una config esistente
  const existing = await getHackathonConfig(courseId);

  if (existing) {
    // Aggiorna
    const { data, error } = await supabase
      .from('hackathon_config')
      .update({
        start_time: startTime,
        end_time: endTime,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating hackathon config:', error);
      return null;
    }

    return data;
  } else {
    // Crea nuova
    const { data, error } = await supabase
      .from('hackathon_config')
      .insert([{
        course_id: courseId,
        start_time: startTime,
        end_time: endTime,
        is_active: isActive
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating hackathon config:', error);
      return null;
    }

    return data;
  }
}

// Attiva/disattiva countdown
export async function toggleHackathonActive(courseId: string, isActive: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('hackathon_config')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('course_id', courseId);

  if (error) {
    console.error('Error toggling hackathon active:', error);
    return false;
  }

  return true;
}
