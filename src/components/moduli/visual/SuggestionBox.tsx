'use client';

import { SuggestionItem } from '@/types/module';

interface SuggestionBoxProps extends SuggestionItem {
  icon?: string;
}

export function SuggestionBox({
  title,
  items,
  color = 'blue',
  icon = '💡'
}: SuggestionBoxProps) {
  const colors = {
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    green: 'from-emerald-50 to-teal-50 border-emerald-200',
    purple: 'from-purple-50 to-pink-50 border-purple-200',
    yellow: 'from-amber-50 to-orange-50 border-amber-200',
    red: 'from-red-50 to-rose-50 border-red-200'
  };

  const colorClass = colors[color] || colors.blue;

  return (
    <div className={`bg-gradient-to-r ${colorClass} rounded-2xl p-5 border`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SuggestionBox;
