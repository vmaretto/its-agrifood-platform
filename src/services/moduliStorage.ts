// Storage per i moduli generati - Usa Supabase con fallback a localStorage

import { ModuleJSON } from '@/types/module';
import {
  saveModuleToSupabase,
  getModulesFromSupabase,
  getModuleFromSupabase,
  deleteModuleFromSupabase,
} from './supabaseModules';

const STORAGE_KEY = 'its-agrifood-moduli';

// Cache locale per performance
let modulesCache: ModuleJSON[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 secondi

// Salva un modulo (Supabase + localStorage come backup)
export async function saveModule(module: ModuleJSON): Promise<void> {
  // Salva su Supabase
  const result = await saveModuleToSupabase(module);

  if (!result.success) {
    console.warn('Failed to save to Supabase, using localStorage:', result.error);
  }

  // Salva anche in localStorage come backup
  if (typeof window !== 'undefined') {
    const modules = getModulesFromLocalStorage();
    const existingIndex = modules.findIndex(m => m.id === module.id);

    if (existingIndex >= 0) {
      modules[existingIndex] = module;
    } else {
      modules.push(module);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
  }

  // Invalida cache
  modulesCache = null;
}

// Ottieni tutti i moduli (da Supabase con fallback a localStorage)
export async function getModules(): Promise<ModuleJSON[]> {
  // Check cache
  if (modulesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return modulesCache;
  }

  try {
    const modules = await getModulesFromSupabase();
    if (modules.length > 0) {
      modulesCache = modules;
      cacheTimestamp = Date.now();
      return modules;
    }
  } catch (err) {
    console.warn('Failed to fetch from Supabase, using localStorage:', err);
  }

  // Fallback a localStorage
  return getModulesFromLocalStorage();
}

// Ottieni un modulo specifico
export async function getModule(id: string): Promise<ModuleJSON | null> {
  try {
    const foundModule = await getModuleFromSupabase(id);
    if (foundModule) {
      return foundModule;
    }
  } catch (err) {
    console.warn('Failed to fetch from Supabase, using localStorage:', err);
  }

  // Fallback a localStorage
  const modules = getModulesFromLocalStorage();
  return modules.find(m => m.id === id) || null;
}

// Elimina un modulo
export async function deleteModule(id: string): Promise<void> {
  // Elimina da Supabase
  const result = await deleteModuleFromSupabase(id);

  if (!result.success) {
    console.warn('Failed to delete from Supabase:', result.error);
  }

  // Elimina anche da localStorage
  if (typeof window !== 'undefined') {
    const modules = getModulesFromLocalStorage().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
  }

  // Invalida cache
  modulesCache = null;
}

// Genera un ID univoco per il modulo
export function generateModuleId(titolo: string): string {
  const slug = titolo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

// Helper: leggi da localStorage
function getModulesFromLocalStorage(): ModuleJSON[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Versioni sincrone per retrocompatibilità (usano cache o localStorage)
export function getModulesSync(): ModuleJSON[] {
  if (modulesCache) {
    return modulesCache;
  }
  return getModulesFromLocalStorage();
}

export function getModuleSync(id: string): ModuleJSON | null {
  const modules = getModulesSync();
  return modules.find(m => m.id === id) || null;
}
