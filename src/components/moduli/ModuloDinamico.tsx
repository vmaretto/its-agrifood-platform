// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { ModuleJSON, SlideJSON, StatItem, VideoItem, ArticleItem, LinkItem, QuizItem, NoteDocenteItem } from '@/types/module';

// ============================================
// COMPONENTI HELPER
// ============================================

const AnimatedCounter = ({ value, suffix = '', duration = 2000 }: { value: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = duration / end;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}{suffix}</span>;
};

const StatsGrid = ({ stats }: { stats: StatItem[] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {stats.map((stat, idx) => (
      <div key={idx} className={`bg-${stat.color || 'emerald'}-50 rounded-xl p-4 text-center`}>
        <div className="text-3xl mb-2">{stat.icon}</div>
        <div className={`text-2xl font-bold text-${stat.color || 'emerald'}-600`}>
          <AnimatedCounter value={stat.value} suffix={stat.suffix} />
        </div>
        <div className="text-sm text-gray-600">{stat.label}</div>
      </div>
    ))}
  </div>
);

const VideoCard = ({ video }: { video: VideoItem }) => (
  <a
    href={video.url}
    target="_blank"
    rel="noopener noreferrer"
    className="block bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
  >
    <div className={`h-32 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center`}>
      <span className="text-4xl text-white">▶️</span>
    </div>
    <div className="p-4">
      <h4 className="font-semibold text-gray-800 line-clamp-2">{video.title}</h4>
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
        <span>{video.source}</span>
        <span>•</span>
        <span>{video.duration}</span>
        {video.language && (
          <>
            <span>•</span>
            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{video.language}</span>
          </>
        )}
      </div>
    </div>
  </a>
);

const ArticleCard = ({ article }: { article: ArticleItem }) => {
  const typeColors: Record<string, string> = {
    Report: 'bg-blue-100 text-blue-700',
    Articolo: 'bg-green-100 text-green-700',
    Guida: 'bg-purple-100 text-purple-700',
    'Case Study': 'bg-amber-100 text-amber-700',
    Studio: 'bg-indigo-100 text-indigo-700',
    PDF: 'bg-red-100 text-red-700',
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition-shadow"
    >
      <div className="text-3xl">📄</div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800">{article.title}</h4>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
          <span>{article.source}</span>
          {article.year && (
            <>
              <span>•</span>
              <span>{article.year}</span>
            </>
          )}
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[article.type] || 'bg-gray-100 text-gray-700'}`}>
        {article.type}
      </span>
    </a>
  );
};

const LinkCard = ({ link }: { link: LinkItem }) => (
  <a
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
  >
    <span className="text-xl">{link.icon || '🔗'}</span>
    <div className="flex-1">
      <div className="font-medium text-gray-800">{link.title}</div>
      <div className="text-xs text-gray-500">{link.source}</div>
    </div>
    <span className="text-gray-400">→</span>
  </a>
);

const MiniQuiz = ({ quiz }: { quiz: QuizItem }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === quiz.correctIndex;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🧠</span>
        <h4 className="font-bold text-gray-800">Quiz di verifica</h4>
      </div>
      <p className="text-gray-700 mb-4">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            disabled={showResult}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              showResult
                ? idx === quiz.correctIndex
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : idx === selectedAnswer
                  ? 'bg-red-100 border-red-500 text-red-800'
                  : 'bg-white border-gray-200 text-gray-500'
                : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{isCorrect ? '✅' : '💡'}</span>
            <span className="font-semibold">{isCorrect ? 'Corretto!' : 'Non esattamente...'}</span>
          </div>
          <p className="text-sm text-gray-700">{quiz.explanation}</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPALE
// ============================================

interface ModuloDinamicoProps {
  module: ModuleJSON;
  onBack?: () => void;
  isAdmin?: boolean;
  userRole?: 'student' | 'admin';
  setUserRole?: (role: 'student' | 'admin') => void;
}

export default function ModuloDinamico({ module, onBack, isAdmin = false, userRole = 'student', setUserRole }: ModuloDinamicoProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('contenuto');
  const [showSpeechPanel, setShowSpeechPanel] = useState(false);

  const slide = module.slides[currentSlide];
  const progress = ((currentSlide + 1) / module.slides.length) * 100;

  const tabs = [
    { id: 'contenuto', label: 'Contenuto', icon: '📚' },
    { id: 'video', label: 'Video', icon: '🎥', count: slide.videos?.length || 0 },
    { id: 'articoli', label: 'Articoli & PDF', icon: '📄', count: slide.articles?.length || 0 },
    { id: 'link', label: 'Link Esterni', icon: '🔗', count: slide.links?.length || 0 },
  ];

  useEffect(() => {
    setActiveTab('contenuto');
  }, [currentSlide]);

  const goNext = () => {
    if (currentSlide < module.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ← Torna al percorso
                </button>
              )}
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{module.icon}</span>
                <div>
                  <div className="font-semibold text-gray-800">{module.titolo}</div>
                  <div className="text-sm text-gray-500">{slide.section}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Toggle Ruolo */}
              {setUserRole && (
                <button
                  onClick={() => setUserRole(userRole === 'student' ? 'admin' : 'student')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    userRole === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span>{userRole === 'admin' ? '👨‍🏫' : '👨‍🎓'}</span>
                  <span>{userRole === 'admin' ? 'Docente' : 'Studente'}</span>
                </button>
              )}

              {/* Pulsante Note Docente - solo per admin */}
              {isAdmin && slide.noteDocente && (
                <button
                  onClick={() => setShowSpeechPanel(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                >
                  <span>📋</span>
                  <span>Note Docente</span>
                </button>
              )}

              <div className="text-sm text-gray-500">
                Slide {currentSlide + 1} di {module.slides.length}
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
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
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
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
          <div className="text-sm text-indigo-600 font-medium mb-2">{slide.section}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{slide.title}</h2>

          {activeTab === 'contenuto' && (
            <div className="space-y-6">
              {/* Contenuto principale */}
              <div className="prose prose-gray max-w-none">
                {slide.contenuto.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Stats Grid */}
              {slide.stats && slide.stats.length > 0 && (
                <div className="mt-6">
                  <StatsGrid stats={slide.stats} />
                </div>
              )}

              {/* Quiz */}
              {slide.quiz && (
                <div className="mt-6">
                  <MiniQuiz quiz={slide.quiz} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slide.videos && slide.videos.length > 0 ? (
                slide.videos.map((video, idx) => <VideoCard key={idx} video={video} />)
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-8">Nessun video disponibile per questa slide</p>
              )}
            </div>
          )}

          {activeTab === 'articoli' && (
            <div className="space-y-3">
              {slide.articles && slide.articles.length > 0 ? (
                slide.articles.map((article, idx) => <ArticleCard key={idx} article={article} />)
              ) : (
                <p className="text-gray-500 text-center py-8">Nessun articolo disponibile per questa slide</p>
              )}
            </div>
          )}

          {activeTab === 'link' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {slide.links && slide.links.length > 0 ? (
                slide.links.map((link, idx) => <LinkCard key={idx} link={link} />)
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-8">Nessun link disponibile per questa slide</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={goPrev}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentSlide === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            ← Precedente
          </button>
          <button
            onClick={goNext}
            disabled={currentSlide === module.slides.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentSlide === module.slides.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Successiva →
          </button>
        </div>
      </div>

      {/* Speech Panel per Admin */}
      {isAdmin && showSpeechPanel && slide.noteDocente && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowSpeechPanel(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <span className="font-bold text-lg">Note Docente</span>
                </div>
                <button
                  onClick={() => setShowSpeechPanel(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="text-white/90 text-sm">
                Slide {slide.id}: {slide.title}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="bg-white/20 px-2 py-1 rounded text-xs">⏱️ {slide.noteDocente.durata}</span>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Obiettivi */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  🎯 Obiettivi della slide
                </h4>
                <ul className="space-y-1">
                  {slide.noteDocente.obiettivi.map((obj, idx) => (
                    <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Speech */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  🎤 Speech consigliato
                </h4>
                <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {slide.noteDocente.speech}
                </div>
              </div>

              {/* Note */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  📝 Note per il docente
                </h4>
                <ul className="space-y-2">
                  {slide.noteDocente.note.map((nota, idx) => (
                    <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500">⚠️</span>
                      {nota}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Domande suggerite */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                  ❓ Domande da porre alla classe
                </h4>
                <ul className="space-y-2">
                  {slide.noteDocente.domande.map((domanda, idx) => (
                    <li key={idx} className="text-sm text-purple-700 flex items-start gap-2">
                      <span className="text-purple-500 font-bold">{idx + 1}.</span>
                      {domanda}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                Queste note sono visibili solo agli utenti Admin
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
