'use client';

import React, { useState, useEffect } from 'react';
import { HackathonConfig, HackathonPhase } from '@/types/module';

interface CountdownTimerProps {
  config: HackathonConfig;
  compact?: boolean;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function CountdownTimer({ config, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
  const [currentPhase, setCurrentPhase] = useState<HackathonPhase | null>(null);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isNotStarted, setIsNotStarted] = useState(false);

  useEffect(() => {
    const calculateTimeAndPhase = () => {
      const now = new Date();
      const startTime = new Date(config.startTime);
      const endTime = new Date(config.endTime);

      // Se non ancora iniziato
      if (now < startTime) {
        const diff = Math.floor((startTime.getTime() - now.getTime()) / 1000);
        setTimeLeft({
          hours: Math.floor(diff / 3600),
          minutes: Math.floor((diff % 3600) / 60),
          seconds: diff % 60,
          totalSeconds: diff
        });
        setIsNotStarted(true);
        setCurrentPhase(null);
        return;
      }

      // Se terminato
      if (now >= endTime) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
        setIsEnded(true);
        setCurrentPhase(null);
        return;
      }

      setIsNotStarted(false);
      setIsEnded(false);

      // Calcola tempo rimanente fino alla fine
      const diffToEnd = Math.floor((endTime.getTime() - now.getTime()) / 1000);
      setTimeLeft({
        hours: Math.floor(diffToEnd / 3600),
        minutes: Math.floor((diffToEnd % 3600) / 60),
        seconds: diffToEnd % 60,
        totalSeconds: diffToEnd
      });

      // Calcola fase corrente
      const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
      let accumulatedMinutes = 0;

      for (const phase of config.phases) {
        if (elapsedMinutes < accumulatedMinutes + phase.duration) {
          setCurrentPhase(phase);
          // Calcola progresso all'interno della fase
          const phaseElapsed = elapsedMinutes - accumulatedMinutes;
          setPhaseProgress(Math.round((phaseElapsed / phase.duration) * 100));
          break;
        }
        accumulatedMinutes += phase.duration;
      }
    };

    calculateTimeAndPhase();
    const interval = setInterval(calculateTimeAndPhase, 1000);

    return () => clearInterval(interval);
  }, [config]);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 font-mono text-lg font-bold">
          <span className={isEnded ? 'text-gray-400' : 'text-emerald-600'}>
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
        {currentPhase && (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: currentPhase.color }}
          >
            {currentPhase.name}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
      {/* Status */}
      {isNotStarted && (
        <div className="text-center mb-4">
          <span className="text-amber-400 text-sm font-medium">L'hackathon inizia tra:</span>
        </div>
      )}
      {isEnded && (
        <div className="text-center mb-4">
          <span className="text-gray-400 text-sm font-medium">Hackathon terminato</span>
        </div>
      )}

      {/* Countdown principale */}
      <div className="flex justify-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-5xl font-bold font-mono bg-gray-800 rounded-xl px-4 py-2 border border-gray-700">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-400 mt-1">ORE</div>
        </div>
        <div className="text-5xl font-bold text-gray-600">:</div>
        <div className="text-center">
          <div className="text-5xl font-bold font-mono bg-gray-800 rounded-xl px-4 py-2 border border-gray-700">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-400 mt-1">MIN</div>
        </div>
        <div className="text-5xl font-bold text-gray-600">:</div>
        <div className="text-center">
          <div className="text-5xl font-bold font-mono bg-gray-800 rounded-xl px-4 py-2 border border-gray-700 animate-pulse">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-400 mt-1">SEC</div>
        </div>
      </div>

      {/* Fase corrente */}
      {currentPhase && !isEnded && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: currentPhase.color }}
              />
              <span className="font-medium">{currentPhase.name}</span>
            </div>
            <span className="text-sm text-gray-400">{phaseProgress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1000 rounded-full"
              style={{
                width: `${phaseProgress}%`,
                backgroundColor: currentPhase.color
              }}
            />
          </div>
        </div>
      )}

      {/* Timeline fasi */}
      <div className="mt-6 flex gap-1">
        {config.phases.map((phase, idx) => {
          const isActive = currentPhase?.name === phase.name;
          const isPast = config.phases.indexOf(currentPhase!) > idx;

          return (
            <div
              key={idx}
              className="flex-1 group relative"
              style={{ flex: phase.duration }}
            >
              <div
                className={`h-1.5 rounded-full transition-all ${
                  isActive ? 'opacity-100' : isPast ? 'opacity-100' : 'opacity-30'
                }`}
                style={{ backgroundColor: phase.color }}
              />
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {phase.name} ({phase.duration} min)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CountdownTimer;
