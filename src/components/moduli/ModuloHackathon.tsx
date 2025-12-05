// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { ModuleJSON, SlideJSON, HackathonConfig } from '@/types/module';
import { UserProfile } from '@/services/authService';
import {
  CountdownTimer,
  HeroSlide,
  RulesSlide,
  WizardSlide,
  ResourcesSlide,
  TeamsSlide,
  VotingSlide,
  TimelineSlide,
  LeaderboardSlide
} from './hackathon';

interface ModuloHackathonProps {
  module: ModuleJSON;
  onBack?: () => void;
  isAdmin?: boolean;
  currentUser?: UserProfile | null;
}

export default function ModuloHackathon({
  module,
  onBack,
  isAdmin = false,
  currentUser
}: ModuloHackathonProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = module.slides[currentSlide];
  const config = module.config as HackathonConfig | undefined;
  const progress = ((currentSlide + 1) / module.slides.length) * 100;

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

  // Renderizza il componente slide appropriato in base al tipo
  const renderSlideContent = () => {
    switch (slide.type) {
      case 'hero':
        return <HeroSlide slide={slide} config={config!} />;
      case 'rules':
        return <RulesSlide slide={slide} />;
      case 'wizard':
        return <WizardSlide slide={slide} />;
      case 'resources':
        return <ResourcesSlide slide={slide} />;
      case 'teams':
        return <TeamsSlide slide={slide} />;
      case 'voting':
        return <VotingSlide slide={slide} hackathonId={module.id} isAdmin={isAdmin} currentUser={currentUser} />;
      case 'timeline':
        return <TimelineSlide slide={slide} config={config!} />;
      case 'leaderboard':
        return <LeaderboardSlide slide={slide} />;
      default:
        // Fallback: mostra contenuto testuale se presente
        return (
          <div className="prose prose-gray max-w-none">
            {slide.contenuto?.split('\n').map((paragraph, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ← Torna indietro
                </button>
              )}
              <div className="h-6 w-px bg-white/30"></div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{module.icon}</span>
                <div>
                  <div className="font-bold text-lg">{module.titolo}</div>
                  <div className="text-sm text-white/80">{module.descrizione}</div>
                </div>
              </div>
            </div>

            {/* Countdown compatto nell'header */}
            {config && (
              <CountdownTimer config={config} compact />
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm text-white/80">
              {currentSlide + 1}/{module.slides.length}
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div className="bg-white border-b sticky top-[120px] z-40">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {module.slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  idx === currentSlide
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-medium text-sm">{s.section}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Slide Header */}
          <div className="mb-6">
            <div className="text-sm text-indigo-600 font-medium mb-2">{slide.section}</div>
            <h2 className="text-3xl font-bold text-gray-800">{slide.title}</h2>
          </div>

          {/* Slide Content */}
          {renderSlideContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={goPrev}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentSlide === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border shadow-sm'
            }`}
          >
            ← Precedente
          </button>

          {/* Jump to slide */}
          <div className="flex gap-2">
            {module.slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-indigo-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={currentSlide === module.slides.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentSlide === module.slides.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
            }`}
          >
            Successiva →
          </button>
        </div>
      </div>

      {/* Footer con info utente */}
      {currentUser && (
        <div className="fixed bottom-4 left-4 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-3 border border-gray-200">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
            {currentUser.first_name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800">
              {currentUser.first_name} {currentUser.last_name}
            </div>
            <div className="text-xs text-gray-500">
              {isAdmin ? 'Docente' : 'Studente'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
