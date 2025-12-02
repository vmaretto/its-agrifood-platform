'use client';

import { QuoteItem } from '@/types/module';

interface QuoteBlockProps extends QuoteItem {}

export function QuoteBlock({ text, author, role }: QuoteBlockProps) {
  return (
    <blockquote className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-l-4 border-emerald-500">
      <div className="flex items-start gap-3">
        <span className="text-4xl text-emerald-300">&ldquo;</span>
        <div className="flex-1">
          {text && (
            <p className="text-gray-700 text-lg italic mb-3">{text}</p>
          )}
          {(author || role) && (
            <footer className="flex items-center gap-2">
              {author && (
                <cite className="font-semibold text-gray-800 not-italic">{author}</cite>
              )}
              {role && (
                <span className="text-gray-500 text-sm">— {role}</span>
              )}
            </footer>
          )}
        </div>
      </div>
    </blockquote>
  );
}

export default QuoteBlock;
