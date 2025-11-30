// @ts-nocheck
'use client';

import React from 'react';

interface Modulo {
  id: string;
  titolo: string;
  tipo: 'contenuto' | 'quiz' | 'case-study' | 'lab' | 'challenge' | 'hackathon';
  durata: string;
  stato: 'completato' | 'in-corso' | 'bloccato';
  progresso: number;
  descrizione?: string;
}

interface Giornata {
  numero: number;
  titolo: string;
  descrizione: string;
  stato: 'completato' | 'in-corso' | 'bloccato';
  progresso: number;
  moduli: Modulo[];
}

interface PercorsoViewProps {
  setActiveModule: (module: string | null) => void;
}

const PercorsoView: React.FC<PercorsoViewProps> = ({ setActiveModule }) => {
  const giornate: Giornata[] = [
    {
      numero: 1,
      titolo: 'Fondamenti AgrifoodTech',
      descrizione: 'Contesto, tendenze e tecnologie chiave del settore',
      stato: 'in-corso',
      progresso: 40,
      moduli: [
        {
          id: 'agrifoodtech',
          titolo: 'Tendenze AgrifoodTech',
          tipo: 'contenuto',
          durata: '2h',
          stato: 'in-corso',
          progresso: 40,
          descrizione: '10 slide interattive su supply chain, sostenibilità, automazione'
        },
        {
          id: 'trend-tecnologici',
          titolo: 'Trend Tecnologici 2026+',
          tipo: 'contenuto',
          durata: '2.5h',
          stato: 'in-corso',
          progresso: 0,
          descrizione: '12 slide su AI, IoT, Blockchain, Quantum, Vino digitale'
        },
        {
          id: 'quiz-1',
          titolo: 'Quiz di verifica',
          tipo: 'quiz',
          durata: '15min',
          stato: 'bloccato',
          progresso: 0,
        },
        {
          id: 'case-1',
          titolo: 'Case Study: Barilla',
          tipo: 'case-study',
          durata: '45min',
          stato: 'bloccato',
          progresso: 0,
        },
      ],
    },
    {
      numero: 2,
      titolo: 'Supply Chain e Blockchain',
      descrizione: 'Tracciabilità, trasparenza e sicurezza alimentare',
      stato: 'bloccato',
      progresso: 0,
      moduli: [
        {
          id: 'blockchain',
          titolo: 'Blockchain per il Food',
          tipo: 'contenuto',
          durata: '1.5h',
          stato: 'bloccato',
          progresso: 0,
        },
        {
          id: 'lab-1',
          titolo: 'Lab: Crea la tua tracciabilità',
          tipo: 'lab',
          durata: '2h',
          stato: 'bloccato',
          progresso: 0,
        },
      ],
    },
    {
      numero: 3,
      titolo: 'Sostenibilità e Normative',
      descrizione: 'Farm to Fork, ESG, certificazioni e compliance',
      stato: 'bloccato',
      progresso: 0,
      moduli: [
        {
          id: 'sostenibilita',
          titolo: 'Sostenibilità nel Food',
          tipo: 'contenuto',
          durata: '1.5h',
          stato: 'bloccato',
          progresso: 0,
        },
        {
          id: 'challenge-1',
          titolo: 'Challenge: Progetta un vino sostenibile',
          tipo: 'challenge',
          durata: '3h',
          stato: 'bloccato',
          progresso: 0,
        },
      ],
    },
    {
      numero: 4,
      titolo: 'Hackathon Finale',
      descrizione: 'Progetta una soluzione innovativa per l\'agrifood',
      stato: 'bloccato',
      progresso: 0,
      moduli: [
        {
          id: 'hackathon',
          titolo: 'Hackathon: AgriFood Innovation',
          tipo: 'hackathon',
          durata: '8h',
          stato: 'bloccato',
          progresso: 0,
        },
      ],
    },
  ];

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
    
    // Mappa degli ID modulo ai nomi dei componenti
    const moduleMap: Record<string, string> = {
      'agrifoodtech': 'agrifoodtech',
      'trend-tecnologici': 'trend-tecnologici',
      // Aggiungi altri moduli qui quando saranno pronti
    };

    if (moduleMap[modulo.id]) {
      setActiveModule(moduleMap[modulo.id]);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📚 Percorso Formativo</h1>
        <p className="text-gray-500">4 giornate • 32 ore totali</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">📅</div>
          <div className="text-2xl font-bold text-gray-800">4</div>
          <div className="text-sm text-gray-500">Giornate</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">📚</div>
          <div className="text-2xl font-bold text-gray-800">8</div>
          <div className="text-sm text-gray-500">Moduli</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">⏱️</div>
          <div className="text-2xl font-bold text-gray-800">32h</div>
          <div className="text-sm text-gray-500">Totali</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-2xl font-bold text-emerald-600">20%</div>
          <div className="text-sm text-gray-500">Completato</div>
        </div>
      </div>

      {/* Giornate */}
      <div className="space-y-6">
        {giornate.map((giornata, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Header Giornata */}
            <div
              className={`p-6 ${
                giornata.stato === 'bloccato'
                  ? 'bg-gray-50'
                  : 'bg-gradient-to-r from-emerald-50 to-teal-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                      giornata.stato === 'bloccato'
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {giornata.numero}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{giornata.titolo}</h3>
                    <p className="text-sm text-gray-500">{giornata.descrizione}</p>
                  </div>
                </div>
                {giornata.stato !== 'bloccato' && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Progresso</div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${giornata.progresso}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {giornata.progresso}%
                      </span>
                    </div>
                  </div>
                )}
                {giornata.stato === 'bloccato' && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>🔒</span>
                    <span className="text-sm">Completa la giornata precedente</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lista Moduli */}
            <div className="p-4">
              <div className="space-y-2">
                {giornata.moduli.map((modulo, midx) => (
                  <div
                    key={midx}
                    onClick={() => handleModuleClick(modulo)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      statoColors[modulo.stato]
                    } ${
                      modulo.stato !== 'bloccato'
                        ? 'cursor-pointer hover:shadow-md'
                        : 'cursor-not-allowed'
                    }`}
                  >
                    <div className={`text-2xl ${tipoColors[modulo.tipo]}`}>
                      {tipoIcons[modulo.tipo]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{modulo.titolo}</div>
                      <div className="text-sm opacity-70">{modulo.durata}</div>
                      {modulo.descrizione && (
                        <div className="text-xs opacity-60 mt-1">{modulo.descrizione}</div>
                      )}
                    </div>
                    {modulo.stato === 'in-corso' && modulo.progresso > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${modulo.progresso}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{modulo.progresso}%</span>
                      </div>
                    )}
                    {modulo.stato === 'completato' && <span className="text-xl">✅</span>}
                    {modulo.stato === 'bloccato' && <span className="text-xl">🔒</span>}
                    {modulo.stato === 'in-corso' && <span className="text-xl">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 bg-white rounded-xl p-4 shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-3">📖 Legenda Tipologie</h4>
        <div className="flex flex-wrap gap-4">
          {Object.entries(tipoIcons).map(([tipo, icon]) => (
            <div key={tipo} className="flex items-center gap-2 text-sm">
              <span className={tipoColors[tipo as Modulo['tipo']]}>{icon}</span>
              <span className="text-gray-600 capitalize">{tipo.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PercorsoView;
