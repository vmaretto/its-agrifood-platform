'use client';

import { ESGItem } from '@/types/module';

interface ESGSectionProps {
  items: ESGItem[];
}

const defaultColors = {
  E: 'bg-emerald-500',
  S: 'bg-blue-500',
  G: 'bg-purple-500'
};

export function ESGSection({ items }: ESGSectionProps) {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const bgColor = item.color || (item.letter ? defaultColors[item.letter as keyof typeof defaultColors] : 'bg-gray-500');

        return (
          <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className={`${bgColor} px-4 py-3 flex items-center gap-3`}>
              {item.letter && (
                <span className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {item.letter}
                </span>
              )}
              {item.title && (
                <h4 className="text-white font-semibold text-lg">{item.title}</h4>
              )}
            </div>
            <div className="p-4">
              {item.description && (
                <p className="text-gray-700 mb-3">{item.description}</p>
              )}
              {item.items && item.items.length > 0 && (
                <ul className="space-y-2">
                  {item.items.map((subItem, subIdx) => (
                    <li key={subIdx} className="flex items-start gap-2 text-gray-600">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>{subItem}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ESGSection;
