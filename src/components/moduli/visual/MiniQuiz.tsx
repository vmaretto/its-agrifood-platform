'use client';

import { useState } from 'react';
import { QuizItem } from '@/types/module';

interface MiniQuizProps extends QuizItem {}

export function MiniQuiz({
  question,
  options,
  correctIndex,
  explanation
}: MiniQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧠</span>
        <span className="font-semibold text-gray-800">Verifica la comprensione</span>
      </div>
      <p className="text-gray-800 mb-4 font-medium">{question}</p>
      <div className="space-y-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={showResult}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              showResult
                ? idx === correctIndex
                  ? 'bg-emerald-100 border-2 border-emerald-500'
                  : idx === selected
                  ? 'bg-red-100 border-2 border-red-500'
                  : 'bg-white border-2 border-gray-200'
                : 'bg-white border-2 border-gray-200 hover:border-indigo-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  showResult && idx === correctIndex
                    ? 'bg-emerald-500 text-white'
                    : showResult && idx === selected
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </div>
          </button>
        ))}
      </div>
      {showResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            selected === correctIndex ? 'bg-emerald-100' : 'bg-amber-100'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span>{selected === correctIndex ? '✅' : '💡'}</span>
            <span className="font-semibold">
              {selected === correctIndex ? 'Corretto!' : 'Non proprio...'}
            </span>
          </div>
          <p className="text-sm text-gray-700">{explanation}</p>
        </div>
      )}
    </div>
  );
}

export default MiniQuiz;
