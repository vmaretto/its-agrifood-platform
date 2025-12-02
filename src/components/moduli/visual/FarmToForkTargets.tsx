'use client';

import { ProgressBar } from './ProgressBar';
import { FarmToForkTarget } from '@/types/module';

interface FarmToForkTargetsProps {
  targets: FarmToForkTarget[];
}

export function FarmToForkTargets({ targets }: FarmToForkTargetsProps) {
  const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🇪🇺</span>
        <span className="font-semibold text-gray-800">
          Obiettivi Farm to Fork {targets[0]?.year || 2030}
        </span>
      </div>
      {targets.map((t, idx) => (
        <ProgressBar
          key={idx}
          value={t.target}
          color={colors[idx % colors.length]}
          label={`${t.label} (attuale: ${t.current}%)`}
          delay={idx * 200}
        />
      ))}
      <p className="text-xs text-gray-500 mt-4">
        Fonte: Strategia Farm to Fork - Green Deal Europeo
      </p>
    </div>
  );
}

export default FarmToForkTargets;
