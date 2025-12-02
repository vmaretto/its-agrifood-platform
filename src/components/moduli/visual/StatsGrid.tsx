'use client';

import { AnimatedCounter } from './AnimatedCounter';
import { StatItem } from '@/types/module';

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold text-gray-800">
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
          <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
