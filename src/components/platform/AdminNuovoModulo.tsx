// @ts-nocheck
'use client';

import React, { useState, useCallback } from 'react';
import { saveModule, generateModuleId } from '@/services/moduliStorage';
import { ModuleJSON } from '@/types/module';

type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

interface AdminNuovoModuloProps {
  onModuleCreated?: (module: ModuleJSON) => void;
}

export default function AdminNuovoModulo({ onModuleCreated }: AdminNuovoModuloProps) {
  const [markdownContent, setMarkdownContent] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedModule, setGeneratedModule] = useState<ModuleJSON | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = useCallback((file: File) => {
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const generateModule = async () => {
    if (!markdownContent) {
      setErrorMessage('Carica prima un file Markdown');
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nella generazione del modulo');
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

  const saveGeneratedModule = () => {
    if (generatedModule) {
      saveModule(generatedModule);
      onModuleCreated?.(generatedModule);

      // Reset form
      setMarkdownContent('');
      setFileName(null);
      setGeneratedModule(null);
      setStatus('idle');
    }
  };

  const resetForm = () => {
    setMarkdownContent('');
    setFileName(null);
    setStatus('idle');
    setErrorMessage('');
    setGeneratedModule(null);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">🚀 Genera Nuovo Modulo</h1>
        <p className="text-gray-500">Carica un file Markdown e genera automaticamente un modulo interattivo</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Upload & Preview */}
        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`bg-white rounded-2xl shadow-sm p-8 border-2 border-dashed transition-colors ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50'
                : fileName
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {fileName ? (
              <div className="text-center">
                <div className="text-4xl mb-3">📄</div>
                <div className="font-semibold text-gray-800">{fileName}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {markdownContent.length.toLocaleString()} caratteri
                </div>
                <button
                  onClick={resetForm}
                  className="mt-4 text-sm text-red-600 hover:text-red-700"
                >
                  Rimuovi file
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-3">📤</div>
                <div className="font-semibold text-gray-800 mb-2">
                  Trascina qui il file Markdown
                </div>
                <div className="text-sm text-gray-500 mb-4">oppure</div>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Seleziona file
                  </span>
                  <input
                    type="file"
                    accept=".md"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Markdown Preview */}
          {markdownContent && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">👁️ Anteprima Markdown</h3>
              <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {markdownContent.slice(0, 2000)}
                  {markdownContent.length > 2000 && '...'}
                </pre>
              </div>
            </div>
          )}

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
                    <div className="font-medium text-gray-800">Carica il tuo Markdown</div>
                    <div className="text-sm text-gray-500">Trascina o seleziona un file .md con i contenuti del corso</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <div className="font-medium text-gray-800">Claude AI genera il modulo</div>
                    <div className="text-sm text-gray-500">Il contenuto viene trasformato in slide interattive con quiz, video e note docente</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <div className="font-medium text-gray-800">Salva e pubblica</div>
                    <div className="text-sm text-gray-500">Il modulo sarà disponibile per gli studenti nel percorso formativo</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                <h4 className="font-medium text-amber-800 mb-2">📝 Suggerimenti per il Markdown</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Usa titoli (## e ###) per separare le sezioni</li>
                  <li>• Includi numeri e statistiche per generare grafici</li>
                  <li>• Aggiungi domande per suggerire i quiz</li>
                  <li>• Scrivi note per il docente tra [NOTE: ...]</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
