import { supabase, DbModule } from '@/lib/supabase';
import { ModuleJSON } from '@/types/module';

// Convert ModuleJSON to DbModule format
function toDbModule(module: ModuleJSON): Omit<DbModule, 'created_at' | 'updated_at'> {
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
    slides: dbModule.slides as ModuleJSON['slides'],
  };
}

// Save or update a module
export async function saveModuleToSupabase(module: ModuleJSON): Promise<{ success: boolean; error?: string }> {
  try {
    const dbModule = toDbModule(module);

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

// Get all modules
export async function getModulesFromSupabase(): Promise<ModuleJSON[]> {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('created_at', { ascending: false });

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

// Moduli base (statici) da creare se non esistono
const STATIC_MODULES: ModuleJSON[] = [
  {
    id: 'agrifoodtech',
    titolo: 'Tendenze AgrifoodTech',
    descrizione: 'Panoramica sulle tendenze tecnologiche nel settore agroalimentare',
    durata: '2-3 ore',
    icon: '🌱',
    createdAt: new Date().toISOString(),
    slides: [
      { id: 1, section: 'Introduzione', title: 'Introduzione all\'AgrifoodTech', contenuto: '' },
      { id: 2, section: 'Tecnologie', title: 'Precision Farming', contenuto: '' },
      { id: 3, section: 'Tecnologie', title: 'IoT nell\'Agricoltura', contenuto: '' },
      { id: 4, section: 'Analisi Dati', title: 'Big Data e Analytics', contenuto: '' },
      { id: 5, section: 'Supply Chain', title: 'Blockchain e Tracciabilità', contenuto: '' },
      { id: 6, section: 'Ambiente', title: 'Sostenibilità', contenuto: '' },
      { id: 7, section: 'Processi', title: 'Innovazione nei Processi', contenuto: '' },
      { id: 8, section: 'Esempi', title: 'Case Study', contenuto: '' },
      { id: 9, section: 'Futuro', title: 'Tendenze Future', contenuto: '' },
      { id: 10, section: 'Conclusioni', title: 'Conclusioni', contenuto: '' },
    ],
  },
  {
    id: 'trend-tecnologici',
    titolo: 'Trend Tecnologici 2026+',
    descrizione: 'I trend tecnologici che plasmeranno il futuro del settore agroalimentare',
    durata: '2-3 ore',
    icon: '🚀',
    createdAt: new Date().toISOString(),
    slides: [
      { id: 1, section: 'Introduzione', title: 'Introduzione ai Trend 2026+', contenuto: '' },
      { id: 2, section: 'Intelligenza Artificiale', title: 'AI e Machine Learning', contenuto: '' },
      { id: 3, section: 'Automazione', title: 'Robotica Agricola', contenuto: '' },
      { id: 4, section: 'Nuove Coltivazioni', title: 'Vertical Farming', contenuto: '' },
      { id: 5, section: 'Monitoraggio', title: 'Droni e Monitoraggio', contenuto: '' },
      { id: 6, section: 'Bio', title: 'Biotecnologie', contenuto: '' },
      { id: 7, section: 'Sostenibilità', title: 'Economia Circolare', contenuto: '' },
      { id: 8, section: 'Innovazione', title: 'Food Tech Startup', contenuto: '' },
      { id: 9, section: 'Simulazione', title: 'Digital Twin', contenuto: '' },
      { id: 10, section: 'Packaging', title: 'Smart Packaging', contenuto: '' },
      { id: 11, section: 'Mercati', title: 'Mercati del Futuro', contenuto: '' },
      { id: 12, section: 'Conclusioni', title: 'Conclusioni e Prospettive', contenuto: '' },
    ],
  },
  {
    id: 'blockchain',
    titolo: 'Blockchain per il Food',
    descrizione: 'Come la blockchain sta rivoluzionando la tracciabilità alimentare',
    durata: '1-2 ore',
    icon: '🔗',
    createdAt: new Date().toISOString(),
    slides: [
      { id: 1, section: 'Introduzione', title: 'Cos\'è la Blockchain', contenuto: '' },
      { id: 2, section: 'Applicazioni', title: 'Tracciabilità Alimentare', contenuto: '' },
      { id: 3, section: 'Esempi', title: 'Case Study', contenuto: '' },
    ],
  },
  {
    id: 'sostenibilita',
    titolo: 'Sostenibilità nel Food',
    descrizione: 'Pratiche sostenibili nella filiera agroalimentare',
    durata: '1-2 ore',
    icon: '♻️',
    createdAt: new Date().toISOString(),
    slides: [
      { id: 1, section: 'Introduzione', title: 'Introduzione alla Sostenibilità', contenuto: '' },
      { id: 2, section: 'Ambiente', title: 'Impatto Ambientale', contenuto: '' },
      { id: 3, section: 'Pratiche', title: 'Best Practices', contenuto: '' },
    ],
  },
];

// Inizializza i moduli statici su Supabase (crea solo quelli che non esistono)
export async function initializeStaticModules(): Promise<void> {
  try {
    // Ottieni i moduli esistenti
    const existingModules = await getModulesFromSupabase();
    const existingIds = existingModules.map(m => m.id);

    // Crea solo i moduli che non esistono
    for (const staticModule of STATIC_MODULES) {
      if (!existingIds.includes(staticModule.id)) {
        console.log('Creating static module:', staticModule.id);
        await saveModuleToSupabase(staticModule);
      }
    }
  } catch (err) {
    console.error('Error initializing static modules:', err);
  }
}
