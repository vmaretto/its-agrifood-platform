'use client';

import { ThemeItem } from '@/types/module';

interface ThemesListProps {
  themes: ThemeItem[];
}

export function ThemesList({ themes }: ThemesListProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {themes.map((theme, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3"
        >
          {theme.icon && (
            <span className="text-2xl">{theme.icon}</span>
          )}
          <span className="font-medium text-gray-800">
            {theme.title || theme.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default ThemesList;
