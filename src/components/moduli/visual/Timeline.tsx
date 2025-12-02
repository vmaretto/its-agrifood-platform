'use client';

import { TimelineItem } from '@/types/module';

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      {/* Linea verticale */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 to-cyan-400" />

      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={idx} className="relative pl-20">
            {/* Punto sulla timeline */}
            <div className="absolute left-6 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-lg" />

            {/* Card contenuto */}
            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                  {item.year}
                </span>
                <h4 className="font-semibold text-gray-800">{item.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
