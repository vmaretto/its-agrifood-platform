'use client';

import { HeroBanner } from '@/types/module';

interface HeroSectionProps {
  emoji?: string;
  title?: string;
  description?: string;
  banner?: HeroBanner;
}

export function HeroSection({ emoji, title, description, banner }: HeroSectionProps) {
  // Se abbiamo un banner completo, usiamo quello
  if (banner) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: banner.bgGradient || 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
        }}
      >
        {banner.emoji && (
          <div className="text-6xl mb-4">{banner.emoji}</div>
        )}
        {banner.title && (
          <h2
            className="text-2xl font-bold text-white mb-3"
            dangerouslySetInnerHTML={{ __html: banner.title }}
          />
        )}
        {banner.description && (
          <p className="text-white/90 text-lg">{banner.description}</p>
        )}
      </div>
    );
  }

  // Altrimenti usiamo i singoli campi
  return (
    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-8 text-center">
      {emoji && (
        <div className="text-6xl mb-4">{emoji}</div>
      )}
      {title && (
        <h2
          className="text-2xl font-bold text-white mb-3"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      )}
      {description && (
        <p className="text-white/90 text-lg">{description}</p>
      )}
    </div>
  );
}

export default HeroSection;
