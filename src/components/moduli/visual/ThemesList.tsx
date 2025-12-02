'use client';

import { ThemeItem } from '@/types/module';

interface ThemesListProps {
  themes: ThemeItem[];
}

const colorStyles: Record<string, string> = {
  green: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  blue: 'bg-blue-100 border-blue-300 text-blue-800',
  purple: 'bg-purple-100 border-purple-300 text-purple-800',
  yellow: 'bg-amber-100 border-amber-300 text-amber-800',
  red: 'bg-red-100 border-red-300 text-red-800',
  pink: 'bg-pink-100 border-pink-300 text-pink-800',
  orange: 'bg-orange-100 border-orange-300 text-orange-800',
  default: 'bg-gray-100 border-gray-300 text-gray-800'
};

export function ThemesList({ themes }: ThemesListProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {themes.map((theme, idx) => {
        const colorClass = colorStyles[theme.color || 'default'] || colorStyles.default;

        return (
          <div
            key={idx}
            className={`${colorClass} border rounded-xl p-4`}
          >
            <div className="flex items-start gap-3">
              {theme.icon && (
                <span className="text-2xl">{theme.icon}</span>
              )}
              <div className="flex-1">
                {(theme.title || theme.label) && (
                  <h4 className="font-semibold mb-1">{theme.title || theme.label}</h4>
                )}
                {theme.description && (
                  <p className="text-sm opacity-80">{theme.description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ThemesList;
