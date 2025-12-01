// Storage per i moduli generati (localStorage, predisposto per Supabase)

import { ModuleJSON } from '@/types/module';

const STORAGE_KEY = 'its-agrifood-moduli';

// Salva un modulo
export function saveModule(module: ModuleJSON): void {
  const modules = getModules();
  const existingIndex = modules.findIndex(m => m.id === module.id);

  if (existingIndex >= 0) {
    modules[existingIndex] = module;
  } else {
    modules.push(module);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
  }
}

// Ottieni tutti i moduli
export function getModules(): ModuleJSON[] {
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

// Ottieni un modulo specifico
export function getModule(id: string): ModuleJSON | null {
  const modules = getModules();
  return modules.find(m => m.id === id) || null;
}

// Elimina un modulo
export function deleteModule(id: string): void {
  const modules = getModules().filter(m => m.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
  }
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
