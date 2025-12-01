// @ts-nocheck
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { saveModule, generateModuleId, getModule } from '@/services/moduliStorage';
import { ModuleJSON, SlideJSON } from '@/types/module';

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

// Info sui moduli statici per permettere upload speech-only
const STATIC_MODULES_INFO: Record<string, { titolo: string; descrizione: string; icon: string; slides: { title: string; section: string }[] }> = {
  'agrifoodtech': {
    titolo: 'Tendenze AgrifoodTech',
    descrizione: 'Panoramica sulle tendenze tecnologiche nel settore agroalimentare',
    icon: '🌱',
    slides: [
      { title: 'Introduzione all\'AgrifoodTech', section: 'Introduzione' },
      { title: 'Precision Farming', section: 'Tecnologie' },
      { title: 'IoT nell\'Agricoltura', section: 'Tecnologie' },
      { title: 'Big Data e Analytics', section: 'Analisi Dati' },
      { title: 'Blockchain e Tracciabilità', section: 'Supply Chain' },
      { title: 'Sostenibilità', section: 'Ambiente' },
      { title: 'Innovazione nei Processi', section: 'Processi' },
      { title: 'Case Study', section: 'Esempi' },
      { title: 'Tendenze Future', section: 'Futuro' },
      { title: 'Conclusioni', section: 'Conclusioni' },
    ]
  },
  'trend-tecnologici': {
    titolo: 'Trend Tecnologici 2026+',
    descrizione: 'I trend tecnologici che plasmeranno il futuro del settore agroalimentare',
    icon: '🚀',
    slides: [
      { title: 'Introduzione ai Trend 2026+', section: 'Introduzione' },
      { title: 'AI e Machine Learning', section: 'Intelligenza Artificiale' },
      { title: 'Robotica Agricola', section: 'Automazione' },
      { title: 'Vertical Farming', section: 'Nuove Coltivazioni' },
      { title: 'Droni e Monitoraggio', section: 'Monitoraggio' },
      { title: 'Biotecnologie', section: 'Bio' },
      { title: 'Economia Circolare', section: 'Sostenibilità' },
      { title: 'Food Tech Startup', section: 'Innovazione' },
      { title: 'Digital Twin', section: 'Simulazione' },
      { title: 'Smart Packaging', section: 'Packaging' },
      { title: 'Mercati del Futuro', section: 'Mercati' },
      { title: 'Conclusioni e Prospettive', section: 'Conclusioni' },
    ]
  },
  'blockchain': {
    titolo: 'Blockchain per il Food',
    descrizione: 'Come la blockchain sta rivoluzionando la tracciabilità alimentare',
    icon: '🔗',
    slides: [
      { title: 'Cos\'è la Blockchain', section: 'Introduzione' },
      { title: 'Tracciabilità Alimentare', section: 'Applicazioni' },
      { title: 'Case Study', section: 'Esempi' },
    ]
  },
  'sostenibilita': {
    titolo: 'Sostenibilità nel Food',
    descrizione: 'Pratiche sostenibili nella filiera agroalimentare',
    icon: '♻️',
    slides: [
      { title: 'Introduzione alla Sostenibilità', section: 'Introduzione' },
      { title: 'Impatto Ambientale', section: 'Ambiente' },
      { title: 'Best Practices', section: 'Pratiche' },
    ]
  },
};

interface AdminNuovoModuloProps {
  editModuleId?: string | null;
  onModuleCreated?: (module: ModuleJSON) => void;
  onCancel?: () => void;
}

export default function AdminNuovoModulo({ editModuleId, onModuleCreated, onCancel }: AdminNuovoModuloProps) {
  // Edit mode
  const isEditMode = !!editModuleId;
  const [existingModule, setExistingModule] = useState<ModuleJSON | null>(null);
  const [isStaticModule, setIsStaticModule] = useState(false);
  const [staticModuleInfo, setStaticModuleInfo] = useState<typeof STATIC_MODULES_INFO[string] | null>(null);

  // Content file state
  const [markdownContent, setMarkdownContent] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOverContent, setIsDragOverContent] = useState(false);

  // Speech file state
  const [speechContent, setSpeechContent] = useState('');
  const [speechFileName, setSpeechFileName] = useState<string | null>(null);
  const [isDragOverSpeech, setIsDragOverSpeech] = useState(false);

  // Generation state
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedModule, setGeneratedModule] = useState<ModuleJSON | null>(null);

  // Load existing module for editing (dynamic or static)
  useEffect(() => {
    if (editModuleId) {
      const loadModule = async () => {
        // Prima prova a caricare da Supabase/localStorage (moduli dinamici)
        const mod = await getModule(editModuleId);
        if (mod) {
          setExistingModule(mod);
          setIsStaticModule(false);
          setStaticModuleInfo(null);
        } else {
          // Se non trovato, controlla se è un modulo statico
          const staticInfo = STATIC_MODULES_INFO[editModuleId];
          if (staticInfo) {
            setIsStaticModule(true);
            setStaticModuleInfo(staticInfo);
            setExistingModule(null);
          }
        }
      };
      loadModule();
    }
  }, [editModuleId]);

  // Content file handlers
  const handleContentFileUpload = useCallback((file: File) => {
    if (!file.name.endsWith('.md')) {
      setErrorMessage('Per favore carica un file Markdown (.md)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setMarkdownContent(content);
      setFileName(file.name);
      setErrorMessage('');
      setStatus('idle');
      setGeneratedModule(null);
    };
    reader.readAsText(file);
  }, []);

  const handleContentDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverContent(false);
    const file = e.dataTransfer.files[0];
    if (file) handleContentFileUpload(file);
  }, [handleContentFileUpload]);

  const handleContentDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverContent(true);
  }, []);

  const handleContentDragLeave = useCallback(() => {
    setIsDragOverContent(false);
  }, []);

  const handleContentFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleContentFileUpload(file);
  }, [handleContentFileUpload]);

  // Speech file handlers
  const handleSpeechFileUpload = useCallback((file: File) => {
    if (!file.name.endsWith('.md')) {
      setErrorMessage('Per favore carica un file Markdown (.md) per le note docente');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSpeechContent(content);
      setSpeechFileName(file.name);
      setErrorMessage('');
    };
    reader.readAsText(file);
  }, []);

  const handleSpeechDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverSpeech(false);
    const file = e.dataTransfer.files[0];
    if (file) handleSpeechFileUpload(file);
  }, [handleSpeechFileUpload]);

  const handleSpeechDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverSpeech(true);
  }, []);

  const handleSpeechDragLeave = useCallback(() => {
    setIsDragOverSpeech(false);
  }, []);

  const handleSpeechFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSpeechFileUpload(file);
  }, [handleSpeechFileUpload]);

  const removeSpeechFile = () => {
    setSpeechContent('');
    setSpeechFileName(null);
  };

  // Generate new module from scratch
  const generateModule = async () => {
    if (!markdownContent) {
      setErrorMessage('Carica prima un file Markdown con i contenuti');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/generate-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown: markdownContent,
          speechMarkdown: speechContent || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = data.error || 'Errore nella generazione del modulo';
        if (data.parseError) {
          errorMsg += ` (${data.parseError})`;
        }
        throw new Error(errorMsg);
      }

      // Aggiungi id e timestamp
      const moduleWithMeta: ModuleJSON = {
        ...data.module,
        id: generateModuleId(data.module.titolo),
        createdAt: new Date().toISOString(),
      };

      setGeneratedModule(moduleWithMeta);
      setStatus('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Errore sconosciuto');
      setStatus('error');
    }
  };

  // Update existing module with new speech (for dynamic modules)
  const updateModuleSpeech = async () => {
    if (!existingModule || !speechContent) {
      setErrorMessage('Carica un file speech per aggiornare le note docente');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/generate-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown: `# ${existingModule.titolo}\n\n${existingModule.descrizione}\n\n` +
            existingModule.slides.map(s => `## ${s.title}\n\n${s.contenuto}`).join('\n\n'),
          speechMarkdown: speechContent,
          updateSpeechOnly: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = data.error || 'Errore nell\'aggiornamento delle note';
        if (data.parseError) {
          errorMsg += ` (${data.parseError})`;
        }
        throw new Error(errorMsg);
      }

      // Merge the new noteDocente with existing module
      const updatedModule: ModuleJSON = {
        ...existingModule,
        slides: existingModule.slides.map((slide, idx) => ({
          ...slide,
          noteDocente: data.module.slides[idx]?.noteDocente || slide.noteDocente,
        })),
      };

      setGeneratedModule(updatedModule);
      setStatus('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Errore sconosciuto');
      setStatus('error');
    }
  };

  // Update static module with speech (parse speech only, create new dynamic module)
  const updateStaticModuleSpeech = async () => {
    if (!staticModuleInfo || !speechContent || !editModuleId) {
      setErrorMessage('Carica un file speech per creare le note docente');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Parse solo lo speech usando la nuova API
      const response = await fetch('/api/parse-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speechMarkdown: speechContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nel parsing delle note docente');
      }

      // Salva le noteDocente con l'ID originale del modulo statico
      // Il contenuto rimane hardcoded nel componente React, solo le noteDocente vengono caricate da Supabase
      const moduleWithSpeech: ModuleJSON = {
        id: editModuleId, // USA L'ID ORIGINALE del modulo statico
        titolo: staticModuleInfo.titolo,
        descrizione: staticModuleInfo.descrizione,
        icon: staticModuleInfo.icon,
        durata: '2-3 ore',
        createdAt: new Date().toISOString(),
        slides: staticModuleInfo.slides.map((slide, idx) => ({
          id: idx + 1,
          title: slide.title,
          section: slide.section,
          contenuto: '', // Il contenuto reale è nel componente statico, non serve duplicarlo
          noteDocente: data.noteDocente[idx] ? {
            durata: data.noteDocente[idx].durata || '8-10 min',
            obiettivi: data.noteDocente[idx].obiettivi || [],
            speech: data.noteDocente[idx].speech || '',
            note: data.noteDocente[idx].note || [],
            domande: data.noteDocente[idx].domande || [],
          } : undefined,
        })) as SlideJSON[],
      };

      setGeneratedModule(moduleWithSpeech);
      setStatus('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Errore sconosciuto');
      setStatus('error');
    }
  };

  const saveGeneratedModule = async () => {
    if (generatedModule) {
      await saveModule(generatedModule);
      onModuleCreated?.(generatedModule);
      resetForm();
    }
  };

  const resetForm = () => {
    setMarkdownContent('');
    setFileName(null);
    setSpeechContent('');
    setSpeechFileName(null);
    setStatus('idle');
    setErrorMessage('');
    setGeneratedModule(null);
    setExistingModule(null);
  };

  // Render Edit Mode UI for STATIC modules
  if (isEditMode && isStaticModule && staticModuleInfo) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Indietro
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">🎤 Aggiungi Note Docente</h1>
          <p className="text-gray-500">Carica le note docente per "{staticModuleInfo.titolo}"</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Module Info & Upload */}
          <div className="space-y-6">
            {/* Module Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{staticModuleInfo.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{staticModuleInfo.titolo}</h3>
                  <p className="text-gray-500">{staticModuleInfo.descrizione}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    Modulo Statico
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-600">{staticModuleInfo.slides.length}</div>
                  <div className="text-xs text-gray-500">Slide</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-600">0</div>
                  <div className="text-xs text-gray-500">Note Docente</div>
                </div>
              </div>
            </div>

            {/* Speech Upload Zone */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>🎤</span> Carica Note Docente
              </h3>
              <div
                onDrop={handleSpeechDrop}
                onDragOver={handleSpeechDragOver}
                onDragLeave={handleSpeechDragLeave}
                className={`bg-white rounded-2xl shadow-sm p-6 border-2 border-dashed transition-colors ${
                  isDragOverSpeech
                    ? 'border-purple-500 bg-purple-50'
                    : speechFileName
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {speechFileName ? (
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎤</div>
                    <div className="font-semibold text-gray-800">{speechFileName}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {speechContent.length.toLocaleString()} caratteri
                    </div>
                    <button
                      onClick={removeSpeechFile}
                      className="mt-3 text-sm text-red-600 hover:text-red-700"
                    >
                      Rimuovi
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎤</div>
                    <div className="font-medium text-gray-800 mb-1">
                      Trascina qui il file .md
                    </div>
                    <div className="text-sm text-gray-500 mb-3">con speech e note per ogni slide</div>
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm">
                        Seleziona file
                      </span>
                      <input
                        type="file"
                        accept=".md"
                        onChange={handleSpeechFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Update Button */}
            {speechFileName && status !== 'success' && (
              <button
                onClick={updateStaticModuleSpeech}
                disabled={status === 'loading'}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  status === 'loading'
                    ? 'bg-gray-300 text-gray-500 cursor-wait'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="animate-spin">⏳</span>
                    Elaborazione note...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🎤</span>
                    Crea Modulo con Note Docente
                  </span>
                )}
              </button>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <span>❌</span>
                  <span className="font-medium">Errore</span>
                </div>
                <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Right Column - Slides List & Preview */}
          <div>
            {status === 'loading' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="animate-pulse">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Elaborazione note...
                  </h3>
                  <p className="text-gray-500">
                    Sto analizzando le note docente e collegandole alle slide.
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && generatedModule && (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span>✅</span>
                    <span className="font-medium">Note docente elaborate con successo!</span>
                  </div>
                  <p className="text-sm text-emerald-600 mt-1">
                    Verrà creato un nuovo modulo con le note docente integrate.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">Slide con note:</h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {generatedModule.slides.map((slide, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{slide.title}</div>
                        </div>
                        {slide.noteDocente ? (
                          <span className="text-emerald-500" title="Note presenti">✅</span>
                        ) : (
                          <span className="text-gray-300" title="Nessuna nota">○</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={saveGeneratedModule}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      💾 Salva Nuovo Modulo
                    </button>
                    <button
                      onClick={onCancel}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              </div>
            )}

            {status === 'idle' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h4 className="font-semibold text-gray-700 mb-4">📋 Slide del modulo:</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {staticModuleInfo.slides.map((slide, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{slide.title}</div>
                        <div className="text-xs text-gray-500">{slide.section}</div>
                      </div>
                      <span className="text-gray-300" title="Nessuna nota">○</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-medium text-purple-800 mb-2">🎤 Formato file Note Docente</h4>
                  <p className="text-xs text-purple-600 mb-2">
                    Crea un file .md con una sezione per ogni slide, separate da "---"
                  </p>
                  <pre className="text-xs text-purple-700 bg-purple-100 rounded p-2 overflow-x-auto">
{`# ${staticModuleInfo.slides[0]?.title || 'Titolo Slide 1'}

**Durata:** 8-10 min

**Obiettivi:**
- Obiettivo 1
- Obiettivo 2

**Speech:**
Testo dello speech...

**Note:**
- Nota per il docente

**Domande:**
- Domanda suggerita?

---

# ${staticModuleInfo.slides[1]?.title || 'Titolo Slide 2'}
...`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Edit Mode UI for DYNAMIC modules
  if (isEditMode && existingModule) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Indietro
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">✏️ Modifica Modulo</h1>
          <p className="text-gray-500">Aggiorna le note docente per "{existingModule.titolo}"</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Module Info & Upload */}
          <div className="space-y-6">
            {/* Module Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{existingModule.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{existingModule.titolo}</h3>
                  <p className="text-gray-500">{existingModule.descrizione}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-600">{existingModule.slides.length}</div>
                  <div className="text-xs text-gray-500">Slide</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {existingModule.slides.filter(s => s.quiz).length}
                  </div>
                  <div className="text-xs text-gray-500">Quiz</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {existingModule.slides.filter(s => s.noteDocente).length}
                  </div>
                  <div className="text-xs text-gray-500">Note Docente</div>
                </div>
              </div>
            </div>

            {/* Speech Upload Zone */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>🎤</span> Carica Nuove Note Docente
              </h3>
              <div
                onDrop={handleSpeechDrop}
                onDragOver={handleSpeechDragOver}
                onDragLeave={handleSpeechDragLeave}
                className={`bg-white rounded-2xl shadow-sm p-6 border-2 border-dashed transition-colors ${
                  isDragOverSpeech
                    ? 'border-purple-500 bg-purple-50'
                    : speechFileName
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {speechFileName ? (
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎤</div>
                    <div className="font-semibold text-gray-800">{speechFileName}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {speechContent.length.toLocaleString()} caratteri
                    </div>
                    <button
                      onClick={removeSpeechFile}
                      className="mt-3 text-sm text-red-600 hover:text-red-700"
                    >
                      Rimuovi
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎤</div>
                    <div className="font-medium text-gray-800 mb-1">
                      Trascina qui il file .md
                    </div>
                    <div className="text-sm text-gray-500 mb-3">con speech e note per ogni slide</div>
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm">
                        Seleziona file
                      </span>
                      <input
                        type="file"
                        accept=".md"
                        onChange={handleSpeechFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Update Button */}
            {speechFileName && status !== 'success' && (
              <button
                onClick={updateModuleSpeech}
                disabled={status === 'loading'}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  status === 'loading'
                    ? 'bg-gray-300 text-gray-500 cursor-wait'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="animate-spin">⏳</span>
                    Aggiornamento in corso...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🔄</span>
                    Aggiorna Note Docente
                  </span>
                )}
              </button>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <span>❌</span>
                  <span className="font-medium">Errore</span>
                </div>
                <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Right Column - Slides List & Preview */}
          <div>
            {status === 'loading' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="animate-pulse">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Aggiornamento note...
                  </h3>
                  <p className="text-gray-500">
                    Sto integrando le nuove note docente nelle slide.
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && generatedModule && (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span>✅</span>
                    <span className="font-medium">Note aggiornate con successo!</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">Slide con note aggiornate:</h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {generatedModule.slides.map((slide, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{slide.title}</div>
                        </div>
                        {slide.noteDocente ? (
                          <span className="text-emerald-500" title="Note presenti">✅</span>
                        ) : (
                          <span className="text-gray-300" title="Nessuna nota">○</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={saveGeneratedModule}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      💾 Salva Modifiche
                    </button>
                    <button
                      onClick={onCancel}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              </div>
            )}

            {status === 'idle' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h4 className="font-semibold text-gray-700 mb-4">📋 Slide del modulo:</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {existingModule.slides.map((slide, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{slide.title}</div>
                        <div className="text-xs text-gray-500">{slide.section}</div>
                      </div>
                      {slide.noteDocente ? (
                        <span className="text-emerald-500" title="Ha già note docente">📋</span>
                      ) : (
                        <span className="text-gray-300" title="Nessuna nota">○</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-medium text-purple-800 mb-2">🎤 Formato file Note Docente</h4>
                  <pre className="text-xs text-purple-700 bg-purple-100 rounded p-2 overflow-x-auto">
{`# Titolo Slide 1

**Durata:** 8-10 min

**Obiettivi:**
- Obiettivo 1
- Obiettivo 2

**Speech:**
Testo dello speech...

**Note:**
- Nota per il docente

**Domande:**
- Domanda suggerita?

---

# Titolo Slide 2
...`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Create Mode UI (original)
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">🚀 Genera Nuovo Modulo</h1>
        <p className="text-gray-500">Carica i file Markdown e genera automaticamente un modulo interattivo</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Upload & Preview */}
        <div className="space-y-6">
          {/* Content Drop Zone */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>📄</span> Contenuto del Modulo
              <span className="text-red-500">*</span>
            </h3>
            <div
              onDrop={handleContentDrop}
              onDragOver={handleContentDragOver}
              onDragLeave={handleContentDragLeave}
              className={`bg-white rounded-2xl shadow-sm p-6 border-2 border-dashed transition-colors ${
                isDragOverContent
                  ? 'border-indigo-500 bg-indigo-50'
                  : fileName
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {fileName ? (
                <div className="text-center">
                  <div className="text-3xl mb-2">📄</div>
                  <div className="font-semibold text-gray-800">{fileName}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {markdownContent.length.toLocaleString()} caratteri
                  </div>
                  <button
                    onClick={() => { setMarkdownContent(''); setFileName(null); setGeneratedModule(null); }}
                    className="mt-3 text-sm text-red-600 hover:text-red-700"
                  >
                    Rimuovi
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl mb-2">📤</div>
                  <div className="font-medium text-gray-800 mb-1">
                    Trascina qui il file .md
                  </div>
                  <div className="text-sm text-gray-500 mb-3">con i contenuti delle slide</div>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm">
                      Seleziona file
                    </span>
                    <input
                      type="file"
                      accept=".md"
                      onChange={handleContentFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Speech Drop Zone */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>🎤</span> Note Docente
              <span className="text-xs text-gray-400 font-normal">(opzionale)</span>
            </h3>
            <div
              onDrop={handleSpeechDrop}
              onDragOver={handleSpeechDragOver}
              onDragLeave={handleSpeechDragLeave}
              className={`bg-white rounded-2xl shadow-sm p-6 border-2 border-dashed transition-colors ${
                isDragOverSpeech
                  ? 'border-purple-500 bg-purple-50'
                  : speechFileName
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {speechFileName ? (
                <div className="text-center">
                  <div className="text-3xl mb-2">🎤</div>
                  <div className="font-semibold text-gray-800">{speechFileName}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {speechContent.length.toLocaleString()} caratteri
                  </div>
                  <button
                    onClick={removeSpeechFile}
                    className="mt-3 text-sm text-red-600 hover:text-red-700"
                  >
                    Rimuovi
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl mb-2">🎤</div>
                  <div className="font-medium text-gray-800 mb-1">
                    Trascina qui il file .md
                  </div>
                  <div className="text-sm text-gray-500 mb-3">con speech e note per ogni slide</div>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm">
                      Seleziona file
                    </span>
                    <input
                      type="file"
                      accept=".md"
                      onChange={handleSpeechFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          {markdownContent && status !== 'success' && (
            <button
              onClick={generateModule}
              disabled={status === 'loading'}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                status === 'loading'
                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="animate-spin">⏳</span>
                  Generazione in corso con Claude AI...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  Genera Modulo con AI
                  {speechFileName && <span className="text-sm opacity-75">(+ Note Docente)</span>}
                </span>
              )}
            </button>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700">
                <span>❌</span>
                <span className="font-medium">Errore</span>
              </div>
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Right Column - Generated Module Preview */}
        <div>
          {status === 'loading' && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="animate-pulse">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Claude sta elaborando...
                </h3>
                <p className="text-gray-500">
                  Sto analizzando il contenuto e generando il modulo interattivo.
                  <br />
                  Questo potrebbe richiedere 30-60 secondi.
                </p>
                {speechFileName && (
                  <p className="text-purple-600 mt-2 text-sm">
                    🎤 Integrazione note docente in corso...
                  </p>
                )}
                <div className="mt-6 flex justify-center">
                  <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && generatedModule && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <span>✅</span>
                  <span className="font-medium">Modulo generato con successo!</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{generatedModule.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{generatedModule.titolo}</h3>
                    <p className="text-gray-500">{generatedModule.descrizione}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-indigo-600">{generatedModule.slides.length}</div>
                    <div className="text-xs text-gray-500">Slide</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {generatedModule.slides.filter(s => s.quiz).length}
                    </div>
                    <div className="text-xs text-gray-500">Quiz</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {generatedModule.slides.filter(s => s.noteDocente).length}
                    </div>
                    <div className="text-xs text-gray-500">Note Docente</div>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <h4 className="font-semibold text-gray-700 mb-2">Struttura del modulo:</h4>
                  {generatedModule.slides.map((slide, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{slide.title}</div>
                        <div className="text-xs text-gray-500">{slide.section}</div>
                      </div>
                      <div className="flex gap-1">
                        {slide.videos && slide.videos.length > 0 && <span title="Video">🎥</span>}
                        {slide.articles && slide.articles.length > 0 && <span title="Articoli">📄</span>}
                        {slide.quiz && <span title="Quiz">🧠</span>}
                        {slide.noteDocente && <span title="Note Docente">📋</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={saveGeneratedModule}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    💾 Salva Modulo
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'idle' && !markdownContent && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="font-semibold text-gray-800 mb-4">💡 Come funziona</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <div className="font-medium text-gray-800">Carica il contenuto</div>
                    <div className="text-sm text-gray-500">File .md con i contenuti delle slide</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <div className="font-medium text-gray-800">Aggiungi le note docente <span className="text-gray-400 text-xs">(opzionale)</span></div>
                    <div className="text-sm text-gray-500">File .md con speech per ogni slide</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <div className="font-medium text-gray-800">Genera e salva</div>
                    <div className="text-sm text-gray-500">Claude crea il modulo interattivo</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <h4 className="font-medium text-purple-800 mb-2">🎤 Formato file Note Docente</h4>
                <pre className="text-xs text-purple-700 bg-purple-100 rounded p-2 overflow-x-auto">
{`# Titolo Slide 1

**Durata:** 8-10 min

**Obiettivi:**
- Obiettivo 1
- Obiettivo 2

**Speech:**
Testo dello speech...

**Note:**
- Nota per il docente

**Domande:**
- Domanda suggerita?

---

# Titolo Slide 2
...`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
