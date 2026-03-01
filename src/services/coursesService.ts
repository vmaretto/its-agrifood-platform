import { supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface Course {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// COURSES CRUD
// ============================================

// Ottieni tutti i corsi attivi
export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }

  return data || [];
}

// Ottieni un corso per ID
export async function getCourse(id: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    return null;
  }

  return data;
}

// Ottieni un corso per slug
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching course by slug:', error);
    return null;
  }

  return data;
}

// Crea un nuovo corso
export async function createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .insert([course])
    .select()
    .single();

  if (error) {
    console.error('Error creating course:', error);
    return null;
  }

  return data;
}

// Aggiorna un corso
export async function updateCourse(id: string, updates: Partial<Pick<Course, 'name' | 'description' | 'icon' | 'is_active'>>): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating course:', error);
    return null;
  }

  return data;
}
