'use client';

import { AnimatedCounter } from './AnimatedCounter';
import { StatItem } from '@/types/module';

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  // Usa 4 colonne se ci sono 4 stats, altrimenti 2
  const gridCols = stats.length === 4 ? 'grid-cols-4' : 'grid-cols-2';

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-emerald-50 rounded-xl p-4 text-center"
        >
          <div className="text-2xl font-bold text-emerald-600">
            {typeof stat.value === 'number' ? (
              <AnimatedCounter
                end={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix || ''}
              />
            ) : (
              <span>{stat.prefix || ''}{stat.value}{stat.suffix || ''}</span>
            )}
          </div>
          <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
