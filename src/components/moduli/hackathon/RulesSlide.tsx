'use client';

import React, { useState } from 'react';
import { SlideJSON, PitchFormat, ScoringCriterion, BonusPointItem } from '@/types/module';

interface RulesSlideProps {
  slide: SlideJSON;
}

export function RulesSlide({ slide }: RulesSlideProps) {
  const vc = slide.visualContent || {};
  const pitchFormats = vc.pitchFormats as PitchFormat[] | undefined;
  const scoringCriteria = vc.scoringCriteria as ScoringCriterion[] | undefined;
  const bonusPoints = vc.bonusPoints as BonusPointItem[] | undefined;

  const [selectedFormat, setSelectedFormat] = useState<PitchFormat | null>(null);

  const difficultyColors: Record<string, string> = {
    'Facile': 'bg-green-100 text-green-700',
    'Media': 'bg-amber-100 text-amber-700',
    'Alta': 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-8">
      {/* Intro */}
      {vc.introParagraph && (
        <p className="text-lg text-gray-600">{vc.introParagraph}</p>
      )}

      {/* Pitch Formats */}
      {pitchFormats && pitchFormats.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Scegli il tuo formato</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {pitchFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(selectedFormat?.id === format.id ? null : format)}
                className={`p-4 rounded-xl text-center transition-all ${
                  selectedFormat?.id === format.id
                    ? 'bg-indigo-100 border-2 border-indigo-500 shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md'
                }`}
              >
                <div className="text-4xl mb-2">{format.icon}</div>
                <div className="font-semibold text-gray-800">{format.name}</div>
                <div className="text-xs text-gray-500 mt-1">{format.duration}</div>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${difficultyColors[format.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                  {format.difficulty}
                </span>
              </button>
            ))}
          </div>

          {/* Dettaglio formato selezionato */}
          {selectedFormat && (
            <div className="mt-6 bg-indigo-50 rounded-2xl p-6 border border-indigo-200 animate-in fade-in duration-300">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{selectedFormat.icon}</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-indigo-900">{selectedFormat.name}</h4>
                  <p className="text-indigo-700 mt-1">{selectedFormat.description}</p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <h5 className="font-semibold text-indigo-800 mb-2">🛠️ Tool consigliati</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedFormat.tools.map((tool, idx) => (
                          <span key={idx} className="bg-white px-2 py-1 rounded text-sm text-indigo-700">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-indigo-800 mb-2">🎯 Ideale per</h5>
                      <p className="text-indigo-700 text-sm">{selectedFormat.bestFor}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-semibold text-indigo-800 mb-2">📋 Esempi</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedFormat.examples.map((example, idx) => (
                        <span key={idx} className="bg-indigo-100 px-2 py-1 rounded text-sm text-indigo-700">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scoring Criteria */}
      {scoringCriteria && scoringCriteria.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Criteri di valutazione</h3>
          <div className="space-y-3">
            {scoringCriteria.map((criterion, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-2xl">{criterion.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{criterion.name}</span>
                    <span className="font-bold text-indigo-600">{criterion.weight}%</span>
                  </div>
                  <p className="text-sm text-gray-500">{criterion.description}</p>
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${criterion.weight}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bonus Points */}
      {bonusPoints && bonusPoints.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>Bonus Points</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {bonusPoints.map((bonus, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 flex items-center gap-3">
                <div className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-lg">
                  +{bonus.points}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{bonus.name}</div>
                  <div className="text-sm text-gray-500">{bonus.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Box */}
      {vc.alertBox && (
        <div className={`rounded-2xl p-6 ${
          vc.alertBox.type === 'warning' ? 'bg-red-50 border-2 border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-4">
            <span className="text-3xl">{vc.alertBox.icon}</span>
            <div>
              <h4 className={`font-bold text-lg ${
                vc.alertBox.type === 'warning' ? 'text-red-800' : 'text-blue-800'
              }`}>
                {vc.alertBox.title}
              </h4>
              <p className={`mt-1 ${
                vc.alertBox.type === 'warning' ? 'text-red-700' : 'text-blue-700'
              }`}>
                {vc.alertBox.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RulesSlide;
