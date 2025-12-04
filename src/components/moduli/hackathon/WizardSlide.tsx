'use client';

import React, { useState, useEffect } from 'react';
import { SlideJSON, WizardStep } from '@/types/module';

interface WizardSlideProps {
  slide: SlideJSON;
}

export function WizardSlide({ slide }: WizardSlideProps) {
  const vc = slide.visualContent || {};
  const wizardSteps = vc.wizardSteps as WizardStep[] | undefined;
  const timerPerStep = vc.timerPerStep as boolean | undefined;
  const introParagraph = vc.introParagraph as string | undefined;
  const canvasTemplate = vc.canvasTemplate as { sections: { id: string; label: string; color: string }[] } | undefined;

  const [currentStep, setCurrentStep] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const step = wizardSteps?.[currentStep];

  // Timer per step
  useEffect(() => {
    if (!isTimerRunning || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const startTimer = () => {
    if (step) {
      setTimeLeft(step.timeMinutes * 60);
      setIsTimerRunning(true);
    }
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const goToStep = (idx: number) => {
    setCurrentStep(idx);
    setShowExample(false);
    setIsTimerRunning(false);
    setTimeLeft(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!wizardSteps || wizardSteps.length === 0) {
    return <p className="text-gray-500">Nessun wizard step disponibile</p>;
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      {introParagraph && (
        <p className="text-lg text-gray-600">{introParagraph}</p>
      )}

      {/* Step Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {wizardSteps && wizardSteps.map((s: WizardStep, idx: number) => (
          <button
            key={idx}
            onClick={() => goToStep(idx)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              idx === currentStep
                ? 'text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: idx === currentStep ? s.color : undefined
            }}
          >
            <span className="font-bold">Step {s.step}</span>
            <span className="text-sm opacity-80">{s.timeMinutes}min</span>
          </button>
        ))}
      </div>

      {/* Current Step */}
      {step && (
        <div
          className="rounded-2xl p-6 border-2"
          style={{ borderColor: step.color, backgroundColor: `${step.color}10` }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
              <p className="text-gray-600 mt-1">{step.subtitle}</p>
            </div>

            {/* Timer */}
            {timerPerStep && (
              <div className="text-right">
                {timeLeft !== null ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={`font-mono text-2xl font-bold ${
                        timeLeft <= 60 ? 'text-red-600 animate-pulse' : 'text-gray-800'
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </div>
                    <button
                      onClick={isTimerRunning ? stopTimer : startTimer}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      {isTimerRunning ? '⏸️' : '▶️'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startTimer}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
                    style={{ backgroundColor: step.color }}
                  >
                    <span>⏱️</span>
                    <span>Avvia Timer ({step.timeMinutes} min)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Prompts */}
          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-700">Domande guida:</h4>
            {step.prompts.map((prompt, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: step.color }}
                >
                  {idx + 1}
                </span>
                <span className="text-gray-700">{prompt}</span>
              </div>
            ))}
          </div>

          {/* Example Toggle */}
          <button
            onClick={() => setShowExample(!showExample)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <span>{showExample ? '🔼' : '🔽'}</span>
            <span className="font-medium">
              {showExample ? 'Nascondi' : 'Mostra'} esempio ({step.example.team})
            </span>
          </button>

          {showExample && (
            <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: step.color }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <span className="font-medium text-gray-700">Esempio: {step.example.team}</span>
              </div>
              <p className="text-gray-600 italic">"{step.example.content}"</p>
            </div>
          )}

          {/* Output */}
          <div className="mt-6 bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📝</span>
              <span className="font-semibold text-gray-700">Output atteso:</span>
            </div>
            <p className="text-gray-600">{step.output}</p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ← Precedente
            </button>
            <button
              onClick={() => goToStep(currentStep + 1)}
              disabled={currentStep === wizardSteps.length - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                currentStep === wizardSteps.length - 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : ''
              }`}
              style={{
                backgroundColor: currentStep === wizardSteps.length - 1 ? undefined : step.color
              }}
            >
              Prossimo →
            </button>
          </div>
        </div>
      )}

      {/* Canvas Template Preview */}
      {canvasTemplate && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h4 className="font-bold text-gray-800 mb-4">📋 Canvas Overview</h4>
          <div className="grid grid-cols-3 gap-2">
            {canvasTemplate.sections.map((section, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-center text-white text-sm font-medium ${
                  wizardSteps.findIndex(s => s.step === idx + 1) === currentStep ? 'ring-2 ring-offset-2 ring-gray-800' : ''
                }`}
                style={{ backgroundColor: section.color }}
              >
                {section.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {slide.links && slide.links.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {slide.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
            >
              <span>{link.icon}</span>
              <span className="font-medium text-gray-700">{link.title}</span>
              <span className="text-gray-400">→</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default WizardSlide;
