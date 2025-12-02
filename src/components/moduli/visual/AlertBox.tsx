'use client';

import { AlertBoxItem } from '@/types/module';

interface AlertBoxProps extends AlertBoxItem {}

const typeStyles = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-500',
    defaultIcon: 'ℹ️'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: 'text-amber-500',
    defaultIcon: '⚠️'
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: 'text-emerald-500',
    defaultIcon: '✅'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-500',
    defaultIcon: '❌'
  }
};

export function AlertBox({ type = 'info', icon, title, text }: AlertBoxProps) {
  const styles = typeStyles[type] || typeStyles.info;
  const displayIcon = icon || styles.defaultIcon;

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-xl p-4`}>
      <div className="flex items-start gap-3">
        <span className={`text-xl ${styles.icon}`}>{displayIcon}</span>
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${styles.text} mb-1`}>{title}</h4>
          )}
          {text && (
            <p className={`${styles.text} opacity-90`}>{text}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertBox;
