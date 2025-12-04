'use client';

import React, { useState, useEffect } from 'react';
import { SlideJSON, HackathonConfig, ScheduleItem } from '@/types/module';

interface TimelineSlideProps {
  slide: SlideJSON;
  config: HackathonConfig;
}

export function TimelineSlide({ slide, config }: TimelineSlideProps) {
  const vc = slide.visualContent || {};
  const schedule = vc.schedule as ScheduleItem[] | undefined;
  const tips = vc.tips as { icon: string; text: string }[] | undefined;

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(-1);

  // Calcola la fase corrente in base all'orario
  useEffect(() => {
    const checkCurrentPhase = () => {
      if (!schedule) return;

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      for (let i = 0; i < schedule.length; i++) {
        const item = schedule[i];
        // Estrai orario inizio dalla stringa "09:00 - 09:15"
        const timeRange = item.time.split(' - ');
        const startTime = timeRange[0];
        const endTime = timeRange[1];

        const start = new Date(`${today}T${startTime}:00`);
        const end = new Date(`${today}T${endTime}:00`);

        if (now >= start && now < end) {
          setCurrentPhaseIndex(i);
          return;
        }
      }

      // Se siamo oltre l'ultimo orario, evidenzia l'ultimo
      if (schedule.length > 0) {
        const lastItem = schedule[schedule.length - 1];
        const lastEnd = lastItem.time.split(' - ')[1];
        const lastEndDate = new Date(`${today}T${lastEnd}:00`);
        if (now >= lastEndDate) {
          setCurrentPhaseIndex(schedule.length - 1);
        }
      }
    };

    checkCurrentPhase();
    const interval = setInterval(checkCurrentPhase, 60000); // Aggiorna ogni minuto

    return () => clearInterval(interval);
  }, [schedule]);

  return (
    <div className="space-y-6">
      {/* Intro */}
      {vc.introParagraph && (
        <p className="text-lg text-gray-600">{vc.introParagraph}</p>
      )}

      {/* Timeline */}
      {schedule && schedule.length > 0 && (
        <div className="space-y-3">
          {schedule.map((item, idx) => {
            const isCurrent = idx === currentPhaseIndex;
            const isPast = idx < currentPhaseIndex;

            return (
              <div
                key={idx}
                className={`relative flex items-stretch rounded-2xl overflow-hidden transition-all ${
                  isCurrent
                    ? 'ring-2 ring-offset-2 shadow-lg scale-[1.02]'
                    : isPast
                    ? 'opacity-60'
                    : ''
                }`}
                style={{
                  borderColor: isCurrent ? item.color : undefined,
                  '--tw-ring-color': isCurrent ? item.color : undefined
                } as React.CSSProperties}
              >
                {/* Barra laterale colorata */}
                <div
                  className="w-2 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />

                {/* Contenuto */}
                <div className="flex-1 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{item.phase}</span>
                          {isCurrent && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium text-white animate-pulse"
                              style={{ backgroundColor: item.color }}
                            >
                              IN CORSO
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>

                        {/* Checkpoints */}
                        {item.checkpoints && item.checkpoints.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {item.checkpoints.map((cp, cpIdx) => (
                              <div key={cpIdx} className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{cp.time}</span>
                                <span>{cp.check}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Milestone */}
                        {item.milestone && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                            <span>🏁</span>
                            <span>{item.milestone}</span>
                          </div>
                        )}

                        {/* Order info */}
                        {item.order && (
                          <div className="mt-2 text-xs text-gray-500 italic">
                            {item.order}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Orario e durata */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-sm font-medium text-gray-700">{item.time}</div>
                      <div className="text-xs text-gray-400">{item.duration} min</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
          <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Tips per oggi</span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {tips.map((tip, idx) => (
              <div key={idx} className="flex items-center gap-2 text-amber-700">
                <span className="text-lg">{tip.icon}</span>
                <span className="text-sm">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelineSlide;
