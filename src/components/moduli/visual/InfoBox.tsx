'use client';

import { InfoBoxItem } from '@/types/module';

interface InfoBoxProps extends InfoBoxItem {}

const typeStyles = {
  case: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    header: 'bg-purple-100',
    text: 'text-purple-800',
    defaultIcon: '📋'
  },
  ai: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'bg-blue-100',
    text: 'text-blue-800',
    defaultIcon: '🤖'
  },
  advantage: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    header: 'bg-emerald-100',
    text: 'text-emerald-800',
    defaultIcon: '✨'
  },
  genZ: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    header: 'bg-pink-100',
    text: 'text-pink-800',
    defaultIcon: '🎯'
  },
  generic: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    header: 'bg-gray-100',
    text: 'text-gray-800',
    defaultIcon: '📌'
  }
};

export function InfoBox({ type = 'generic', icon, title, description, items, bgColor }: InfoBoxProps) {
  const styles = typeStyles[type] || typeStyles.generic;
  const displayIcon = icon || styles.defaultIcon;

  const customBg = bgColor ? { backgroundColor: bgColor } : undefined;

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-xl overflow-hidden`}
      style={customBg}
    >
      {title && (
        <div className={`${styles.header} px-4 py-3 flex items-center gap-2`}>
          <span className="text-xl">{displayIcon}</span>
          <h4 className={`font-semibold ${styles.text}`}>{title}</h4>
        </div>
      )}
      <div className="p-4">
        {description && (
          <p className={`${styles.text} mb-3`}>{description}</p>
        )}
        {items && items.length > 0 && (
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className={`flex items-start gap-2 ${styles.text}`}>
                <span className="text-emerald-500 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default InfoBox;
