'use client';

import { StatBoxItem } from '@/types/module';
import { AnimatedCounter } from './AnimatedCounter';

interface StatBoxProps extends StatBoxItem {
  variant?: 'main' | 'secondary' | 'default';
}

export function StatBox({
  value,
  suffix,
  prefix,
  label,
  description,
  bgColor,
  icon,
  variant = 'default'
}: StatBoxProps) {
  const bgStyle = bgColor || (
    variant === 'main' ? 'bg-emerald-500' :
    variant === 'secondary' ? 'bg-blue-500' :
    'bg-white'
  );

  const textColor = bgColor || variant !== 'default' ? 'text-white' : 'text-gray-800';
  const valueColor = bgColor || variant !== 'default' ? 'text-white' : 'text-emerald-600';

  const isNumeric = typeof value === 'number';

  return (
    <div className={`${bgStyle} rounded-2xl p-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        {icon && (
          <span className="text-3xl">{icon}</span>
        )}
        <div className="flex-1">
          <div className={`text-3xl font-bold ${valueColor} mb-1`}>
            {prefix && <span>{prefix}</span>}
            {isNumeric ? (
              <AnimatedCounter end={value as number} />
            ) : (
              <span>{value}</span>
            )}
            {suffix && <span className="text-xl ml-1">{suffix}</span>}
          </div>
          {label && (
            <div className={`font-semibold ${textColor} mb-1`}>{label}</div>
          )}
          {description && (
            <p className={`text-sm ${textColor} opacity-80`}>{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatBox;
