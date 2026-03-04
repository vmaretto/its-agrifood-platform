// @ts-nocheck
'use client';

import React from 'react';
import { getModules } from '@/services/moduliStorage';
import { ModuleJSON } from '@/types/module';
import { getAllModulesProgress, ModuleProgress } from '@/services/progressService';
import { UserProfile } from '@/services/authService';

interface Modulo {
  id: string;
  titolo: string;
  tipo: 'contenuto' | 'quiz' | 'case-study' | 'lab' | 'challenge' | 'hackathon';
  stato: 'completato' | 'in-corso' | 'bloccato';
  progresso: number;
  descrizione?: string;
  totalSlides: number;
  timeSpent?: number; // tempo trascorso in secondi
  section?: string; // sezione per raggruppamento
}

// Raggruppa i moduli per sezione
interface SectionGroup {
  name: string;
  icon: string;
  color: string;
  modules: Modulo[];
}

// Configurazione delle sezioni con icone e colori
const SECTION_CONFIG: Record<string, { icon: string; color: string; order: number }> = {
  'FoodTech Trend': { icon: '🚀', color: 'from-purple-500 to-indigo-600', order: 1 },
  'Blockchain': { icon: '⛓️', color: 'from-blue-500 to-cyan-600', order: 2 },
  'IoT': { icon: '📡', color: 'from-teal-500 to-emerald-600', order: 3 },
  'RA e RV': { icon: '🥽', color: 'from-violet-500 to-purple-600', order: 4 },
  'Sostenibilità': { icon: '🌱', color: 'from-green-500 to-emerald-600', order: 5 },
  'Marketing': { icon: '📣', color: 'from-orange-500 to-red-600', order: 6 },
  'default': { icon: '📚', color: 'from-gray-500 to-gray-600', order: 99 }
};

// Helper per formattare il tempo in mm:ss
const formatTimeSpent = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface PercorsoViewProps {
  setActiveModule: (module: string | null) => void;
  currentUser?: UserProfile | null;
  courseId?: string;
}

const PercorsoView: React.FC<PercorsoViewProps> = ({ setActiveModule, currentUser, courseId }) => {
  const [moduliDisponibili, setModuliDisponibili] = React.useState<ModuleJSON[]>([]);
  const [progressMap, setProgressMap] = React.useState<Record<string, ModuleProgress>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  // Carica i moduli e il progresso da Supabase
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const modules = await getModules(courseId);
        setModuliDisponibili(modules);

        // Carica il progresso dell'utente se loggato
        if (currentUser?.id) {
          const progress = await getAllModulesProgress(currentUser.id);
          setProgressMap(progress);
        }
      } catch (err) {
        console.error('Error loading modules:', err);
      }
      setIsLoading(false);
    };
    loadData();
  }, [currentUser?.id, courseId]);

  // Converti i moduli da Supabase nel formato Modulo per la visualizzazione
  const moduli: Modulo[] = moduliDisponibili.map((m) => {
    const moduleProgress = progressMap[m.id];
    const totalSlides = m.slides?.length || 0;
    const completedSlides = moduleProgress?.completed_slides?.length || 0;
    const isCompleted = moduleProgress?.is_completed || false;
    const hasStarted = !!moduleProgress;

    // Calcola progresso percentuale
    const progressPercent = totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 0;

    // Determina lo stato
    let stato: 'completato' | 'in-corso' | 'bloccato' = 'in-corso';
    if (isCompleted) {
      stato = 'completato';
    } else if (hasStarted) {
      stato = 'in-corso';
    }

    return {
      id: m.id,
      titolo: m.titolo,
      tipo: 'contenuto' as const,
      stato,
      progresso: progressPercent,
      descrizione: m.descrizione,
      totalSlides,
      timeSpent: moduleProgress?.time_spent_seconds,
      section: m.section,
    };
  });

  // Raggruppa i moduli per sezione
  const groupModulesBySection = (modules: Modulo[]): SectionGroup[] => {
    const groups: Record<string, Modulo[]> = {};

    modules.forEach(mod => {
      const sectionName = mod.section || 'Moduli Generali';
      if (!groups[sectionName]) {
        groups[sectionName] = [];
      }
      groups[sectionName].push(mod);
    });

    // Converti in array di SectionGroup e ordina
    const sectionGroups: SectionGroup[] = Object.entries(groups).map(([name, mods]) => {
      const config = SECTION_CONFIG[name] || SECTION_CONFIG['default'];
      return {
        name,
        icon: config.icon,
        color: config.color,
        modules: mods
      };
    });

    // Ordina le sezioni per ordine configurato
    return sectionGroups.sort((a, b) => {
      const orderA = SECTION_CONFIG[a.name]?.order || 99;
      const orderB = SECTION_CONFIG[b.name]?.order || 99;
      return orderA - orderB;
    });
  };

  const sectionGroups = groupModulesBySection(moduli);
  const hasSections = sectionGroups.some(g => g.name !== 'Moduli Generali') || sectionGroups.length > 1;

  const tipoIcons: Record<Modulo['tipo'], string> = {
    contenuto: '📚',
    quiz: '🧠',
    'case-study': '📋',
    lab: '🔬',
    challenge: '🏆',
    hackathon: '💡',
  };

  const tipoColors: Record<Modulo['tipo'], string> = {
    contenuto: 'text-blue-600',
    quiz: 'text-purple-600',
    'case-study': 'text-amber-600',
    lab: 'text-emerald-600',
    challenge: 'text-red-600',
    hackathon: 'text-indigo-600',
  };

  const statoColors: Record<Modulo['stato'], string> = {
    completato: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'in-corso': 'bg-blue-100 text-blue-700 border-blue-200',
    bloccato: 'bg-gray-100 text-gray-400 border-gray-200',
  };

  const handleModuleClick = (modulo: Modulo) => {
    if (modulo.stato === 'bloccato') return;
    // Tutti i moduli sono ora dinamici su Supabase
    setActiveModule(modulo.id);
  };

  // Componente per singolo modulo
  const ModuleCard = ({ modulo }: { modulo: Modulo }) => (
    <div
      onClick={() => handleModuleClick(modulo)}
      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
        statoColors[modulo.stato]
      } cursor-pointer hover:shadow-md`}
    >
      <div className={`text-2xl ${tipoColors[modulo.tipo]}`}>
        {modulo.stato === 'completato' ? '✅' : tipoIcons[modulo.tipo]}
      </div>
      <div className="flex-1">
        <div className="font-medium">{modulo.titolo}</div>
        {modulo.descrizione && (
          <div className="text-xs opacity-60 mt-1">{modulo.descrizione}</div>
        )}
        {/* Tempo trascorso per moduli completati */}
        {modulo.stato === 'completato' && modulo.timeSpent && modulo.timeSpent > 0 && (
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <span>⏱️</span>
            <span>{formatTimeSpent(modulo.timeSpent)}</span>
          </div>
        )}
        {/* Barra di progresso */}
        {modulo.progresso > 0 && modulo.progresso < 100 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${modulo.progresso}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{modulo.progresso}%</span>
          </div>
        )}
      </div>
      <span className="text-xl">{modulo.stato === 'completato' ? '🎉' : '→'}</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Caricamento moduli...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Percorso Formativo</h1>
        <p className="text-gray-500">
          {moduli.length} moduli disponibili
          {hasSections && ` in ${sectionGroups.length} sezioni`}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">📚</div>
          <div className="text-2xl font-bold text-gray-800">{moduli.length}</div>
          <div className="text-sm text-gray-500">Moduli</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold text-emerald-600">
            {moduli.filter(m => m.stato === 'completato').length}
          </div>
          <div className="text-sm text-gray-500">Completati</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">⏱️</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatTimeSpent(moduli.reduce((acc, m) => acc + (m.timeSpent || 0), 0))}
          </div>
          <div className="text-sm text-gray-500">Tempo Totale</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-2xl font-bold text-indigo-600">
            {moduli.length > 0 ? Math.round(moduli.filter(m => m.stato === 'completato').length / moduli.length * 100) : 0}%
          </div>
          <div className="text-sm text-gray-500">Progresso</div>
        </div>
      </div>

      {/* Lista Moduli Raggruppati per Sezione */}
      {moduli.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-500">
          Nessun modulo disponibile. Contatta l'amministratore.
        </div>
      ) : hasSections ? (
        // Vista con sezioni
        <div className="space-y-6">
          {sectionGroups.map((section) => (
            <div key={section.name} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Header Sezione */}
              <div className={`p-6 bg-gradient-to-r ${section.color} text-white`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{section.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold">{section.name}</h3>
                    <p className="text-sm opacity-80">
                      {section.modules.length} {section.modules.length === 1 ? 'modulo' : 'moduli'}
                      {' • '}
                      {section.modules.filter(m => m.stato === 'completato').length} completati
                    </p>
                  </div>
                </div>
                {/* Barra progresso sezione */}
                <div className="mt-4">
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{
                        width: `${section.modules.length > 0
                          ? (section.modules.filter(m => m.stato === 'completato').length / section.modules.length) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Moduli della sezione */}
              <div className="p-4">
                <div className="space-y-2">
                  {section.modules.map((modulo) => (
                    <ModuleCard key={modulo.id} modulo={modulo} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vista senza sezioni (tutti i moduli insieme)
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
            <h3 className="font-semibold text-gray-800">Moduli Disponibili</h3>
            <p className="text-sm text-gray-500">Clicca su un modulo per iniziare</p>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {moduli.map((modulo) => (
                <ModuleCard key={modulo.id} modulo={modulo} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PercorsoView;
