'use client';

import React, { useState, useEffect } from 'react';
import { SlideJSON, HackathonConfig } from '@/types/module';
import { CountdownTimer } from './CountdownTimer';

interface HeroSlideProps {
  slide: SlideJSON;
  config: HackathonConfig;
}

// Componente per animare i numeri
const AnimatedCounter = ({ value, suffix = '', duration = 2000 }: { value: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setCount(0);
      return;
    }
    const incrementTime = Math.max(duration / end, 20);
    const timer = setInterval(() => {
      start += Math.ceil(end / (duration / 20));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}{suffix}</span>;
};

interface CountdownConfig {
  enabled?: boolean;
  label?: string;
  showPhase?: boolean;
}

export function HeroSlide({ slide, config }: HeroSlideProps) {
  const vc = slide.visualContent || {};
  const countdown = vc.countdown as CountdownConfig | undefined;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      {vc.heroBanner && (
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white text-center">
          <div className="text-6xl mb-4">{vc.heroBanner.emoji}</div>
          <h1 className="text-4xl font-bold mb-4">{vc.heroBanner.title}</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">{vc.heroBanner.description}</p>
        </div>
      )}

      {/* Countdown */}
      {countdown?.enabled && config && (
        <CountdownTimer config={config} />
      )}

      {/* Stats Grid */}
      {vc.mainStats && vc.mainStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {vc.mainStats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-800">
                <AnimatedCounter value={typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || 0} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Themes/Formats */}
      {vc.themes && vc.themes.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Formati disponibili</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {vc.themes.map((theme, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200"
              >
                <span className="text-xl">{theme.icon}</span>
                <span className="font-medium text-gray-700">{theme.label || theme.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Box */}
      {vc.alertBox && (
        <div className={`rounded-2xl p-6 ${
          vc.alertBox.type === 'success' ? 'bg-emerald-50 border border-emerald-200' :
          vc.alertBox.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
          vc.alertBox.type === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-4">
            <span className="text-3xl">{vc.alertBox.icon}</span>
            <div>
              <h4 className={`font-bold text-lg ${
                vc.alertBox.type === 'success' ? 'text-emerald-800' :
                vc.alertBox.type === 'warning' ? 'text-amber-800' :
                vc.alertBox.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {vc.alertBox.title}
              </h4>
              <p
                className={`mt-1 ${
                  vc.alertBox.type === 'success' ? 'text-emerald-700' :
                  vc.alertBox.type === 'warning' ? 'text-amber-700' :
                  vc.alertBox.type === 'error' ? 'text-red-700' :
                  'text-blue-700'
                }`}
                dangerouslySetInnerHTML={{ __html: vc.alertBox.text || '' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroSlide;
