'use client';

import { ListItemContent } from '@/types/module';

interface ItemsListProps {
  items: ListItemContent[];
  title?: string;
  titleIcon?: string;
  variant?: 'default' | 'vantaggi' | 'solutions' | 'challenges' | 'trends';
}

const variantStyles = {
  default: {
    bg: 'bg-white',
    bullet: 'text-emerald-500',
    highlight: 'bg-emerald-100 text-emerald-800'
  },
  vantaggi: {
    bg: 'bg-emerald-50',
    bullet: 'text-emerald-600',
    highlight: 'bg-emerald-200 text-emerald-900'
  },
  solutions: {
    bg: 'bg-blue-50',
    bullet: 'text-blue-600',
    highlight: 'bg-blue-200 text-blue-900'
  },
  challenges: {
    bg: 'bg-amber-50',
    bullet: 'text-amber-600',
    highlight: 'bg-amber-200 text-amber-900'
  },
  trends: {
    bg: 'bg-purple-50',
    bullet: 'text-purple-600',
    highlight: 'bg-purple-200 text-purple-900'
  }
};

export function ItemsList({ items, title, titleIcon, variant = 'default' }: ItemsListProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`${styles.bg} rounded-xl p-5 shadow-sm`}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {titleIcon && <span className="text-xl">{titleIcon}</span>}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className={`text-xl ${item.icon ? '' : styles.bullet}`}>
              {item.icon || '•'}
            </span>
            <div className="flex-1">
              {(item.title || item.label) && (
                <span
                  className={`font-medium ${
                    item.highlight ? `${styles.highlight} px-2 py-0.5 rounded` : 'text-gray-800'
                  }`}
                >
                  {item.title || item.label}
                </span>
              )}
              {item.text && (
                <span className={`text-gray-700 ${(item.title || item.label) ? ' ml-1' : ''}`}>
                  {item.text}
                </span>
              )}
              {item.description && (
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemsList;
