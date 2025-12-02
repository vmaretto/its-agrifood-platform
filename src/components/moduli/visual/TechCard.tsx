'use client';

import { useState, useEffect } from 'react';
import { TechItem } from '@/types/module';

interface TechCardProps extends TechItem {}

export function TechCard({ name, adoption, icon, description }: TechCardProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(adoption), 100);
    return () => clearTimeout(timer);
  }, [adoption]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="font-semibold text-gray-800">{name}</div>
          {description && (
            <div className="text-xs text-gray-500">{description}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${width}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-emerald-600">{adoption}%</span>
      </div>
    </div>
  );
}

export default TechCard;
