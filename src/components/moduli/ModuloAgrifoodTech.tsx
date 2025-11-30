'use client';

import React, { useState } from 'react';

interface ModuloAgrifoodTechProps {
  onBack: () => void;
}

// Versione placeholder - sarà sostituita con il modulo completo
const ModuloAgrifoodTech: React.FC<ModuloAgrifoodTechProps> = ({ onBack }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('contenuto');

  const slides = [
    { id: 1, section: 'Introduzione', title: 'Tendenze AgrifoodTech', hasQuiz: false },
    { id: 2, section: 'Contesto', title: 'Il Settore in Trasformazione', hasQuiz: false },
    { id: 3, section: 'Supply Chain', title: 'La Filiera Intelligente', hasQuiz: true },
    { id: 4, section: 'Supply Chain', title: 'I Vantaggi della Supply Chain 4.0', hasQuiz: false },
    { id: 5, section: 'Sostenibilità', title: 'La Sostenibilità al Centro', hasQuiz: false },
    { id: 6, section: 'Automazione', title: 'Agricoltura 4.0 e Automazione', hasQuiz: true },
    { id: 7, section: 'Tracciabilità', title: 'Tracciabilità e Trasparenza', hasQuiz: false },
    { id: 8, section: 'Normative', title: 'Pressioni Normative ed ESG', hasQuiz: false },
    { id: 9, section: 'Consumatori', title: 'I Nuovi Consumatori del Vino', hasQuiz: true },
    { id: 10, section: 'Conclusione', title: 'Le 3 Sfide Chiave', hasQuiz: false },
  ];

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  const tabs = [
    { id: 'contenuto', label: 'Contenuto', icon: '📚' },
    { id: 'video', label: 'Video', icon: '🎥', count: 2 },
    { id: 'articoli', label: 'Articoli & PDF', icon: '📄', count: 3 },
    { id: 'link', label: 'Link Esterni', icon: '🔗', count: 4 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Torna al percorso
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <div className="font-semibold text-gray-800">Tendenze AgrifoodTech</div>
                  <div className="text-sm text-gray-500">{slide.section}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Slide {currentSlide + 1} di {slides.length}
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.count && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-sm text-emerald-600 font-medium mb-2">{slide.section}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{slide.title}</h2>

          {activeTab === 'contenuto' && (
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Questo è il contenuto della slide {currentSlide + 1}. La versione completa
                con tutti i contenuti interattivi sarà disponibile a breve.
              </p>

              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                <p className="text-emerald-800">
                  💡 <strong>Nota:</strong> Questa è una versione placeholder. Il modulo
                  completo include contenuti interattivi, video, articoli e quiz.
                </p>
              </div>

              {/* Quick Access */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-3">Approfondisci con:</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('video')}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:border-red-300 hover:bg-red-50 transition-colors"
                  >
                    <span>🎥</span>
                    <span className="text-sm font-medium">2 Video</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('articoli')}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <span>📄</span>
                    <span className="text-sm font-medium">3 Articoli/PDF</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('link')}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <span>🔗</span>
                    <span className="text-sm font-medium">4 Link</span>
                  </button>
                </div>
              </div>

              {slide.hasQuiz && (
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
                  <span>🧠</span>
                  <span>Verifica comprensione</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4">
              <p className="text-gray-500 mb-4">Video di approfondimento per questa sezione</p>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-gray-900 rounded-xl overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
                        <span className="text-white text-xl">▶</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-white font-medium text-sm">
                        Video di esempio {i}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">Fonte • 5:00</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'articoli' && (
            <div className="space-y-3">
              <p className="text-gray-500 mb-4">Articoli e documenti di approfondimento</p>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <div className="font-medium text-gray-800">Articolo di esempio {i}</div>
                      <div className="text-sm text-gray-500">Fonte • 2024</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-3">
              <p className="text-gray-500 mb-4">Link esterni per approfondire</p>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors flex items-center gap-3"
                  >
                    <span className="text-xl">🔗</span>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Link esterno {i}</div>
                      <div className="text-xs text-gray-500">fonte.com</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentSlide === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ← Indietro
          </button>

          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-emerald-500 w-6'
                    : idx < currentSlide
                    ? 'bg-emerald-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentSlide === slides.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            Avanti →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuloAgrifoodTech;
