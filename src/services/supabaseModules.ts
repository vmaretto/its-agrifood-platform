import { supabase, DbModule } from '@/lib/supabase';
import { ModuleJSON } from '@/types/module';

// Convert ModuleJSON to DbModule format
function toDbModule(module: ModuleJSON, courseId?: string): Omit<DbModule, 'created_at' | 'updated_at'> {
  return {
    id: module.id,
    title: module.titolo,
    description: module.descrizione,
    duration: module.durata,
    icon: module.icon,
    slides: module.slides,
    is_published: true,
    is_static: false,
    created_by: undefined,
    course_id: courseId || module.courseId,
    section: module.section,
  };
}

// Convert DbModule to ModuleJSON format
function toModuleJSON(dbModule: DbModule): ModuleJSON {
  return {
    id: dbModule.id,
    titolo: dbModule.title,
    descrizione: dbModule.description || '',
    durata: dbModule.duration || '',
    icon: dbModule.icon || '',
    createdAt: dbModule.created_at,
    courseId: dbModule.course_id,
    section: dbModule.section,
    slides: dbModule.slides as ModuleJSON['slides'],
  };
}

// Save or update a module
export async function saveModuleToSupabase(module: ModuleJSON, courseId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const dbModule = toDbModule(module, courseId);

    const { error } = await supabase
      .from('modules')
      .upsert({
        ...dbModule,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error('Error saving module:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error saving module:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Get all modules (optionally filtered by course)
export async function getModulesFromSupabase(courseId?: string): Promise<ModuleJSON[]> {
  try {
    let query = supabase
      .from('modules')
      .select('*')
      .order('created_at', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching modules:', error);
      return [];
    }

    return (data || []).map(toModuleJSON);
  } catch (err) {
    console.error('Error fetching modules:', err);
    return [];
  }
}

// Get a single module by ID
export async function getModuleFromSupabase(id: string): Promise<ModuleJSON | null> {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching module:', error);
      return null;
    }

    return data ? toModuleJSON(data) : null;
  } catch (err) {
    console.error('Error fetching module:', err);
    return null;
  }
}

// Delete a module
export async function deleteModuleFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting module:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error deleting module:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
