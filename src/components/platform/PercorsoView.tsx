// @ts-nocheck
'use client';

import React from 'react';
import { getModules } from '@/services/moduliStorage';
import { ModuleJSON } from '@/types/module';

interface Modulo {
  id: string;
  titolo: string;
  tipo: 'contenuto' | 'quiz' | 'case-study' | 'lab' | 'challenge' | 'hackathon';
  durata: string;
  stato: 'completato' | 'in-corso' | 'bloccato';
  progresso: number;
  descrizione?: string;
}

interface PercorsoViewProps {
  setActiveModule: (module: string | null) => void;
}

const PercorsoView: React.FC<PercorsoViewProps> = ({ setActiveModule }) => {
  const [moduliDisponibili, setModuliDisponibili] = React.useState<ModuleJSON[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Carica i moduli da Supabase
  React.useEffect(() => {
    const loadModules = async () => {
      setIsLoading(true);
      try {
        const modules = await getModules();
        setModuliDisponibili(modules);
      } catch (err) {
        console.error('Error loading modules:', err);
      }
      setIsLoading(false);
    };
    loadModules();
  }, []);

  // Converti i moduli da Supabase nel formato Modulo per la visualizzazione
  const moduli: Modulo[] = moduliDisponibili.map((m, idx) => ({
    id: m.id,
    titolo: m.titolo,
    tipo: 'contenuto' as const,
    durata: m.durata || '1h',
    stato: idx === 0 ? 'in-corso' : 'in-corso', // Tutti accessibili
    progresso: 0,
    descrizione: m.descrizione,
  }));

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
        <p className="text-gray-500">{moduli.length} moduli disponibili</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">📚</div>
          <div className="text-2xl font-bold text-gray-800">{moduli.length}</div>
          <div className="text-sm text-gray-500">Moduli</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-2xl font-bold text-emerald-600">0%</div>
          <div className="text-sm text-gray-500">Completato</div>
        </div>
      </div>

      {/* Lista Moduli */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h3 className="font-semibold text-gray-800">Moduli Disponibili</h3>
          <p className="text-sm text-gray-500">Clicca su un modulo per iniziare</p>
        </div>
        <div className="p-4">
          {moduli.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessun modulo disponibile. Contatta l'amministratore.
            </div>
          ) : (
            <div className="space-y-2">
              {moduli.map((modulo, idx) => (
                <div
                  key={modulo.id}
                  onClick={() => handleModuleClick(modulo)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    statoColors[modulo.stato]
                  } cursor-pointer hover:shadow-md`}
                >
                  <div className={`text-2xl ${tipoColors[modulo.tipo]}`}>
                    {tipoIcons[modulo.tipo]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{modulo.titolo}</div>
                    {modulo.descrizione && (
                      <div className="text-xs opacity-60 mt-1">{modulo.descrizione}</div>
                    )}
                  </div>
                  <span className="text-xl">→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PercorsoView;
